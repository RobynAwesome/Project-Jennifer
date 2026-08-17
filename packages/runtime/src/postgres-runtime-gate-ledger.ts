import { now } from "@jennifer/shared";
import type { MemoryReceipt } from "@jennifer/memory";

import type {
  IRuntimeGateLedger,
  RuntimeGateLedgerRecord,
  RuntimeGateLedgerReservation,
  RuntimeGateLedgerState,
} from "./runtime-gate-ledger.js";

export interface PostgresQueryResult<TRow = Record<string, unknown>> {
  rows: TRow[];
  rowCount?: number | null;
}

export interface PostgresClientPort {
  query<TRow = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<PostgresQueryResult<TRow>>;
  release(): void;
}

/**
 * Structural port intentionally compatible with a `pg.Pool`-style adapter.
 * Project Jennifer keeps the concrete driver outside domain code so database
 * authority and transaction semantics remain explicit.
 */
export interface PostgresPoolPort {
  connect(): Promise<PostgresClientPort>;
  query<TRow = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<PostgresQueryResult<TRow>>;
}

interface RuntimeGateLedgerRow {
  action_id: string;
  decision: RuntimeGateLedgerRecord["decision"];
  state: RuntimeGateLedgerState;
  reasons_json: unknown;
  evaluation_json: unknown;
  receipt_json: unknown;
  mutation_applied: boolean;
  output_json: unknown | null;
  error_message: string | null;
  prepared_at: string | number | bigint;
  updated_at: string | number | bigint;
}

/**
 * PostgreSQL implementation of the POC/FOC runtime action ledger.
 *
 * The first insert reserves `action_id` under a database uniqueness constraint.
 * Only the runtime that creates that reservation may invoke the mutation.
 * A second runtime receives the already persisted receipt/result instead of
 * re-running the action.
 */
export class PostgresRuntimeGateLedger implements IRuntimeGateLedger {
  constructor(private readonly pool: PostgresPoolPort) {}

  async get<TOutput = unknown>(
    actionId: string,
  ): Promise<RuntimeGateLedgerRecord<TOutput> | undefined> {
    const result = await this.pool.query<RuntimeGateLedgerRow>(
      `
        SELECT
          action.action_id,
          action.decision,
          action.state,
          action.reasons_json,
          action.evaluation_json,
          receipt.receipt_json,
          action.mutation_applied,
          action.output_json,
          action.error_message,
          action.prepared_at,
          action.updated_at
        FROM runtime_gate_actions AS action
        INNER JOIN memory_receipts AS receipt
          ON receipt.id = action.receipt_id
        WHERE action.action_id = $1
      `,
      [actionId],
    );

    const row = result.rows[0];
    return row ? deserializeRow<TOutput>(row) : undefined;
  }

