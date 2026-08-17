import {
  now,
  type GovernedRelationship,
  type GovernedRelationshipReceipt,
  type RelationshipActor,
  type RelationshipBoundary,
  type RelationshipEvent,
  type RelationshipOutboxEvent,
  type RelationshipParticipant,
  type RelationshipQuestDecision,
  type RelationshipSnapshot,
} from "@jennifer/shared";

import {
  RelationshipAuthorityDuplicateError,
  type AuthorityCommit,
  type IRelationshipAuthorityStore,
} from "./relationship-engine.js";
import type {
  PostgresClientPort,
  PostgresPoolPort,
} from "./postgres-runtime-gate-ledger.js";

interface RelationshipRow {
  id: string;
  relationship_type: string;
  active_lane: GovernedRelationship["activeLane"];
  status: GovernedRelationship["status"];
  created_by_actor_id: string;
  version: number;
  created_at: string | number | bigint;
  updated_at: string | number | bigint;
}

interface ActorRow {
  id: string;
  actor_type: RelationshipActor["actorType"];
  canonical_name: string;
  companion_id: RelationshipActor["companionId"] | null;
  external_identity_ref: string | null;
  created_at: string | number | bigint;
  updated_at: string | number | bigint;
}

interface ParticipantRow {
  relationship_id: string;
  actor_id: string;
  participant_role: RelationshipParticipant["role"];
  joined_at: string | number | bigint;
  left_at: string | number | bigint | null;
}

interface BoundaryRow {
  id: string;
  relationship_id: string;
  boundary_type: string;
  boundary_value: string;
  declared_by_actor_id: string;
  status: RelationshipBoundary["status"];
  effective_at: string | number | bigint;
  supersedes_boundary_id: string | null;
}

interface EventRow {
  id: string;
  relationship_id: string;
  event_type: RelationshipEvent["eventType"];
  event_version: 1;
  source_actor_id: string;
  correlation_id: string;
  causation_id: string | null;
  idempotency_key: string;
  payload_json: unknown;
  occurred_at: string | number | bigint;
  recorded_at: string | number | bigint;
}

interface ReceiptRow {
  id: string;
  event_id: string;
  relationship_id: string;
  protocol: GovernedRelationshipReceipt["protocol"];
  protocol_version: string;
  result: GovernedRelationshipReceipt["result"];
  checks_json: unknown;
  warnings_json: unknown;
  failure_codes_json: unknown;
  evidence_refs_json: unknown;
  human_validated: boolean;
  integrity_hash: string;
  created_at: string | number | bigint;
}

interface DecisionRow {
  id: string;
  quest_instance_id: string;
  relationship_id: string;
  decision_type: string;
  selected_option: string;
  trigger_event_id: string;
  receipt_id: string;
  created_at: string | number | bigint;
}

interface OutboxRow {
  id: string;
  aggregate_type: "relationship";
  aggregate_id: string;
  event_type: RelationshipEvent["eventType"];
  payload_json: unknown;
  published_at: string | number | bigint | null;
  attempt_count: number;
  last_error: string | null;
  created_at: string | number | bigint;
}

/**
 * PostgreSQL authority adapter for the governed relationship domain.
 *
 * The authoritative relationship mutation, event, validation receipt and
 * outbox record are committed inside one database transaction. An advisory
 * lock on the idempotency key closes the check/commit race across processes.
 */
