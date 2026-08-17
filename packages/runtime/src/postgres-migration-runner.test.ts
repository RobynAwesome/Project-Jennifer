import test from "node:test";
import assert from "node:assert/strict";

import {
  PostgresMigrationDriftError,
  PostgresMigrationRunner,
} from "./postgres-migration-runner.js";
import type {
  PostgresClientPort,
  PostgresPoolPort,
  PostgresQueryResult,
} from "./postgres-runtime-gate-ledger.js";

class FakePostgresPool implements PostgresPoolPort {
  readonly applied = new Map<string, string>();
  readonly executedMigrationSql: string[] = [];

  async connect(): Promise<PostgresClientPort> {
    return new FakePostgresClient(this);
  }

  async query<TRow = Record<string, unknown>>(
    _text: string,
    _values?: unknown[],
  ): Promise<PostgresQueryResult<TRow>> {
    return { rows: [], rowCount: 0 };
  }
}

class FakePostgresClient implements PostgresClientPort {
  constructor(private readonly pool: FakePostgresPool) {}

  async query<TRow = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<PostgresQueryResult<TRow>> {
    const normalized = text.replace(/\s+/g, " ").trim();

    if (
      normalized === "BEGIN" ||
      normalized === "COMMIT" ||
      normalized === "ROLLBACK" ||
      normalized.startsWith("SELECT pg_advisory_xact_lock")
    ) {
      return { rows: [], rowCount: 0 };
    }

    if (normalized.startsWith("SELECT checksum FROM jennifer_schema_migrations")) {
      const migrationId = String(values?.[0] ?? "");
      const checksum = this.pool.applied.get(migrationId);
      if (checksum === undefined) return { rows: [], rowCount: 0 };
      return {
        rows: [{ checksum } as unknown as TRow],
        rowCount: 1,
      };
    }

    if (normalized.startsWith("INSERT INTO jennifer_schema_migrations")) {
      const migrationId = String(values?.[0] ?? "");
      const checksum = String(values?.[1] ?? "");
      this.pool.applied.set(migrationId, checksum);
      return { rows: [], rowCount: 1 };
    }

    this.pool.executedMigrationSql.push(text);
    return { rows: [], rowCount: 0 };
  }

  release(): void {}
}

test("migration runner sorts, applies once, and unwraps repository transactions", async () => {
  const pool = new FakePostgresPool();
  const runner = new PostgresMigrationRunner(pool);

  const migrations = [
    {
      id: "0002_second.sql",
      checksum: "sha-second",
      sql: "BEGIN;\nCREATE TABLE second_table (id TEXT);\nCOMMIT;",
    },
    {
      id: "0001_first.sql",
      checksum: "sha-first",
      sql: "BEGIN;\nCREATE TABLE first_table (id TEXT);\nCOMMIT;",
    },
  ];

  const first = await runner.apply(migrations);
  assert.deepEqual(
    first.map((result) => [result.id, result.applied]),
    [
      ["0001_first.sql", true],
      ["0002_second.sql", true],
    ],
  );
  assert.deepEqual(pool.executedMigrationSql, [
    "CREATE TABLE first_table (id TEXT);",
    "CREATE TABLE second_table (id TEXT);",
  ]);

  const second = await runner.apply(migrations);
  assert.deepEqual(
    second.map((result) => [result.id, result.applied]),
    [
      ["0001_first.sql", false],
      ["0002_second.sql", false],
    ],
  );
  assert.equal(pool.executedMigrationSql.length, 2);
});

test("migration runner fails closed on checksum drift", async () => {
  const pool = new FakePostgresPool();
  const runner = new PostgresMigrationRunner(pool);

  await runner.apply([
    {
      id: "0001_locked.sql",
      checksum: "sha-original",
      sql: "BEGIN; SELECT 1; COMMIT;",
    },
  ]);

  await assert.rejects(
    () =>
      runner.apply([
        {
          id: "0001_locked.sql",
          checksum: "sha-mutated",
          sql: "BEGIN; SELECT 2; COMMIT;",
        },
      ]),
    (error: unknown) => error instanceof PostgresMigrationDriftError,
  );
});

test("migration runner rejects duplicate migration ids before execution", async () => {
  const pool = new FakePostgresPool();
  const runner = new PostgresMigrationRunner(pool);

  await assert.rejects(
    () =>
      runner.apply([
        { id: "0001.sql", checksum: "a", sql: "SELECT 1;" },
        { id: "0001.sql", checksum: "b", sql: "SELECT 2;" },
      ]),
    /Duplicate PostgreSQL migration id/,
  );
  assert.equal(pool.executedMigrationSql.length, 0);
});
