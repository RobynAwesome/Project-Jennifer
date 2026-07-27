import type {
  MemoryEntry,
  MemoryQuery,
  MemoryKind,
  ID,
  IEventBus,
  JenniferEventMap,
} from "@jennifer/shared";
import { generateId, now, clamp, isExpired } from "@jennifer/shared";
import { PrismaClient } from "@prisma/client";

export interface IMemoryStore {
  store(entry: Omit<MemoryEntry, "id" | "createdAt" | "accessedAt">): Promise<MemoryEntry>;
  retrieve(id: ID): Promise<MemoryEntry | undefined>;
  query(query: MemoryQuery): Promise<MemoryEntry[]>;
  update(id: ID, patch: Partial<MemoryEntry>): Promise<MemoryEntry | undefined>;
  forget(id: ID): Promise<boolean>;
  consolidate(): Promise<number>;
}

export class InMemoryGSMB implements IMemoryStore {
  private entries: Map<ID, MemoryEntry> = new Map();

  async store(entry: Omit<MemoryEntry, "id" | "createdAt" | "accessedAt">): Promise<MemoryEntry> {
    const full: MemoryEntry = {
      ...entry,
      id: generateId(),
      confidence: clamp(entry.confidence, 0, 1),
      importance: clamp(entry.importance, 0, 1),
      createdAt: now(),
      accessedAt: now(),
    };
    this.entries.set(full.id, full);
    return full;
  }

  async retrieve(id: ID): Promise<MemoryEntry | undefined> {
    const entry = this.entries.get(id);
    if (!entry) return undefined;

    if (isExpired(entry.expiresAt)) {
      this.entries.delete(id);
      return undefined;
    }

    const updated = { ...entry, accessedAt: now() };
    this.entries.set(id, updated);
    return updated;
  }

  async query(query: MemoryQuery): Promise<MemoryEntry[]> {
    const ts = now();
    let results: MemoryEntry[] = [];

    for (const entry of this.entries.values()) {
      if (isExpired(entry.expiresAt)) {
        this.entries.delete(entry.id);
        continue;
      }

      if (query.kind && entry.kind !== query.kind) continue;
      if (query.subject && !entry.subject.includes(query.subject)) continue;
      if (query.minConfidence && entry.confidence < query.minConfidence) continue;
      if (query.after && entry.createdAt < query.after) continue;
      if (query.before && entry.createdAt > query.before) continue;
      if (query.tags?.length) {
        const hasAll = query.tags.every((t) => entry.tags.includes(t));
        if (!hasAll) continue;
      }

      results.push({ ...entry, accessedAt: ts });
    }

    results.sort((a, b) => {
      if (b.importance !== a.importance) return b.importance - a.importance;
      return b.createdAt - a.createdAt;
    });

    if (query.limit) results = results.slice(0, query.limit);
    return results;
  }

  async update(id: ID, patch: Partial<MemoryEntry>): Promise<MemoryEntry | undefined> {
    const existing = this.entries.get(id);
    if (!existing) return undefined;

    const updated: MemoryEntry = {
      ...existing,
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
      accessedAt: now(),
    };
    this.entries.set(id, updated);
    return updated;
  }

  async forget(id: ID): Promise<boolean> {
    return this.entries.delete(id);
  }

  async consolidate(): Promise<number> {
    const DECAY_FACTOR = 0.95;
    const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;
    const current = now();
    let removed = 0;

    for (const [id, entry] of this.entries.entries()) {
      if (isExpired(entry.expiresAt)) {
        this.entries.delete(id);
        removed++;
        continue;
      }

      const isStale = current - entry.accessedAt > STALE_THRESHOLD_MS;
      if (isStale) {
        const decayed = entry.importance * DECAY_FACTOR;
        if (decayed < 0.01) {
          this.entries.delete(id);
          removed++;
        } else {
          this.entries.set(id, { ...entry, importance: decayed });
        }
      }
    }

    return removed;
  }

  size(): number {
    return this.entries.size;
  }
}

export interface ObjectiveWeightVector {
  personal: number;
  workEdu: number;
  relational: number;
}

export interface GSMBWriteEntry {
  kind: MemoryKind;
  subject: string;
  content: unknown;
  tags: string[];
  confidence: number;
  importance: number;
  provenance: Record<string, unknown>;
  omegaContext: ObjectiveWeightVector;
  expiresAt?: number;
}

export interface GSMBReadFilter {
  kind?: MemoryKind;
  subjectContains?: string;
  tags?: string[];
  minConfidence?: number;
  limit?: number;
}

export interface PersistedMemoryEntry extends GSMBWriteEntry {
  id: string;
  createdAt: number;
  accessedAt: number;
}

/**
 * Persistent GSMB backed by Prisma + SQLite.
 * All writes are serialized through a single queue.
 */
