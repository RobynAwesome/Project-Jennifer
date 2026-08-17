import {
  Collection,
  MongoClient,
  MongoServerError,
  type Filter,
  type WithId,
} from "mongodb";

import {
  MongoRelationshipProjectionStore,
  type MongoRelationshipProjectionDocumentPort,
} from "@jennifer/runtime";
import type { RelationshipContextProjection } from "@jennifer/shared";
import type { TelemetryCollector } from "@jennifer/telemetry";

export type JenniferProjectionMode = "in-memory" | "mongodb";

export interface JenniferProjectionHealth {
  mode: JenniferProjectionMode;
  database: "not-configured" | "ready" | "unavailable";
  rebuildable: boolean;
  error?: string;
}

export interface JenniferProjectionRuntime {
  mode: JenniferProjectionMode;
  store?: MongoRelationshipProjectionStore;
  health(): Promise<JenniferProjectionHealth>;
  close(): Promise<void>;
}

type MongoProjectionDocument = RelationshipContextProjection;
type MongoProjectionWithId = WithId<MongoProjectionDocument>;

export function readProjectionMode(
  env: Readonly<Record<string, string | undefined>>,
): JenniferProjectionMode {
  const configured = env.JENNIFER_PROJECTION_MODE?.trim().toLowerCase();
  if (!configured) return "in-memory";
  if (configured === "in-memory" || configured === "mongodb") {
    return configured;
  }
  throw new Error(
    "JENNIFER_PROJECTION_MODE must be either 'in-memory' or 'mongodb'.",
  );
}

export async function initializeMongoProjection(input: {
  env: Readonly<Record<string, string | undefined>>;
  telemetry: TelemetryCollector;
}): Promise<JenniferProjectionRuntime> {
  const mode = readProjectionMode(input.env);
  if (mode === "in-memory") {
    return {
      mode,
      async health() {
        return {
          mode,
          database: "not-configured",
          rebuildable: false,
        };
      },
      async close() {},
    };
  }

  const uri = input.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is required when JENNIFER_PROJECTION_MODE=mongodb.");
  }
  const databaseName = input.env.MONGODB_DATABASE?.trim() || "project_jennifer";
  const client = new MongoClient(uri, {
    appName: "project-jennifer",
    serverSelectionTimeoutMS: 5_000,
  });

  try {
    await client.connect();
    const database = client.db(databaseName);
    await database.command({ ping: 1 });
    const collection = database.collection<MongoProjectionDocument>(
      "relationship_contexts",
    );
    await ensureProjectionIndexes(collection);

    await emitMongoTelemetry(input.telemetry, "projection.ready", {
      mode,
      database: databaseName,
    });

    return {
      mode,
      store: new MongoRelationshipProjectionStore(
        new MongoProjectionCollectionPort(collection),
      ),
      async health() {
        try {
          await database.command({ ping: 1 });
          return {
            mode,
            database: "ready",
            rebuildable: true,
          };
        } catch (error) {
          return {
            mode,
            database: "unavailable",
            rebuildable: true,
            error: errorMessage(error),
          };
        }
      },
      async close() {
        await emitMongoTelemetry(input.telemetry, "projection.shutdown", {
          mode,
        });
        await client.close();
      },
    };
  } catch (error) {
    await emitMongoTelemetry(input.telemetry, "projection.startup-failed", {
      mode,
      error: errorMessage(error),
    });
    await client.close().catch(() => undefined);
    throw error;
  }
}

class MongoProjectionCollectionPort
  implements MongoRelationshipProjectionDocumentPort
{
  constructor(
    private readonly collection: Collection<MongoProjectionDocument>,
  ) {}

  async get(
    relationshipId: string,
  ): Promise<RelationshipContextProjection | undefined> {
    const document = await this.collection.findOne({ relationshipId });
    return document ? stripMongoId(document) : undefined;
  }

  async putMonotonic(
    projection: RelationshipContextProjection,
  ): Promise<RelationshipContextProjection> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existing = await this.collection.findOne({
        relationshipId: projection.relationshipId,
      });

      if (existing) {
        const current = stripMongoId(existing);
        if (current.projectionVersion > projection.projectionVersion) {
          return current;
        }
        if (current.projectionVersion === projection.projectionVersion) {
          if (
            current.lastAuthoritativeEventId ===
            projection.lastAuthoritativeEventId
          ) {
            return current;
          }
          throw new Error(
            `Projection version conflict for relationship ${projection.relationshipId}: version ${projection.projectionVersion} maps to both ${current.lastAuthoritativeEventId} and ${projection.lastAuthoritativeEventId}.`,
          );
        }

        const filter = {
          _id: existing._id,
          projectionVersion: current.projectionVersion,
        } as Filter<MongoProjectionDocument>;
        const result = await this.collection.replaceOne(
          filter,
          { ...projection },
          { upsert: false },
        );
        if (result.modifiedCount === 1) return projection;
        continue;
      }

      try {
        await this.collection.insertOne({ ...projection });
        return projection;
      } catch (error) {
        if (isDuplicateKeyError(error)) continue;
        throw error;
      }
    }

    const final = await this.get(projection.relationshipId);
    if (final && final.projectionVersion >= projection.projectionVersion) {
      return final;
    }
    throw new Error(
      `MongoDB projection CAS did not converge for relationship ${projection.relationshipId}.`,
    );
  }
}

async function ensureProjectionIndexes(
  collection: Collection<MongoProjectionDocument>,
): Promise<void> {
  await collection.createIndexes([
    {
      key: { relationshipId: 1 },
      unique: true,
      name: "relationship_contexts_relationship_id",
    },
    {
      key: { "participants.actorId": 1, updatedAt: -1 },
      name: "relationship_contexts_participant_updated",
    },
    {
      key: { activeLane: 1, status: 1 },
      name: "relationship_contexts_lane_status",
    },
    {
      key: { lastAuthoritativeEventId: 1 },
      unique: true,
      name: "relationship_contexts_last_event",
    },
  ]);
}

function stripMongoId(
  document: MongoProjectionWithId,
): RelationshipContextProjection {
  const { _id: _ignored, ...projection } = document;
  return projection;
}

function isDuplicateKeyError(error: unknown): boolean {
  return error instanceof MongoServerError && error.code === 11_000;
}

async function emitMongoTelemetry(
  telemetry: TelemetryCollector,
  operation: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await telemetry.emit("system.event", "mongodb-projection", {
    operation,
    ...payload,
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
