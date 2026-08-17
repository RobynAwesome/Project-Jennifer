import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { Pool, type PoolClient } from "pg";

import {
  IdempotencyGuardedRelationshipAuthorityStore,
  InMemoryRelationshipAuthorityStore,
  InMemoryRelationshipProjectionStore,
  PostgresMigrationRunner,
  PostgresRelationshipAuthorityStore,
  RelationshipEngine,
  type PostgresClientPort,
  type PostgresPoolPort,
  type PostgresQueryResult,
} from "@jennifer/runtime";
import {
  readPostgresConfig,
  type PostgresConnectionConfig,
} from "@jennifer/shared";
import type { TelemetryCollector } from "@jennifer/telemetry";

export type JenniferPersistenceMode = "in-memory" | "postgres";

export interface JenniferPersistenceHealth {
  mode: JenniferPersistenceMode;
  authority: "in-memory-poc" | "postgresql";
  durable: boolean;
  database: "not-configured" | "ready" | "unavailable";
  migrationCount: number;
  error?: string;
}

export interface JenniferPersistenceRuntime {
  mode: JenniferPersistenceMode;
  relationshipEngine: RelationshipEngine;
  health(): Promise<JenniferPersistenceHealth>;
  close(): Promise<void>;
}

export async function initializePersistence(input: {
  env: Readonly<Record<string, string | undefined>>;
  telemetry: TelemetryCollector;
}): Promise<JenniferPersistenceRuntime> {
  const mode = readPersistenceMode(input.env);

  if (mode === "in-memory") {
    const authority = new IdempotencyGuardedRelationshipAuthorityStore(
      new InMemoryRelationshipAuthorityStore(),
    );
    const relationshipEngine = new RelationshipEngine(
      authority,
      new InMemoryRelationshipProjectionStore(),
    );

    await emitLifecycle(input.telemetry, "persistence.ready", {
      mode,
      durable: false,
      authority: "in-memory-poc",
    });

    return {
      mode,
      relationshipEngine,
      async health() {
        return {
          mode,
          authority: "in-memory-poc",
          durable: false,
          database: "not-configured",
          migrationCount: 0,
        };
      },
      async close() {},
    };
  }

  const config = readPostgresConfig(input.env);
  const pool = new Pool(toPgPoolConfig(config));
  const observed = new ObservedPostgresPool(pool, input.telemetry);

  try {
    await observed.query("SELECT 1 AS jennifer_postgres_ready");
    const migrations = await loadPostgresMigrations();
    const results = await new PostgresMigrationRunner(observed).apply(migrations);
    const relationshipEngine = new RelationshipEngine(
      new PostgresRelationshipAuthorityStore(observed),
      new InMemoryRelationshipProjectionStore(),
    );
    let databaseState: "ready" | "unavailable" = "ready";

    await emitLifecycle(input.telemetry, "persistence.ready", {
      mode,
      durable: true,
      authority: "postgresql",
      migrationCount: results.length,
      migrationsApplied: results.filter((result) => result.applied).length,
    });

    return {
      mode,
      relationshipEngine,
      async health() {
        try {
          await observed.query("SELECT 1 AS jennifer_postgres_health");
          if (databaseState === "unavailable") {
            databaseState = "ready";
            await emitLifecycle(input.telemetry, "persistence.database-recovered", {
              mode,
              database: "ready",
            });
          }
          return {
            mode,
            authority: "postgresql",
            durable: true,
            database: "ready",
            migrationCount: results.length,
          };
        } catch (error) {
          const message = errorMessage(error);
          if (databaseState === "ready") {
            databaseState = "unavailable";
            await emitLifecycle(input.telemetry, "persistence.database-unavailable", {
              mode,
              database: "unavailable",
              error: message,
            });
          }
          return {
            mode,
            authority: "postgresql",
            durable: true,
            database: "unavailable",
            migrationCount: results.length,
            error: message,
          };
        }
      },
      async close() {
        await emitLifecycle(input.telemetry, "persistence.shutdown", { mode });
        await pool.end();
      },
    };
  } catch (error) {
    await emitLifecycle(input.telemetry, "persistence.startup-failed", {
      mode,
      error: errorMessage(error),
    });
    await pool.end().catch(() => undefined);
    throw error;
  }
}

export function readPersistenceMode(
  env: Readonly<Record<string, string | undefined>>,
): JenniferPersistenceMode {
  const configured = env.JENNIFER_PERSISTENCE_MODE?.trim().toLowerCase();
  if (!configured) {
    if (env.NODE_ENV?.trim().toLowerCase() === "production") {
      throw new Error(
        "JENNIFER_PERSISTENCE_MODE must be explicit in production; use 'in-memory' or 'postgres'.",
      );
    }
    return "in-memory";
  }

  if (configured === "in-memory" || configured === "postgres") {
    return configured;
  }

  throw new Error(
    "JENNIFER_PERSISTENCE_MODE must be either 'in-memory' or 'postgres'.",
  );
}

function toPgPoolConfig(
  config: PostgresConnectionConfig,
): ConstructorParameters<typeof Pool>[0] {
  const ssl = config.ssl ? { rejectUnauthorized: false } : false;
  const common = {
    ssl,
    application_name: config.applicationName,
    connectionTimeoutMillis: 5_000,
  };

  if (config.connectionString) {
    return {
      ...common,
      connectionString: config.connectionString,
    };
  }

  return {
    ...common,
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
  };
}