export class PostgresRelationshipAuthorityStore
  implements IRelationshipAuthorityStore
{
  constructor(private readonly pool: PostgresPoolPort) {}

  async commit(input: AuthorityCommit): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
        [input.event.idempotencyKey],
      );

      const duplicate = await client.query<{ id: string }>(
        `
          SELECT id
          FROM relationship_events
          WHERE idempotency_key = $1
        `,
        [input.event.idempotencyKey],
      );
      if (duplicate.rows[0]) {
        await client.query("COMMIT");
        throw new RelationshipAuthorityDuplicateError(
          input.event.idempotencyKey,
        );
      }

      for (const actor of input.actors ?? []) {
        await client.query(
          `
            INSERT INTO relationship_actors (
              id, actor_type, canonical_name, companion_id,
              external_identity_ref, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET
              actor_type = EXCLUDED.actor_type,
              canonical_name = EXCLUDED.canonical_name,
              companion_id = EXCLUDED.companion_id,
              external_identity_ref = EXCLUDED.external_identity_ref,
              updated_at = EXCLUDED.updated_at
          `,
          [
            actor.id,
            actor.actorType,
            actor.canonicalName,
            actor.companionId ?? null,
            actor.externalIdentityRef ?? null,
            actor.createdAt,
            actor.updatedAt,
          ],
        );
      }

      const relationship = input.relationship;
      await client.query(
        `
          INSERT INTO relationship_instances (
            id, relationship_type, active_lane, status,
            created_by_actor_id, version, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            relationship_type = EXCLUDED.relationship_type,
            active_lane = EXCLUDED.active_lane,
            status = EXCLUDED.status,
            version = EXCLUDED.version,
            updated_at = EXCLUDED.updated_at
        `,
        [
          relationship.id,
          relationship.relationshipType,
          relationship.activeLane,
          relationship.status,
          relationship.createdByActorId,
          relationship.version,
          relationship.createdAt,
          relationship.updatedAt,
        ],
      );

      for (const participant of input.participants ?? []) {
        await client.query(
          `
            INSERT INTO relationship_participants (
              relationship_id, actor_id, participant_role, joined_at, left_at
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (relationship_id, actor_id) DO UPDATE SET
              participant_role = EXCLUDED.participant_role,
              joined_at = EXCLUDED.joined_at,
              left_at = EXCLUDED.left_at
          `,
          [
            participant.relationshipId,
            participant.actorId,
            participant.role,
            participant.joinedAt,
            participant.leftAt ?? null,
          ],
        );
      }

      for (const boundary of input.boundaries ?? []) {
        await client.query(
          `
            INSERT INTO relationship_boundaries (
              id, relationship_id, boundary_type, boundary_value,
              declared_by_actor_id, status, effective_at,
              supersedes_boundary_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
              boundary_type = EXCLUDED.boundary_type,
              boundary_value = EXCLUDED.boundary_value,
              status = EXCLUDED.status,
              effective_at = EXCLUDED.effective_at,
              supersedes_boundary_id = EXCLUDED.supersedes_boundary_id
          `,
          [
            boundary.id,
            boundary.relationshipId,
            boundary.boundaryType,
            boundary.boundaryValue,
            boundary.declaredByActorId,
            boundary.status,
            boundary.effectiveAt,
            boundary.supersedesBoundaryId ?? null,
          ],
        );
      }

      const event = input.event;
      await client.query(
        `
          INSERT INTO relationship_events (
            id, relationship_id, event_type, event_version, source_actor_id,
            correlation_id, causation_id, idempotency_key, payload_json,
            occurred_at, recorded_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)
        `,
        [
          event.id,
          event.relationshipId,
          event.eventType,
          event.eventVersion,
          event.sourceActorId,
          event.correlationId,
          event.causationId ?? null,
          event.idempotencyKey,
          JSON.stringify(event.payload),
          event.occurredAt,
          event.recordedAt,
        ],
      );

      const receipt = input.receipt;
      await client.query(
        `
          INSERT INTO relationship_validation_receipts (
            id, event_id, relationship_id, protocol, protocol_version,
            result, checks_json, warnings_json, failure_codes_json,
            evidence_refs_json, human_validated, integrity_hash, created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb,
            $10::jsonb, $11, $12, $13
          )
        `,
        [
          receipt.id,
          receipt.eventId,
          receipt.relationshipId,
          receipt.protocol,
          receipt.protocolVersion,
          receipt.result,
          JSON.stringify(receipt.checks),
          JSON.stringify(receipt.warnings),
          JSON.stringify(receipt.failureCodes),
          JSON.stringify(receipt.evidenceRefs),
          receipt.humanValidated,
          receipt.integrityHash,
          receipt.createdAt,
        ],
      );

      if (input.decision) {
        const decision = input.decision;
        await client.query(
          `
            INSERT INTO relationship_quest_decisions (
              id, quest_instance_id, relationship_id, decision_type,
              selected_option, trigger_event_id, receipt_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [
            decision.id,
            decision.questInstanceId,
            decision.relationshipId,
            decision.decisionType,
            decision.selectedOption,
            decision.triggerEventId,
            decision.receiptId,
            decision.createdAt,
          ],
        );
      }

      const outbox = input.outbox;
      await client.query(
        `
          INSERT INTO relationship_outbox_events (
            id, aggregate_type, aggregate_id, event_type, payload_json,
            published_at, attempt_count, last_error, created_at
          ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9)
        `,
        [
          outbox.id,
          outbox.aggregateType,
          outbox.aggregateId,
          outbox.eventType,
          JSON.stringify(outbox.payload),
          outbox.publishedAt ?? null,
          outbox.attemptCount,
          outbox.lastError ?? null,
          outbox.createdAt,
        ],
      );

      await client.query("COMMIT");
    } catch (error) {
      if (!(error instanceof RelationshipAuthorityDuplicateError)) {
        await rollbackQuietly(client);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async getSnapshot(
    relationshipId: string,
  ): Promise<RelationshipSnapshot | undefined> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
      const relationshipResult = await client.query<RelationshipRow>(
        `
          SELECT *
          FROM relationship_instances
          WHERE id = $1
        `,
        [relationshipId],
      );
      const relationshipRow = relationshipResult.rows[0];
      if (!relationshipRow) {
        await client.query("COMMIT");
        return undefined;
      }

      const [actors, participants, boundaries, events, receipts, decisions] =
        await Promise.all([
          client.query<ActorRow>(
            `
              SELECT a.*
              FROM relationship_actors a
              INNER JOIN relationship_participants p ON p.actor_id = a.id
              WHERE p.relationship_id = $1
              ORDER BY p.joined_at, a.id
            `,
            [relationshipId],
          ),
          client.query<ParticipantRow>(
            `
              SELECT *
              FROM relationship_participants
              WHERE relationship_id = $1
              ORDER BY joined_at, actor_id
            `,
            [relationshipId],
          ),
          client.query<BoundaryRow>(
            `
              SELECT *
              FROM relationship_boundaries
              WHERE relationship_id = $1
              ORDER BY effective_at, id
            `,
            [relationshipId],
          ),
          client.query<EventRow>(
            `
              SELECT *
              FROM relationship_events
              WHERE relationship_id = $1
              ORDER BY recorded_at, id
            `,
            [relationshipId],
          ),
          client.query<ReceiptRow>(
            `
              SELECT *
              FROM relationship_validation_receipts
              WHERE relationship_id = $1
              ORDER BY created_at, id
            `,
            [relationshipId],
          ),
          client.query<DecisionRow>(
            `
              SELECT *
              FROM relationship_quest_decisions
              WHERE relationship_id = $1
              ORDER BY created_at, id
            `,
            [relationshipId],
          ),
        ]);

      await client.query("COMMIT");
      return {
        relationship: mapRelationship(relationshipRow),
        actors: actors.rows.map(mapActor),
        participants: participants.rows.map(mapParticipant),
        boundaries: boundaries.rows.map(mapBoundary),
        events: events.rows.map(mapEvent),
        receipts: receipts.rows.map(mapReceipt),
        decisions: decisions.rows.map(mapDecision),
      };
    } catch (error) {
      await rollbackQuietly(client);
      throw error;
    } finally {
      client.release();
    }
  }

  async getEventByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<RelationshipEvent | undefined> {
    const result = await this.pool.query<EventRow>(
      `
        SELECT *
        FROM relationship_events
        WHERE idempotency_key = $1
      `,
      [idempotencyKey],
    );
    return result.rows[0] ? mapEvent(result.rows[0]) : undefined;
  }

  async getReceiptByEventId(
    eventId: string,
  ): Promise<GovernedRelationshipReceipt | undefined> {
    const result = await this.pool.query<ReceiptRow>(
      `
        SELECT *
        FROM relationship_validation_receipts
        WHERE event_id = $1
      `,
      [eventId],
    );
    return result.rows[0] ? mapReceipt(result.rows[0]) : undefined;
  }

  async listPendingOutbox(limit = 100): Promise<RelationshipOutboxEvent[]> {
    const normalizedLimit = Math.max(1, Math.min(Math.trunc(limit), 1_000));
    const result = await this.pool.query<OutboxRow>(
      `
        SELECT *
        FROM relationship_outbox_events
        WHERE published_at IS NULL
        ORDER BY created_at, id
        LIMIT $1
      `,
      [normalizedLimit],
    );
    return result.rows.map(mapOutbox);
  }

  async markOutboxPublished(outboxId: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE relationship_outbox_events
        SET published_at = $2,
            last_error = NULL
        WHERE id = $1
      `,
      [outboxId, now()],
    );
  }

  async markOutboxFailed(outboxId: string, error: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE relationship_outbox_events
        SET attempt_count = attempt_count + 1,
            last_error = $2
        WHERE id = $1
      `,
      [outboxId, error],
    );
  }
}

function mapRelationship(row: RelationshipRow): GovernedRelationship {
  return {
    id: row.id,
    relationshipType: row.relationship_type,
    activeLane: row.active_lane,
    status: row.status,
    createdByActorId: row.created_by_actor_id,
    version: Number(row.version),
    createdAt: toEpoch(row.created_at),
    updatedAt: toEpoch(row.updated_at),
  };
}

function mapActor(row: ActorRow): RelationshipActor {
  return {
    id: row.id,
    actorType: row.actor_type,
    canonicalName: row.canonical_name,
    companionId: row.companion_id ?? undefined,
    externalIdentityRef: row.external_identity_ref ?? undefined,
    createdAt: toEpoch(row.created_at),
    updatedAt: toEpoch(row.updated_at),
  };
}

function mapParticipant(row: ParticipantRow): RelationshipParticipant {
  return {
    relationshipId: row.relationship_id,
    actorId: row.actor_id,
    role: row.participant_role,
    joinedAt: toEpoch(row.joined_at),
    leftAt: optionalEpoch(row.left_at),
  };
}

function mapBoundary(row: BoundaryRow): RelationshipBoundary {
  return {
    id: row.id,
    relationshipId: row.relationship_id,
    boundaryType: row.boundary_type,
    boundaryValue: row.boundary_value,
    declaredByActorId: row.declared_by_actor_id,
    status: row.status,
    effectiveAt: toEpoch(row.effective_at),
    supersedesBoundaryId: row.supersedes_boundary_id ?? undefined,
  };
}

function mapEvent(row: EventRow): RelationshipEvent {
  return {
    id: row.id,
    relationshipId: row.relationship_id,
    eventType: row.event_type,
    eventVersion: 1,
    sourceActorId: row.source_actor_id,
    correlationId: row.correlation_id,
    causationId: row.causation_id ?? undefined,
    idempotencyKey: row.idempotency_key,
    payload: jsonRecord(row.payload_json),
    occurredAt: toEpoch(row.occurred_at),
    recordedAt: toEpoch(row.recorded_at),
  };
}

function mapReceipt(row: ReceiptRow): GovernedRelationshipReceipt {
  return {
    id: row.id,
    eventId: row.event_id,
    relationshipId: row.relationship_id,
    protocol: row.protocol,
    protocolVersion: row.protocol_version,
    result: row.result,
    checks: jsonValue<GovernedRelationshipReceipt["checks"]>(row.checks_json),
    warnings: jsonValue<string[]>(row.warnings_json),
    failureCodes: jsonValue<string[]>(row.failure_codes_json),
    evidenceRefs: jsonValue<string[]>(row.evidence_refs_json),
    humanValidated: row.human_validated,
    integrityHash: row.integrity_hash,
    createdAt: toEpoch(row.created_at),
  };
}

function mapDecision(row: DecisionRow): RelationshipQuestDecision {
  return {
    id: row.id,
    questInstanceId: row.quest_instance_id,
    relationshipId: row.relationship_id,
    decisionType: row.decision_type,
    selectedOption: row.selected_option,
    triggerEventId: row.trigger_event_id,
    receiptId: row.receipt_id,
    createdAt: toEpoch(row.created_at),
  };
}

function mapOutbox(row: OutboxRow): RelationshipOutboxEvent {
  return {
    id: row.id,
    aggregateType: "relationship",
    aggregateId: row.aggregate_id,
    eventType: row.event_type,
    payload: jsonRecord(row.payload_json),
    publishedAt: optionalEpoch(row.published_at),
    attemptCount: Number(row.attempt_count),
    lastError: row.last_error ?? undefined,
    createdAt: toEpoch(row.created_at),
  };
}

function jsonRecord(value: unknown): Record<string, unknown> {
  return jsonValue<Record<string, unknown>>(value);
}

function jsonValue<T>(value: unknown): T {
  if (typeof value === "string") return JSON.parse(value) as T;
  return value as T;
}

function toEpoch(value: string | number | bigint): number {
  const epoch = Number(value);
  if (!Number.isFinite(epoch)) {
    throw new Error(`Invalid PostgreSQL epoch value: ${String(value)}`);
  }
  return epoch;
}

function optionalEpoch(
  value: string | number | bigint | null,
): number | undefined {
  return value === null ? undefined : toEpoch(value);
}

async function rollbackQuietly(client: PostgresClientPort): Promise<void> {
  try {
    await client.query("ROLLBACK");
  } catch {
    // Preserve the authoritative persistence failure.
  }
}