export class PrismaGSMB {
  private writeQueue: Promise<void> = Promise.resolve();
  private readonly schemaReady: Promise<void>;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly bus?: IEventBus<JenniferEventMap>
  ) {
    this.schemaReady = this.ensureSchema();
  }

  async enqueueWrite(entry: GSMBWriteEntry): Promise<PersistedMemoryEntry> {
    const task = this.writeQueue.then(async () => this.persist(entry));
    this.writeQueue = task.then(
      () => undefined,
      () => undefined
    );
    return task;
  }

  async flush(): Promise<void> {
    await this.writeQueue;
  }

  async read(filter: GSMBReadFilter = {}): Promise<PersistedMemoryEntry[]> {
    await this.schemaReady;

    const rows = await this.prisma.memoryRecord.findMany({
      where: {
        kind: filter.kind,
        subject: filter.subjectContains ? { contains: filter.subjectContains } : undefined,
        confidence: filter.minConfidence ? { gte: filter.minConfidence } : undefined,
      },
      orderBy: [{ importance: "desc" }, { createdAt: "desc" }],
      take: filter.limit,
    });

    const results = rows
      .map((row) => this.deserializeRow({
        ...row,
        kind: row.kind as MemoryKind,
      }))
      .filter((entry) => {
        if (!filter.tags?.length) return true;
        return filter.tags.every((tag) => entry.tags.includes(tag));
      });

    if (this.bus) {
      await this.bus.publish("jennifer.memory.read", {
        count: results.length,
        filter: {
          ...filter,
        },
        timestamp: now(),
      });
    }

    return results;
  }

  private async persist(entry: GSMBWriteEntry): Promise<PersistedMemoryEntry> {
    await this.schemaReady;

    const createdAt = now();
    const normalized: PersistedMemoryEntry = {
      ...entry,
      id: generateId(),
      confidence: clamp(entry.confidence, 0, 1),
      importance: clamp(entry.importance, 0, 1),
      createdAt,
      accessedAt: createdAt,
    };

    await this.prisma.memoryRecord.create({
      data: {
        id: normalized.id,
        kind: normalized.kind,
        subject: normalized.subject,
        contentJson: JSON.stringify(normalized.content),
        tagsJson: JSON.stringify(normalized.tags),
        confidence: normalized.confidence,
        importance: normalized.importance,
        provenanceJson: JSON.stringify(normalized.provenance),
        omegaJson: JSON.stringify(normalized.omegaContext),
        createdAt: BigInt(normalized.createdAt),
        accessedAt: BigInt(normalized.accessedAt),
        expiresAt: normalized.expiresAt != null ? BigInt(normalized.expiresAt) : null,
      },
    });

    if (this.bus) {
      await this.bus.publish("jennifer.memory.write", {
        memoryId: normalized.id,
        subject: normalized.subject,
        provenance: normalized.provenance,
        timestamp: normalized.createdAt,
      });
    }

    return normalized;
  }

  private deserializeRow(row: {
    id: string;
    kind: MemoryKind;
    subject: string;
    contentJson: string;
    tagsJson: string;
    confidence: number;
    importance: number;
    provenanceJson: string;
    omegaJson: string;
    createdAt: bigint;
    accessedAt: bigint;
    expiresAt: bigint | null;
  }): PersistedMemoryEntry {
    return {
      id: row.id,
      kind: row.kind,
      subject: row.subject,
      content: JSON.parse(row.contentJson),
      tags: JSON.parse(row.tagsJson) as string[],
      confidence: row.confidence,
      importance: row.importance,
      provenance: JSON.parse(row.provenanceJson) as Record<string, unknown>,
      omegaContext: JSON.parse(row.omegaJson) as ObjectiveWeightVector,
      createdAt: Number(row.createdAt),
      accessedAt: Number(row.accessedAt),
      expiresAt: row.expiresAt != null ? Number(row.expiresAt) : undefined,
    };
  }

  private async ensureSchema(): Promise<void> {
    await this.prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS MemoryRecord (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        subject TEXT NOT NULL,
        contentJson TEXT NOT NULL,
        tagsJson TEXT NOT NULL,
        confidence REAL NOT NULL,
        importance REAL NOT NULL,
        provenanceJson TEXT NOT NULL,
        omegaJson TEXT NOT NULL,
        createdAt BIGINT NOT NULL,
        accessedAt BIGINT NOT NULL,
        expiresAt BIGINT
      )
    `;

    await this.prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS TelemetryRecord (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        source TEXT NOT NULL,
        payloadJson TEXT NOT NULL,
        fidelity TEXT NOT NULL,
        contextMode TEXT NOT NULL,
        timestamp BIGINT NOT NULL
      )
    `;

    await this.prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS WorldStateStub (
        id TEXT PRIMARY KEY,
        snapshotJson TEXT NOT NULL,
        createdAt BIGINT NOT NULL
      )
    `;
  }
}

export class ContextManager {
  private contextWindow: MemoryEntry[] = [];
  private readonly maxWindowSize: number;

  constructor(
    private readonly store: IMemoryStore,
    options: { maxWindowSize?: number } = {}
  ) {
    this.maxWindowSize = options.maxWindowSize ?? 20;
  }

  async buildContext(query: MemoryQuery): Promise<MemoryEntry[]> {
    const entries = await this.store.query({
      ...query,
      limit: this.maxWindowSize,
    });
    this.contextWindow = entries;
    return entries;
  }

  getActiveContext(): MemoryEntry[] {
    return [...this.contextWindow];
  }

  clearContext(): void {
    this.contextWindow = [];
  }
}

export class MemoryIndexer {
  private readonly tagIndex = new Map<string, Set<ID>>();
  private readonly kindIndex = new Map<MemoryKind, Set<ID>>();

  index(entry: MemoryEntry): void {
    for (const tag of entry.tags) {
      if (!this.tagIndex.has(tag)) this.tagIndex.set(tag, new Set());
      this.tagIndex.get(tag)!.add(entry.id);
    }

    if (!this.kindIndex.has(entry.kind)) this.kindIndex.set(entry.kind, new Set());
    this.kindIndex.get(entry.kind)!.add(entry.id);
  }

  deindex(entry: MemoryEntry): void {
    for (const tag of entry.tags) {
      this.tagIndex.get(tag)?.delete(entry.id);
    }
    this.kindIndex.get(entry.kind)?.delete(entry.id);
  }

  findByTag(tag: string): ID[] {
    return Array.from(this.tagIndex.get(tag) ?? []);
  }

  findByKind(kind: MemoryKind): ID[] {
    return Array.from(this.kindIndex.get(kind) ?? []);
  }
}
