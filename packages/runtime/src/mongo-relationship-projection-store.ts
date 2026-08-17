import type {
  RelationshipContextProjection,
  RelationshipSnapshot,
} from "@jennifer/shared";

import type { IRelationshipProjectionStore } from "./relationship-engine.js";

/**
 * Structural document port implemented by the application/infrastructure layer.
 *
 * `putMonotonic` MUST be concurrency-safe. It may replace an older projection,
 * MUST return the existing projection for an identical authoritative version,
 * and MUST never let an older authoritative version overwrite a newer one.
 */
export interface MongoRelationshipProjectionDocumentPort {
  get(
    relationshipId: string,
  ): Promise<RelationshipContextProjection | undefined>;
  putMonotonic(
    projection: RelationshipContextProjection,
  ): Promise<RelationshipContextProjection>;
}

/**
 * Rebuildable MongoDB-shaped adaptive projection adapter.
 *
 * Projection version is the authoritative PostgreSQL relationship version,
 * not the number of delivery attempts. This makes retry after a crash window
 * and full projection rebuild deterministic.
 */
export class MongoRelationshipProjectionStore
  implements IRelationshipProjectionStore
{
  constructor(
    private readonly documents: MongoRelationshipProjectionDocumentPort,
  ) {}

  async upsertFromAuthoritativeSnapshot(
    snapshot: RelationshipSnapshot,
    eventId: string,
  ): Promise<RelationshipContextProjection> {
    const latestEventId = snapshot.events.at(-1)?.id ?? eventId;
    if (!latestEventId) {
      throw new Error(
        `Relationship ${snapshot.relationship.id} cannot be projected without authoritative event evidence.`,
      );
    }

    const projection: RelationshipContextProjection = {
      relationshipId: snapshot.relationship.id,
      activeLane: snapshot.relationship.activeLane,
      status: snapshot.relationship.status,
      participants: snapshot.participants.map(clone),
      activeBoundaries: snapshot.boundaries
        .filter((boundary) => boundary.status === "active")
        .map(clone),
      recentEvents: snapshot.events.slice(-20).map(clone),
      currentSummary: buildProjectionSummary(snapshot),
      lastAuthoritativeEventId: latestEventId,
      projectionVersion: snapshot.relationship.version,
      updatedAt: snapshot.relationship.updatedAt,
    };

    return this.documents.putMonotonic(projection);
  }

  get(
    relationshipId: string,
  ): Promise<RelationshipContextProjection | undefined> {
    return this.documents.get(relationshipId);
  }
}

function buildProjectionSummary(snapshot: RelationshipSnapshot): string {
  const names = snapshot.actors.map((actor) => actor.canonicalName).join(" + ");
  const activeBoundaries = snapshot.boundaries.filter(
    (boundary) => boundary.status === "active",
  ).length;
  return `${names} operate in the ${snapshot.relationship.activeLane} lane with ${activeBoundaries} active boundaries and ${snapshot.decisions.length} governed quest decisions.`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
