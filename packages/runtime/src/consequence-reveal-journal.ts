import type { ConsequenceRevealReceipt } from "@jennifer/shared";

import type {
  PostgresClientPort,
  PostgresPoolPort,
} from "./postgres-runtime-gate-ledger.js";

export interface ConsequenceRevealJournalVersion {
  revealId: string;
  version: number;
  receipt: ConsequenceRevealReceipt;
  persistedAt: number;
}

export interface IConsequenceRevealJournal {
  append(receipt: ConsequenceRevealReceipt): Promise<ConsequenceRevealJournalVersion>;
  getLatest(revealId: string): Promise<ConsequenceRevealJournalVersion | undefined>;
  getHistory(revealId: string): Promise<readonly ConsequenceRevealJournalVersion[]>;
}

export class ConsequenceRevealJournalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConsequenceRevealJournalError";
  }
}

/**
 * Non-authoritative, append-only player-safe reveal projection.
 *
 * The journal never becomes causal authority. Every version must retain the
 * immutable governed origin tuple, while visibility/revision state may advance.
 */
export class InMemoryConsequenceRevealJournal implements IConsequenceRevealJournal {
  private readonly versions = new Map<string, ConsequenceRevealJournalVersion[]>();

  async append(
    receipt: ConsequenceRevealReceipt,
  ): Promise<ConsequenceRevealJournalVersion> {
    validatePlayerSafeReceipt(receipt);
    const history = this.versions.get(receipt.revealId) ?? [];
    const previous = history.at(-1);

    if (previous) {
      if (sameReceipt(previous.receipt, receipt)) return cloneVersion(previous);
      validateAppend(previous.receipt, receipt);
    }

    const version = freezeVersion({
      revealId: receipt.revealId,
      version: history.length + 1,
      receipt: cloneReceipt(receipt),
      persistedAt: Date.now(),
    });
    history.push(version);
    this.versions.set(receipt.revealId, history);
    return cloneVersion(version);
  }

  async getLatest(
    revealId: string,
  ): Promise<ConsequenceRevealJournalVersion | undefined> {
    const version = this.versions.get(revealId)?.at(-1);
    return version ? cloneVersion(version) : undefined;
  }

  async getHistory(
    revealId: string,
  ): Promise<readonly ConsequenceRevealJournalVersion[]> {
    return (this.versions.get(revealId) ?? []).map(cloneVersion);
  }
}

interface ConsequenceRevealRow {
  reveal_id: string;
  version: number;
  receipt_json: unknown;
  persisted_at: string | number | bigint;
}

/**
 * PostgreSQL-backed append-only reveal projection.
 *
 * `consequence_reveal_versions` is deliberately a projection table. It stores
 * only the already-redacted `ConsequenceRevealReceipt`; the authoritative
 * epistemic/runtime receipts remain the source of causal truth.
 */
export class PostgresConsequenceRevealJournal implements IConsequenceRevealJournal {
  constructor(private readonly pool: PostgresPoolPort) {}

  async append(
    receipt: ConsequenceRevealReceipt,
  ): Promise<ConsequenceRevealJournalVersion> {
    validatePlayerSafeReceipt(receipt);
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      // Serialize versions for one reveal without locking unrelated reveals.
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [receipt.revealId]);

      const latest = await this.getLatestWithClient(client, receipt.revealId);
      if (latest) {
        if (sameReceipt(latest.receipt, receipt)) {
          await client.query("COMMIT");
          return latest;
        }
        validateAppend(latest.receipt, receipt);
      }

      const version = (latest?.version ?? 0) + 1;
      const persistedAt = Date.now();
      await client.query(
        `
          INSERT INTO consequence_reveal_versions (
            reveal_id,
            version,
            origin_epistemic_receipt_id,
            origin_event_id,
            origin_actor_id,
            origin_rule_id,
            reveal_state,
            receipt_json,
            persisted_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
        `,
        [
          receipt.revealId,
          version,
          receipt.origin.epistemicReceiptId,
          receipt.origin.eventId,
          receipt.origin.actorId,
          receipt.origin.consequenceRuleId,
          receipt.state,
          JSON.stringify(receipt),
          persistedAt,
        ],
      );
      await client.query("COMMIT");
      return freezeVersion({
        revealId: receipt.revealId,
        version,
        receipt: cloneReceipt(receipt),
        persistedAt,
      });
    } catch (error) {
      await rollbackQuietly(client);
      throw error;
    } finally {
      client.release();
    }
  }

  async getLatest(
    revealId: string,
  ): Promise<ConsequenceRevealJournalVersion | undefined> {
    const result = await this.pool.query<ConsequenceRevealRow>(
      `
        SELECT reveal_id, version, receipt_json, persisted_at
        FROM consequence_reveal_versions
        WHERE reveal_id = $1
        ORDER BY version DESC
        LIMIT 1
      `,
      [revealId],
    );
    return result.rows[0] ? deserializeRow(result.rows[0]) : undefined;
  }

  async getHistory(
    revealId: string,
  ): Promise<readonly ConsequenceRevealJournalVersion[]> {
    const result = await this.pool.query<ConsequenceRevealRow>(
      `
        SELECT reveal_id, version, receipt_json, persisted_at
        FROM consequence_reveal_versions
        WHERE reveal_id = $1
        ORDER BY version ASC
      `,
      [revealId],
    );
    return result.rows.map(deserializeRow);
  }

  private async getLatestWithClient(
    client: PostgresClientPort,
    revealId: string,
  ): Promise<ConsequenceRevealJournalVersion | undefined> {
    const result = await client.query<ConsequenceRevealRow>(
      `
        SELECT reveal_id, version, receipt_json, persisted_at
        FROM consequence_reveal_versions
        WHERE reveal_id = $1
        ORDER BY version DESC
        LIMIT 1
      `,
      [revealId],
    );
    return result.rows[0] ? deserializeRow(result.rows[0]) : undefined;
  }
}

