import type {
  MemoryEntry,
  MemoryQuery,
  MemoryKind,
  ID,
} from "@jennifer/shared";
import { generateId, now, clamp, isExpired } from "@jennifer/shared";

/**
 * Grounded State Memory Buffer (GSMB)
 *
 * Persistent, queryable memory store for the Jennifer runtime.
 * Supports five memory kinds: episodic, semantic, procedural, working,
 * and collective. All reads update the `accessedAt` timestamp to enable
 * LRU-style eviction and importance decay.
 *
 * This in-process implementation is the reference; a database-backed
 * adapter (Prisma + SQLite) should be injected in production by
 * implementing IMemoryStore.
 */
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

    // Sort by importance descending, then recency.
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

  /**
   * Consolidation pass: removes expired entries and decays the
   * importance of entries that haven't been accessed recently.
   * Returns the number of entries removed.
   */
  async consolidate(): Promise<number> {
    const DECAY_FACTOR = 0.95;
    const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
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

/**
 * ContextManager maintains the current active context window –
 * a small slice of the most relevant memories used to ground
 * the LLM's reasoning.
 */
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

/**
 * MemoryIndexer maintains tag and kind indexes for fast retrieval.
 */
export class MemoryIndexer {
  private readonly tagIndex = new Map<string, Set<ID>>();
  private readonly kindIndex = new Map<MemoryKind, Set<ID>>();

  index(entry: MemoryEntry): void {
    // Tag index
    for (const tag of entry.tags) {
      if (!this.tagIndex.has(tag)) this.tagIndex.set(tag, new Set());
      this.tagIndex.get(tag)!.add(entry.id);
    }

    // Kind index
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
