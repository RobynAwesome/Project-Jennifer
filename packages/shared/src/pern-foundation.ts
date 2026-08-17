/**
 * Project Jennifer PERN foundation.
 *
 * React, Express, and Node are active. PostgreSQL remains contract-ready as a
 * global Jennifer layer because every consequential domain must earn its own
 * persistence receipt. The governed relationship domain has completed the
 * bounded authority → resilience → projection rebuild → React read-through
 * chain and is recorded separately as operational.
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

export type BoundedPersistenceSliceStatus =
  | "operational"
  | "proof-pending"
  | "planned";

export interface BoundedPersistenceSliceDescriptor {
  domain: "relationships";
  status: BoundedPersistenceSliceStatus;
  authority: "postgresql";
  projection: "mongodb";
  readThrough: "react-api";
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
    throw new PernConfigurationError(
      "POSTGRES_PORT must be an integer between 1 and 65535.",
    );
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
    applicationName:
      env.POSTGRES_APPLICATION_NAME?.trim() || "project-jennifer",
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
      "infra/mongodb/0001_relationship_projections.js",
      "packages/runtime/src/postgres-runtime-gate-ledger.ts",
      "packages/runtime/src/postgres-migration-runner.ts",
      "packages/runtime/src/postgres-relationship-authority-store.ts",
      "packages/runtime/src/mongo-relationship-projection-store.ts",
      "packages/runtime/src/relationship-projection-rebuilder.ts",
      "apps/api/src/persistence.ts",
      "apps/api/src/mongo-projection.ts",
      "apps/api/src/routes/relationships.ts",
      "apps/api/src/routes/runtime.ts",
      "apps/web/src/lib/jennifer-api.ts",
      "apps/web/src/app/relationships/page.tsx",
      "apps/web/src/app/relationships/[relationshipId]/page.tsx",
      "tools/prove-postgres-runtime-gate.mjs",
      "tools/prove-postgres-api-authority.mjs",
      "tools/prove-postgres-api-recovery.mjs",
      "tools/prove-mongodb-projection-rebuild.mjs",
      "tools/prove-react-persisted-readthrough.mjs",
      ".github/workflows/postgres-live-proof.yml",
      ".github/workflows/postgres-api-authority-proof.yml",
      ".github/workflows/mongodb-projection-rebuild-proof.yml",
      ".github/workflows/react-persisted-readthrough-proof.yml",
      "docs/architecture/adr-0003-mern-pern-relationship-spine.md",
      "docs/architecture/adr-0007-durable-memory-receipt-ark.md",
      "PERN_ROADMAP.md",
    ],
    nextGate:
      "Keep PostgreSQL globally contract-ready while NCMP, Waifu Forge, governance, validation, and later domains earn equivalent domain-owned persistence receipts.",
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

export const PROJECT_JENNIFER_BOUNDED_PERSISTENCE_SLICES:
  readonly BoundedPersistenceSliceDescriptor[] = [
    {
      domain: "relationships",
      status: "operational",
      authority: "postgresql",
      projection: "mongodb",
      readThrough: "react-api",
      repositoryEvidence: [
        "infra/postgres/migrations/0001_relationship_spine.sql",
        "packages/runtime/src/postgres-relationship-authority-store.ts",
        "packages/runtime/src/mongo-relationship-projection-store.ts",
        "packages/runtime/src/relationship-projection-rebuilder.ts",
        "apps/api/src/persistence.ts",
        "apps/api/src/mongo-projection.ts",
        "apps/api/src/routes/relationships.ts",
        "apps/web/src/lib/jennifer-api.ts",
        "apps/web/src/app/relationships/[relationshipId]/page.tsx",
        "tools/prove-postgres-api-authority.mjs",
        "tools/prove-postgres-api-recovery.mjs",
        "tools/prove-mongodb-projection-rebuild.mjs",
        "tools/prove-react-persisted-readthrough.mjs",
        ".github/workflows/postgres-api-authority-proof.yml",
        ".github/workflows/mongodb-projection-rebuild-proof.yml",
        ".github/workflows/react-persisted-readthrough-proof.yml",
      ],
      nextGate:
        "Preserve this bounded operational receipt while the next domain-owned persistence gate advances independently.",
    },
  ];

function clonePernLayerDescriptor(
  descriptor: PernLayerDescriptor,
): PernLayerDescriptor {
  return {
    ...descriptor,
    repositoryEvidence: [...descriptor.repositoryEvidence],
  };
}

function cloneBoundedPersistenceSlice(
  descriptor: BoundedPersistenceSliceDescriptor,
): BoundedPersistenceSliceDescriptor {
  return {
    ...descriptor,
    repositoryEvidence: [...descriptor.repositoryEvidence],
  };
}

export function getPernFoundationStatus(): {
  complete: boolean;
  layers: readonly PernLayerDescriptor[];
  boundedSlices: readonly BoundedPersistenceSliceDescriptor[];
  nextGate: string;
} {
  const complete = PROJECT_JENNIFER_PERN_FOUNDATION.every(
    (descriptor) => descriptor.status === "active",
  );

  return {
    complete,
    layers: PROJECT_JENNIFER_PERN_FOUNDATION.map(clonePernLayerDescriptor),
    boundedSlices: PROJECT_JENNIFER_BOUNDED_PERSISTENCE_SLICES.map(
      cloneBoundedPersistenceSlice,
    ),
    nextGate: complete
      ? "PERN runtime is active. Continue governed feature delivery."
      : "The relationship persistence slice is operational end to end; keep global PostgreSQL contract-ready and advance the next domain-owned persistence gate, starting with NCMP / Waifu Forge according to the roadmap.",
  };
}