function validatePlayerSafeReceipt(receipt: ConsequenceRevealReceipt): void {
  if (!receipt.revealId.trim()) {
    throw new ConsequenceRevealJournalError("Reveal id is required.");
  }
  if (receipt.canonical !== false || receipt.proofState !== "player-safe-causal-reveal") {
    throw new ConsequenceRevealJournalError(
      "Reveal journal accepts only non-canonical player-safe causal projections.",
    );
  }
  if (receipt.state !== "LATENT" && !receipt.runtimeAdmission) {
    throw new ConsequenceRevealJournalError(
      `Reveal '${receipt.revealId}' cannot persist player-visible state without runtime admission evidence.`,
    );
  }
}

function validateAppend(
  previous: ConsequenceRevealReceipt,
  next: ConsequenceRevealReceipt,
): void {
  if (previous.revealId !== next.revealId) {
    throw new ConsequenceRevealJournalError("A reveal version cannot change revealId.");
  }
  if (JSON.stringify(previous.origin) !== JSON.stringify(next.origin)) {
    throw new ConsequenceRevealJournalError(
      `Reveal '${next.revealId}' cannot rewrite its causal origin.`,
    );
  }
  if (previous.createdAt !== next.createdAt) {
    throw new ConsequenceRevealJournalError(
      `Reveal '${next.revealId}' cannot rewrite its creation timestamp.`,
    );
  }
  if (next.updatedAt < previous.updatedAt) {
    throw new ConsequenceRevealJournalError(
      `Reveal '${next.revealId}' cannot move updatedAt backwards.`,
    );
  }
  if (!isPrefix(previous.interpretationHistory, next.interpretationHistory)) {
    throw new ConsequenceRevealJournalError(
      `Reveal '${next.revealId}' cannot erase or rewrite interpretation history.`,
    );
  }
  if (!isPrefix(previous.revisions, next.revisions)) {
    throw new ConsequenceRevealJournalError(
      `Reveal '${next.revealId}' cannot erase or rewrite revision history.`,
    );
  }
}

function isPrefix(previous: readonly unknown[], next: readonly unknown[]): boolean {
  if (next.length < previous.length) return false;
  return previous.every(
    (value, index) => JSON.stringify(value) === JSON.stringify(next[index]),
  );
}

function sameReceipt(
  left: ConsequenceRevealReceipt,
  right: ConsequenceRevealReceipt,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function deserializeRow(row: ConsequenceRevealRow): ConsequenceRevealJournalVersion {
  const receipt = parseReceipt(row.receipt_json);
  validatePlayerSafeReceipt(receipt);
  return freezeVersion({
    revealId: row.reveal_id,
    version: Number(row.version),
    receipt,
    persistedAt: Number(row.persisted_at),
  });
}

function parseReceipt(value: unknown): ConsequenceRevealReceipt {
  return cloneReceipt(
    (typeof value === "string" ? JSON.parse(value) : value) as ConsequenceRevealReceipt,
  );
}

function cloneReceipt(receipt: ConsequenceRevealReceipt): ConsequenceRevealReceipt {
  return structuredClone(receipt);
}

function freezeVersion(
  version: ConsequenceRevealJournalVersion,
): ConsequenceRevealJournalVersion {
  return Object.freeze({ ...version, receipt: Object.freeze(version.receipt) });
}

function cloneVersion(
  version: ConsequenceRevealJournalVersion,
): ConsequenceRevealJournalVersion {
  return freezeVersion({ ...version, receipt: cloneReceipt(version.receipt) });
}

async function rollbackQuietly(client: PostgresClientPort): Promise<void> {
  try {
    await client.query("ROLLBACK");
  } catch {
    // Preserve the originating error.
  }
}
