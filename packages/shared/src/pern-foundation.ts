/**
 * Project Jennifer PERN foundation.
 *
 * React, Express, and Node are active. PostgreSQL now has approved schemas for
 * the relationship spine and Memory Receipt Ark plus a domain-owned runtime
 * gate repository adapter. PostgreSQL remains contract-ready until a concrete
 * governed driver/pool, deterministic migration execution, and transaction-
 * bound domain mutations are proven against a running database.
 */

export const PERN_LAYERS = ["postgresql", "express", "react", "node"] as const;
export type PernLayer = (typeof PERN_LAYERS)[number];
export type PernLayerStatus = "active" | "contract-ready" | "planned";

export interface PernLayerDescriptor {
  layer: PernLayer;
  status: PernLayerStatus;
  repositoryEvidence: readonly string[];
  nextGate?: string;
}

export interface PostgresConnectionConfig {
  connectionString?: string;
  host?: string;
  port: number;
  database?: string;
  user?: string;
  password?: string;
  ssl: boolean;
  applicationName: string;
}

export class PernConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PernConfigurationError";
  }
}

function parsePort(value: string | undefined): number {
  if (!value) return 5432;
  const port = Number.parseInt(value, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new PernConfigurationError("POSTGRES_PORT must be an integer between 1 and 65535.");
  }
  return port;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  throw new PernConfigurationError(`Invalid boolean value '${value}'.`);
}

export function readPostgresConfig(
  env: Readonly<Record<string, string | undefined>>,
): PostgresConnectionConfig {
  const connectionString = env.DATABASE_URL?.trim() || undefined;
  const host = env.POSTGRES_HOST?.trim() || undefined;
  const database = env.POSTGRES_DB?.trim() || undefined;
  const user = env.POSTGRES_USER?.trim() || undefined;
  const password = env.POSTGRES_PASSWORD || undefined;

  if (!connectionString && !host) {
    throw new PernConfigurationError(
      "Set DATABASE_URL or POSTGRES_HOST before activating PostgreSQL.",
    );
  }

  if (!connectionString && (!database || !user)) {
    throw new PernConfigurationError(
      "POSTGRES_DB and POSTGRES_USER are required when DATABASE_URL is not set.",
    );
  }

  return {
    connectionString,
    host,
    port: parsePort(env.POSTGRES_PORT),
    database,
    user,
    password,
    ssl: parseBoolean(env.POSTGRES_SSL, false),
    applicationName: env.POSTGRES_APPLICATION_NAME?.trim() || "project-jennifer",
  };
}

export const PROJECT_JENNIFER_PERN_FOUNDATION: readonly PernLayerDescriptor[] = [
  {
    layer: "postgresql",
    status: "contract-ready",
    repositoryEvidence: [
      "packages/shared/src/pern-foundation.ts",
      ".env.example",
      "docker-compose.persistence.yml",
      "infra/postgres/migrations/0001_relationship_spine.sql",
      "infra/postgres/migrations/0002_memory_receipt_ark.sql",
      "packages/runtime/src/postgres-runtime-gate-ledger.ts",
      "docs/architecture/adr-0003-mern-pern-relationship-spine.md",
      "docs/architecture/adr-0007-durable-memory-receipt-ark.md",
      "PERN_ROADMAP.md",
    ],
    nextGate:
      "Bind a concrete governed PostgreSQL driver/pool, execute migrations deterministically, and transaction-bind authoritative domain mutations to their receipt/idempotency records.",
  },
  {
    layer: "express",
    status: "active",
    repositoryEvidence: ["apps/api/src/server.ts"],
  },
  {
    layer: "react",
    status: "active",
    repositoryEvidence: ["apps/web"],
  },
  {
    layer: "node",
    status: "active",
    repositoryEvidence: ["apps/api/package.json", "package.json"],
  },
];

function clonePernLayerDescriptor(descriptor: PernLayerDescriptor): PernLayerDescriptor {
  return {
    ...descriptor,
    repositoryEvidence: [...descriptor.repositoryEvidence],
  };
}

export function getPernFoundationStatus(): {
  complete: boolean;
  layers: readonly PernLayerDescriptor[];
  nextGate: string;
} {
  const complete = PROJECT_JENNIFER_PERN_FOUNDATION.every(
    (descriptor) => descriptor.status === "active",
  );

  return {
    complete,
    layers: PROJECT_JENNIFER_PERN_FOUNDATION.map(clonePernLayerDescriptor),
    nextGate: complete
      ? "PERN runtime is active. Continue governed feature delivery."
      : "Connect the concrete PostgreSQL driver/pool, run migrations against a live database, and bind consequential mutations to the authoritative transaction boundary.",
  };
}
