import type {
  RelationshipContextProjection,
  RelationshipSnapshot,
} from "@jennifer/shared";

import type {
  IRelationshipAuthorityStore,
  IRelationshipProjectionStore,
} from "./relationship-engine.js";
import type { PostgresPoolPort } from "./postgres-runtime-gate-ledger.js";

export interface IRelationshipProjectionEvidenceStore {
  listRelationshipIds(): Promise<string[]>;
}

export interface RelationshipProjectionRebuildResult {
  discovered: number;
  rebuilt: number;
  missingAuthoritativeSnapshots: number;
}

/**
 * Reads PostgreSQL relationship outbox history as the rebuild manifest.
 * Published state is intentionally ignored: rebuild is evidence replay, not
 * mutation of the live pending-delivery queue.
 */
export class PostgresRelationshipProjectionEvidenceStore
  implements IRelationshipProjectionEvidenceStore
{
  constructor(private readonly pool: PostgresPoolPort) {}

  async listRelationshipIds(): Promise<string[]> {
    const result = await this.pool.query<{ aggregate_id: string }>(
      `SELECT DISTINCT aggregate_id
       FROM relationship_outbox_events
       WHERE aggregate_type = 'relationship'
       ORDER BY aggregate_id`,
    );
    return result.rows.map((row) => row.aggregate_id);
  }
}

/**
 * Rebuilds adaptive projections from PostgreSQL evidence without changing
 * outbox publication receipts. Each aggregate is reconstructed from its latest
 * authoritative snapshot and latest authoritative event.
 */
export class RelationshipProjectionRebuilder {
  constructor(
    private readonly authority: IRelationshipAuthorityStore,
    private readonly projections: IRelationshipProjectionStore,
    private readonly evidence: IRelationshipProjectionEvidenceStore,
  ) {}

  async rebuildAll(): Promise<RelationshipProjectionRebuildResult> {
    const relationshipIds = await this.evidence.listRelationshipIds();
    let rebuilt = 0;
    let missingAuthoritativeSnapshots = 0;

    for (const relationshipId of relationshipIds) {
      const snapshot = await this.authority.getSnapshot(relationshipId);
      if (!snapshot) {
        missingAuthoritativeSnapshots += 1;
        continue;
      }

      const latestEventId = latestAuthoritativeEventId(snapshot);
      if (!latestEventId) {
        missingAuthoritativeSnapshots += 1;
        continue;
      }

      await this.projections.upsertFromAuthoritativeSnapshot(
        snapshot,
        latestEventId,
      );
      rebuilt += 1;
    }

    return {
      discovered: relationshipIds.length,
      rebuilt,
      missingAuthoritativeSnapshots,
    };
  }
}

function latestAuthoritativeEventId(
  snapshot: RelationshipSnapshot,
): string | undefined {
  return snapshot.events.at(-1)?.id;
}

export type { RelationshipContextProjection };
