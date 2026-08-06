/**
 * Project Jennifer PERN foundation.
 *
 * React, Express, and Node are active. PostgreSQL now has an approved
 * relationship-spine schema and local service scaffold, but it remains
 * contract-ready until a governed driver, migration runner, and domain-owned
 * repository adapters are connected to runtime writes.
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
      "docs/architecture/adr-0003-mern-pern-relationship-spine.md",
      "PERN_ROADMAP.md",
    ],
    nextGate:
      "Install the governed driver, add a migration runner and connection pool, then route writes through domain-owned repositories.",
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
    layers: PROJECT_JENNIFER_PERN_FOUNDATION,
    nextGate: complete
      ? "PERN runtime is active. Continue governed feature delivery."
      : "Connect PostgreSQL through the approved repository-adapter and migration-runner gate.",
  };
}
