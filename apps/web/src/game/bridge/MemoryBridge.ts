import type { MemoryEntry, MemoryKind } from "@jennifer/shared";
import { generateId, now, clamp } from "@jennifer/shared";

/**
 * MemoryBridge – browser-safe, game-local GSMB store.
 *
 * Implements the same MemoryEntry shape defined in @jennifer/shared but does
 * NOT import from @jennifer/memory because that package carries a Prisma
 * dependency that is unsuitable for browser bundling.
 *
 * Pre-seeded with a small set of canonical world memories so the Memory
 * District scene has something to display on first visit.
 */
export class MemoryBridge {
  private readonly entries: Map<string, MemoryEntry> = new Map();

  constructor() {
    this.seed();
  }

  store(
    entry: Omit<MemoryEntry, "id" | "createdAt" | "accessedAt">
  ): MemoryEntry {
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

  query(filter: {
    kind?: MemoryKind;
    tags?: string[];
    limit?: number;
  }): MemoryEntry[] {
    let results = Array.from(this.entries.values());

    if (filter.kind) {
      results = results.filter((e) => e.kind === filter.kind);
    }
    if (filter.tags?.length) {
      results = results.filter((e) =>
        filter.tags!.every((t) => e.tags.includes(t))
      );
    }

    results.sort(
      (a, b) => b.importance - a.importance || b.createdAt - a.createdAt
    );

    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  recent(limit = 5): MemoryEntry[] {
    return Array.from(this.entries.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  size(): number {
    return this.entries.size;
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private seed(): void {
    const seeds: Array<Omit<MemoryEntry, "id" | "createdAt" | "accessedAt">> =
      [
        {
          kind: "semantic",
          subject: "governance.policy",
          content:
            "PolicyEngine initialised with Memory District claim-validation rule.",
          tags: ["governance", "policy", "init"],
          confidence: 0.95,
          importance: 0.9,
          provenance: { source: "game-seed", version: "0.1.0" },
        },
        {
          kind: "episodic",
          subject: "city.founding",
          content:
            "Jennifer City was established when the first governance policy was declared.",
          tags: ["city", "history", "founding"],
          confidence: 0.9,
          importance: 0.8,
          provenance: { source: "game-seed" },
        },
        {
          kind: "semantic",
          subject: "district.memory",
          content:
            "The Memory District preserves all episodic and semantic records of Jennifer's runtime.",
          tags: ["district", "memory", "gsmb"],
          confidence: 0.88,
          importance: 0.75,
          provenance: { source: "game-seed" },
        },
        {
          kind: "procedural",
          subject: "validation.pipeline",
          content:
            "Three-stage pipeline: Policy → Confidence → Reality.  All stages must pass for POC status.",
          tags: ["validation", "pipeline", "poc", "foc"],
          confidence: 0.99,
          importance: 0.95,
          provenance: { source: "game-seed" },
        },
      ];

    for (const seed of seeds) {
      this.store(seed);
    }
  }
}
