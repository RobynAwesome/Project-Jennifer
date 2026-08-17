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
  PostgresRelationshipProjectionEvidenceStore,
  RelationshipEngine,
  RelationshipProjectionRebuilder,
  type PostgresClientPort,
  type PostgresPoolPort,
  type PostgresQueryResult,
  type RelationshipProjectionRebuildResult,
} from "@jennifer/runtime";
import {
  readPostgresConfig,
  type PostgresConnectionConfig,
} from "@jennifer/shared";
import type { TelemetryCollector } from "@jennifer/telemetry";

import {
  initializeMongoProjection,
  readProjectionMode,
  type JenniferProjectionHealth,
  type JenniferProjectionMode,
  type JenniferProjectionRuntime,
} from "./mongo-projection.js";

export type JenniferPersistenceMode = "in-memory" | "postgres";

export interface JenniferPersistenceHealth {
  mode: JenniferPersistenceMode;
  authority: "in-memory-poc" | "postgresql";
  durable: boolean;
  database: "not-configured" | "ready" | "unavailable";
  migrationCount: number;
  projection: JenniferProjectionHealth;
  error?: string;
}

export interface JenniferPersistenceRuntime {
  mode: JenniferPersistenceMode;
  projectionMode: JenniferProjectionMode;
  relationshipEngine: RelationshipEngine;
  health(): Promise<JenniferPersistenceHealth>;
  rebuildRelationshipProjections(): Promise<RelationshipProjectionRebuildResult>;
  close(): Promise<void>;
}

export async function initializePersistence(input: {
  env: Readonly<Record<string, string | undefined>>;
  telemetry: TelemetryCollector;
}): Promise<JenniferPersistenceRuntime> {
  const mode = readPersistenceMode(input.env);
  const projectionMode = readProjectionMode(input.env);

  if (mode === "in-memory") {
    if (projectionMode === "mongodb") {
      throw new Error(
        "JENNIFER_PROJECTION_MODE=mongodb requires JENNIFER_PERSISTENCE_MODE=postgres so projections always have durable authoritative evidence.",
      );
    }

    const authority = new IdempotencyGuardedRelationshipAuthorityStore(
      new InMemoryRelationshipAuthorityStore(),
    );
    const relationshipEngine = new RelationshipEngine(
      authority,
      new InMemoryRelationshipProjectionStore(),
    );

    await emitLifecycle(input.telemetry, "persistence.ready", {
      mode,
      projectionMode,
      durable: false,
      authority: "in-memory-poc",
    });

    return {
      mode,
      projectionMode,
      relationshipEngine,
      async health() {
        return {
          mode,
          authority: "in-memory-poc",
          durable: false,
          database: "not-configured",
          migrationCount: 0,
          projection: {
            mode: "in-memory",
            database: "not-configured",
            rebuildable: false,
          },
        };
      },
      async rebuildRelationshipProjections() {
        throw new Error(
          "Relationship projection rebuild requires PostgreSQL authority and MongoDB projection mode.",
        );
      },
      async close() {},
    };
  }

  const config = readPostgresConfig(input.env);
  const pool = new Pool(toPgPoolConfig(config));
  const observed = new ObservedPostgresPool(pool, input.telemetry);
  let projectionRuntime: JenniferProjectionRuntime | undefined;

  try {
    await observed.query("SELECT 1 AS jennifer_postgres_ready");
    const migrations = await loadPostgresMigrations();
    const results = await new PostgresMigrationRunner(observed).apply(migrations);

    projectionRuntime = await initializeMongoProjection({
      env: input.env,
      telemetry: input.telemetry,
    });

    const authority = new PostgresRelationshipAuthorityStore(observed);
    const projectionStore =
      projectionRuntime.store ?? new InMemoryRelationshipProjectionStore();
    const relationshipEngine = new RelationshipEngine(
      authority,
      projectionStore,
    );
    const rebuilder =
      projectionRuntime.mode === "mongodb"
        ? new RelationshipProjectionRebuilder(
            authority,
            projectionStore,
            new PostgresRelationshipProjectionEvidenceStore(observed),
          )
        : undefined;
    let databaseState: "ready" | "unavailable" = "ready";

    await emitLifecycle(input.telemetry, "persistence.ready", {
      mode,
      projectionMode: projectionRuntime.mode,
      durable: true,
      authority: "postgresql",
      migrationCount: results.length,
      migrationsApplied: results.filter((result) => result.applied).length,
    });

    return {
      mode,
      projectionMode: projectionRuntime.mode,
      relationshipEngine,
      async health() {
        const projection = await projectionRuntime!.health();
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
            projection,
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
            projection,
            error: message,
          };
        }
      },
      async rebuildRelationshipProjections() {
        if (!rebuilder) {
          throw new Error(
            "Relationship projection rebuild requires JENNIFER_PROJECTION_MODE=mongodb.",
          );
        }
        await emitLifecycle(input.telemetry, "projection.rebuild-started", {
          projectionMode: projectionRuntime!.mode,
        });
        const result = await rebuilder.rebuildAll();
        await emitLifecycle(input.telemetry, "projection.rebuild-completed", {
          projectionMode: projectionRuntime!.mode,
          ...result,
        });
        return result;
      },
      async close() {
        await emitLifecycle(input.telemetry, "persistence.shutdown", {
          mode,
          projectionMode: projectionRuntime!.mode,
        });
        await projectionRuntime!.close();
        await pool.end();
      },
    };
  } catch (error) {
    await emitLifecycle(input.telemetry, "persistence.startup-failed", {
      mode,
      projectionMode,
      error: errorMessage(error),
    });
    await projectionRuntime?.close().catch(() => undefined);
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