  async reserve<TOutput = unknown>(
    record: RuntimeGateLedgerRecord<TOutput>,
  ): Promise<RuntimeGateLedgerReservation<TOutput>> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
          INSERT INTO memory_receipts (
            id,
            subject,
            concept_state,
            admission,
            receipt_json,
            created_at
          ) VALUES ($1, $2, $3, $4, $5::jsonb, $6)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          record.memoryReceipt.id,
          record.memoryReceipt.subject,
          record.memoryReceipt.conceptState,
          record.memoryReceipt.admission,
          stringifyJson(record.memoryReceipt),
          record.memoryReceipt.createdAt,
        ],
      );

      const inserted = await client.query<{ action_id: string }>(
        `
          INSERT INTO runtime_gate_actions (
            action_id,
            decision,
            state,
            reasons_json,
            evaluation_json,
            receipt_id,
            mutation_applied,
            output_json,
            error_message,
            prepared_at,
            updated_at
          ) VALUES (
            $1,
            $2,
            $3,
            $4::jsonb,
            $5::jsonb,
            $6,
            $7,
            $8::jsonb,
            $9,
            $10,
            $11
          )
          ON CONFLICT (action_id) DO NOTHING
          RETURNING action_id
        `,
        [
          record.actionId,
          record.decision,
          record.state,
          stringifyJson(record.reasons),
          stringifyJson(record.evaluation),
          record.memoryReceipt.id,
          record.mutationApplied,
          stringifyJsonOrNull(record.output),
          record.error ?? null,
          record.preparedAt,
          record.updatedAt,
        ],
      );

      if ((inserted.rowCount ?? inserted.rows.length) === 0) {
        // Roll back the losing receipt insert too. The winning action/receipt is
        // already authoritative and will be loaded outside this transaction.
        await client.query("ROLLBACK");
        const existing = await this.get<TOutput>(record.actionId);
        if (!existing) {
          throw new Error(
            `Runtime gate action ${record.actionId} conflicted but could not be reloaded.`,
          );
        }
        return { created: false, record: existing };
      }

      await client.query("COMMIT");
      return { created: true, record: structuredClone(record) };
    } catch (error) {
      await rollbackQuietly(client);
      throw error;
    } finally {
      client.release();
    }
  }

  async markApplied<TOutput = unknown>(
    actionId: string,
    output: TOutput,
  ): Promise<RuntimeGateLedgerRecord<TOutput>> {
    const updatedAt = now();
    await this.pool.query(
      `
        UPDATE runtime_gate_actions
        SET
          state = 'applied',
          mutation_applied = TRUE,
          output_json = $2::jsonb,
          error_message = NULL,
          updated_at = $3
        WHERE action_id = $1 AND state = 'prepared'
      `,
      [actionId, stringifyJsonOrNull(output), updatedAt],
    );

    const record = await this.get<TOutput>(actionId);
    if (!record) {
      throw new Error(`Runtime gate ledger record not found: ${actionId}`);
    }
    if (record.state !== "applied") {
      throw new Error(
        `Runtime gate action ${actionId} could not transition to applied from ${record.state}.`,
      );
    }
    return record;
  }

  async markFailed(
    actionId: string,
    error: string,
  ): Promise<RuntimeGateLedgerRecord> {
    const updatedAt = now();
    await this.pool.query(
      `
        UPDATE runtime_gate_actions
        SET
          state = 'failed',
          mutation_applied = FALSE,
          error_message = $2,
          updated_at = $3
        WHERE action_id = $1 AND state = 'prepared'
      `,
      [actionId, error, updatedAt],
    );

    const record = await this.get(actionId);
    if (!record) {
      throw new Error(`Runtime gate ledger record not found: ${actionId}`);
    }
    if (record.state !== "failed") {
      throw new Error(
        `Runtime gate action ${actionId} could not transition to failed from ${record.state}.`,
      );
    }
    return record;
  }
}

function deserializeRow<TOutput>(
  row: RuntimeGateLedgerRow,
): RuntimeGateLedgerRecord<TOutput> {
  const output =
    row.output_json == null ? undefined : parseJsonValue<TOutput>(row.output_json);

  return {
    actionId: row.action_id,
    decision: row.decision,
    state: row.state,
    reasons: parseJsonValue<string[]>(row.reasons_json),
    evaluation: parseJsonValue(row.evaluation_json),
    memoryReceipt: parseJsonValue<MemoryReceipt>(row.receipt_json),
    mutationApplied: row.mutation_applied,
    ...(output === undefined ? {} : { output }),
    ...(row.error_message == null ? {} : { error: row.error_message }),
    preparedAt: toEpoch(row.prepared_at),
    updatedAt: toEpoch(row.updated_at),
  };
}

function parseJsonValue<T>(value: unknown): T {
  if (typeof value === "string") return JSON.parse(value) as T;
  return structuredClone(value) as T;
}

function stringifyJson(value: unknown): string {
  const serialized = JSON.stringify(value, (_key, candidate) =>
    typeof candidate === "bigint" ? candidate.toString() : candidate,
  );
  if (serialized === undefined) {
    throw new Error("Value is not JSON serializable.");
  }
  return serialized;
}

function stringifyJsonOrNull(value: unknown): string {
  if (value === undefined) return "null";
  try {
    return stringifyJson(value);
  } catch {
    // Runtime output is optional replay metadata. Failure to serialize it must
    // not convert an already-executed governed mutation into a second attempt.
    return "null";
  }
}

function toEpoch(value: string | number | bigint): number {
  return typeof value === "number" ? value : Number(value);
}

async function rollbackQuietly(client: PostgresClientPort): Promise<void> {
  try {
    await client.query("ROLLBACK");
  } catch {
    // Preserve the original failure. Connection teardown remains the pool's
    // responsibility after release().
  }
}
