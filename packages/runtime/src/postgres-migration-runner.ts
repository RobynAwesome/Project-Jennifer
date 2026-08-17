import { now } from "@jennifer/shared";

import type {
  PostgresClientPort,
  PostgresPoolPort,
} from "./postgres-runtime-gate-ledger.js";

export interface PostgresMigration {
  id: string;
  checksum: string;
  sql: string;
}

export interface PostgresMigrationResult {
  id: string;
  checksum: string;
  applied: boolean;
}

export class PostgresMigrationDriftError extends Error {
  readonly migrationId: string;
  readonly expectedChecksum: string;
  readonly actualChecksum: string;

  constructor(input: {
    migrationId: string;
    expectedChecksum: string;
    actualChecksum: string;
  }) {
    super(
      `PostgreSQL migration ${input.migrationId} checksum drift: persisted ${input.expectedChecksum}, received ${input.actualChecksum}.`,
    );
    this.name = "PostgresMigrationDriftError";
    this.migrationId = input.migrationId;
    this.expectedChecksum = input.expectedChecksum;
    this.actualChecksum = input.actualChecksum;
  }
}

interface MigrationLedgerRow {
  checksum: string;
}

const MIGRATION_LEDGER_TABLE = "jennifer_schema_migrations";
const MIGRATION_ADVISORY_LOCK =
  "SELECT pg_advisory_xact_lock(hashtextextended('project-jennifer-schema-migrations', 0))";

/**
 * Deterministic PostgreSQL migration boundary.
 *
 * - migration IDs are sorted before execution;
 * - a PostgreSQL transaction-scoped advisory lock serializes runners;
 * - each applied migration is pinned by checksum;
 * - a checksum mismatch fails closed instead of mutating an existing database;
 * - repository migrations may retain their standalone BEGIN/COMMIT wrapper;
 *   the runner removes only the outer wrapper so the migration body and ledger
 *   receipt commit atomically in one transaction.
 */
export class PostgresMigrationRunner {
  constructor(private readonly pool: PostgresPoolPort) {}

  async apply(
    migrations: readonly PostgresMigration[],
  ): Promise<PostgresMigrationResult[]> {
    const ordered = normalizeMigrations(migrations);

    await this.pool.query(
      `
        CREATE TABLE IF NOT EXISTS ${MIGRATION_LEDGER_TABLE} (
          migration_id TEXT PRIMARY KEY,
          checksum TEXT NOT NULL,
          applied_at BIGINT NOT NULL
        )
      `,
    );

    const results: PostgresMigrationResult[] = [];
    for (const migration of ordered) {
      results.push(await this.applyOne(migration));
    }
    return results;
  }

  private async applyOne(
    migration: PostgresMigration,
  ): Promise<PostgresMigrationResult> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(MIGRATION_ADVISORY_LOCK);

      const existing = await client.query<MigrationLedgerRow>(
        `
          SELECT checksum
          FROM ${MIGRATION_LEDGER_TABLE}
          WHERE migration_id = $1
        `,
        [migration.id],
      );

      const persistedChecksum = existing.rows[0]?.checksum;
      if (persistedChecksum !== undefined) {
        if (persistedChecksum !== migration.checksum) {
          throw new PostgresMigrationDriftError({
            migrationId: migration.id,
            expectedChecksum: persistedChecksum,
            actualChecksum: migration.checksum,
          });
        }

        await client.query("COMMIT");
        return {
          id: migration.id,
          checksum: migration.checksum,
          applied: false,
        };
      }

      await client.query(unwrapOuterTransaction(migration.sql));
      await client.query(
        `
          INSERT INTO ${MIGRATION_LEDGER_TABLE} (
            migration_id,
            checksum,
            applied_at
          ) VALUES ($1, $2, $3)
        `,
        [migration.id, migration.checksum, now()],
      );
      await client.query("COMMIT");

      return {
        id: migration.id,
        checksum: migration.checksum,
        applied: true,
      };
    } catch (error) {
      await rollbackQuietly(client);
      throw error;
    } finally {
      client.release();
    }
  }
}

function normalizeMigrations(
  migrations: readonly PostgresMigration[],
): PostgresMigration[] {
  const normalized = migrations.map((migration) => {
    const id = migration.id.trim();
    const checksum = migration.checksum.trim();
    const sql = migration.sql.trim();

    if (!id) throw new Error("PostgreSQL migration id is required.");
    if (!checksum) {
      throw new Error(`PostgreSQL migration ${id} checksum is required.`);
    }
    if (!sql) throw new Error(`PostgreSQL migration ${id} SQL is empty.`);

    return { id, checksum, sql };
  });

  const seen = new Set<string>();
  for (const migration of normalized) {
    if (seen.has(migration.id)) {
      throw new Error(`Duplicate PostgreSQL migration id: ${migration.id}`);
    }
    seen.add(migration.id);
  }

  return normalized.sort((left, right) =>
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
  );
}

function unwrapOuterTransaction(sql: string): string {
  const trimmed = sql.trim();
  const withoutBegin = trimmed.replace(/^BEGIN;\s*/i, "");
  const withoutCommit = withoutBegin.replace(/\s*COMMIT;\s*$/i, "");
  const body = withoutCommit.trim();

  if (!body) {
    throw new Error("PostgreSQL migration body is empty after transaction unwrap.");
  }

  return body;
}

async function rollbackQuietly(client: PostgresClientPort): Promise<void> {
  try {
    await client.query("ROLLBACK");
  } catch {
    // Preserve the migration failure. The pool owns connection teardown.
  }
}