async function loadPostgresMigrations() {
  const directory = fileURLToPath(
    new URL("../../../infra/postgres/migrations/", import.meta.url),
  );
  const names = (await readdir(directory))
    .filter((name) => /^\d+.*\.sql$/i.test(name))
    .sort();

  return Promise.all(
    names.map(async (id) => {
      const sql = await readFile(`${directory}/${id}`, "utf8");
      const checksum = `sha256:${createHash("sha256").update(sql).digest("hex")}`;
      return { id, sql, checksum };
    }),
  );
}

class ObservedPostgresPool implements PostgresPoolPort {
  constructor(
    private readonly pool: Pool,
    private readonly telemetry: TelemetryCollector,
  ) {
    this.pool.on("error", (error) => {
      void emitDatabaseTelemetry(this.telemetry, "pool-error", {
        success: false,
        error: errorMessage(error),
      }).catch(() => undefined);
    });
  }

  async query<TRow = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<PostgresQueryResult<TRow>> {
    return this.observeQuery("pool", text, async () =>
      normalizePgResult<TRow>(await this.pool.query(text, values)),
    );
  }

  async connect(): Promise<PostgresClientPort> {
    const startedAt = Date.now();
    try {
      const client = await this.pool.connect();
      await emitDatabaseTelemetry(this.telemetry, "connect", {
        success: true,
        durationMs: Date.now() - startedAt,
      });
      return new ObservedPostgresClient(client, this.telemetry);
    } catch (error) {
      await emitDatabaseTelemetry(this.telemetry, "connect", {
        success: false,
        durationMs: Date.now() - startedAt,
        error: errorMessage(error),
      });
      throw error;
    }
  }

  private async observeQuery<TRow>(
    scope: "pool",
    text: string,
    operation: () => Promise<PostgresQueryResult<TRow>>,
  ): Promise<PostgresQueryResult<TRow>> {
    const startedAt = Date.now();
    const statement = classifyStatement(text);
    try {
      const result = await operation();
      await emitDatabaseTelemetry(this.telemetry, "query", {
        scope,
        statement,
        success: true,
        durationMs: Date.now() - startedAt,
        rowCount: result.rowCount,
      });
      return result;
    } catch (error) {
      await emitDatabaseTelemetry(this.telemetry, "query", {
        scope,
        statement,
        success: false,
        durationMs: Date.now() - startedAt,
        error: errorMessage(error),
      });
      throw error;
    }
  }
}

class ObservedPostgresClient implements PostgresClientPort {
  constructor(
    private readonly client: PoolClient,
    private readonly telemetry: TelemetryCollector,
  ) {}

  async query<TRow = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<PostgresQueryResult<TRow>> {
    const startedAt = Date.now();
    const statement = classifyStatement(text);
    try {
      const result = normalizePgResult<TRow>(
        await this.client.query(text, values),
      );
      await emitDatabaseTelemetry(
        this.telemetry,
        statement.startsWith("transaction.") ? "transaction" : "query",
        {
          scope: "client",
          statement,
          success: true,
          durationMs: Date.now() - startedAt,
          rowCount: result.rowCount,
        },
      );
      return result;
    } catch (error) {
      await emitDatabaseTelemetry(
        this.telemetry,
        statement.startsWith("transaction.") ? "transaction" : "query",
        {
          scope: "client",
          statement,
          success: false,
          durationMs: Date.now() - startedAt,
          error: errorMessage(error),
        },
      );
      throw error;
    }
  }

  release(): void {
    this.client.release();
  }
}

function normalizePgResult<TRow>(raw: unknown): PostgresQueryResult<TRow> {
  const results = Array.isArray(raw) ? raw : [raw];
  const last = results.at(-1) as
    | { rows?: unknown[]; rowCount?: number | null }
    | undefined;
  const rows = Array.isArray(last?.rows) ? (last.rows as TRow[]) : [];
  const rowCount = results.reduce((sum, entry) => {
    if (!entry || typeof entry !== "object") return sum;
    const value = (entry as { rowCount?: unknown }).rowCount;
    return sum + (typeof value === "number" ? value : 0);
  }, 0);
  return { rows, rowCount };
}

function classifyStatement(sql: string): string {
  const normalized = sql.trim().replace(/\s+/g, " ").toUpperCase();
  if (normalized.startsWith("BEGIN")) return "transaction.begin";
  if (normalized.startsWith("COMMIT")) return "transaction.commit";
  if (normalized.startsWith("ROLLBACK")) return "transaction.rollback";
  const keyword = normalized.split(" ", 1)[0];
  return keyword ? keyword.toLowerCase() : "unknown";
}

async function emitDatabaseTelemetry(
  telemetry: TelemetryCollector,
  operation: "connect" | "query" | "transaction" | "pool-error",
  payload: Record<string, unknown>,
): Promise<void> {
  await telemetry.emit("system.event", "postgresql", {
    operation,
    ...payload,
  });
}

async function emitLifecycle(
  telemetry: TelemetryCollector,
  operation: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await telemetry.emit("system.event", "persistence", {
    operation,
    ...payload,
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
