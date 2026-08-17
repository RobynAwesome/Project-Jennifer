import type { RelationshipSnapshot } from "@jennifer/shared";

export interface JenniferPersistenceReadiness {
  mode: "in-memory" | "postgres";
  authority: "in-memory-poc" | "postgresql";
  durable: boolean;
  database: "not-configured" | "ready" | "unavailable";
  migrationCount: number;
  projection: {
    mode: "in-memory" | "mongodb";
    database: "not-configured" | "ready" | "unavailable";
    rebuildable: boolean;
    error?: string;
  };
  error?: string;
}

export interface JenniferRelationshipReadThrough {
  snapshot: RelationshipSnapshot;
  persistence: JenniferPersistenceReadiness;
  apiStatus: "ok" | "degraded";
}

export class JenniferApiReadError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    message: string,
  ) {
    super(message);
    this.name = "JenniferApiReadError";
  }
}

/**
 * Server-side, cache-free read-through to Jennifer's canonical governed API.
 *
 * React never imports a database driver and never reconstructs relationship
 * authority from fixtures. Every page request asks the API for current
 * persistence readiness and the canonical relationship snapshot.
 */
export async function readJenniferRelationship(
  relationshipId: string,
): Promise<JenniferRelationshipReadThrough> {
  const apiBaseUrl = readJenniferApiBaseUrl();
  const encodedRelationshipId = encodeURIComponent(relationshipId);

  const [health, relationship] = await Promise.all([
    readJson<{
      status: "ok" | "degraded";
      persistence: JenniferPersistenceReadiness;
    }>(apiBaseUrl, "/health"),
    readJson<{ snapshot: RelationshipSnapshot }>(
      apiBaseUrl,
      `/api/runtime/relationships/${encodedRelationshipId}`,
    ),
  ]);

  return {
    snapshot: relationship.snapshot,
    persistence: health.persistence,
    apiStatus: health.status,
  };
}

function readJenniferApiBaseUrl(): string {
  const configured = process.env.JENNIFER_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JENNIFER_API_URL is required for persisted relationship read-through in production.",
    );
  }

  return "http://127.0.0.1:3001";
}

async function readJson<T>(baseUrl: string, path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new JenniferApiReadError(
      response.status,
      path,
      `Jennifer API read failed (${response.status}) for ${path}: ${body.slice(0, 300)}`,
    );
  }

  return (await response.json()) as T;
}
