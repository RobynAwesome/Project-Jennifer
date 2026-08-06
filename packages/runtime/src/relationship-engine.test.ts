import assert from "node:assert/strict";
import test from "node:test";

import {
  InMemoryRelationshipAuthorityStore,
  InMemoryRelationshipProjectionStore,
  RelationshipEngine,
} from "./relationship-engine.js";

const SOVEREIGN_ID = "actor-sovereign";
const COMPANION_ID = "actor-aura";

async function createFixture() {
  const authority = new InMemoryRelationshipAuthorityStore();
  const projections = new InMemoryRelationshipProjectionStore();
  const engine = new RelationshipEngine(authority, projections);
  const created = await engine.createRelationship({
    relationshipType: "sovereign-companion",
    lane: "co-builder",
    createdByActorId: SOVEREIGN_ID,
    idempotencyKey: "relationship:create:sovereign:aura",
    actors: [
      {
        id: SOVEREIGN_ID,
        actorType: "human-player",
        canonicalName: "The Sovereign",
        role: "sovereign",
      },
      {
        id: COMPANION_ID,
        actorType: "companion",
        canonicalName: "Aura",
        role: "companion",
        companionId: "aura",
      },
    ],
  });

  return { authority, projections, engine, created };
}

test("creates an authoritative relationship and rebuildable projection", async () => {
  const { created } = await createFixture();

  assert.equal(created.receipt.result, "PASSED");
  assert.equal(created.duplicate, false);
  assert.equal(created.snapshot.relationship.activeLane, "co-builder");
  assert.equal(created.snapshot.participants.length, 2);
  assert.equal(created.snapshot.projection?.projectionVersion, 1);
  assert.equal(
    created.snapshot.projection?.lastAuthoritativeEventId,
    created.snapshot.events[0]?.id
  );
});

test("idempotency returns the original event without duplicating state", async () => {
  const { engine, created } = await createFixture();

  const duplicate = await engine.createRelationship({
    relationshipType: "sovereign-companion",
    lane: "co-builder",
    createdByActorId: SOVEREIGN_ID,
    idempotencyKey: "relationship:create:sovereign:aura",
    actors: [
      {
        id: SOVEREIGN_ID,
        actorType: "human-player",
        canonicalName: "The Sovereign",
        role: "sovereign",
      },
      {
        id: COMPANION_ID,
        actorType: "companion",
        canonicalName: "Aura",
        role: "companion",
        companionId: "aura",
      },
    ],
  });

  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.snapshot.relationship.id, created.snapshot.relationship.id);
  assert.equal(duplicate.snapshot.events.length, 1);
  assert.equal(duplicate.snapshot.receipts.length, 1);
});

test("supersedes boundaries and persists a governed quest decision across runtime restart", async () => {
  const { authority, projections, engine, created } = await createFixture();
  const relationshipId = created.snapshot.relationship.id;

  const firstBoundary = await engine.declareBoundary({
    relationshipId,
    declaredByActorId: SOVEREIGN_ID,
    boundaryType: "public-transformation",
    boundaryValue: "explicit-consent-required",
    idempotencyKey: "boundary:public:1",
  });

  const secondBoundary = await engine.declareBoundary({
    relationshipId,
    declaredByActorId: SOVEREIGN_ID,
    boundaryType: "public-transformation",
    boundaryValue: "private-by-default",
    idempotencyKey: "boundary:public:2",
  });

  assert.equal(firstBoundary.snapshot.boundaries.length, 1);
  assert.equal(secondBoundary.snapshot.boundaries.length, 2);
  assert.equal(
    secondBoundary.snapshot.boundaries.filter((boundary) => boundary.status === "active")
      .length,
    1
  );
  assert.equal(
    secondBoundary.snapshot.boundaries.find(
      (boundary) => boundary.status === "active"
    )?.boundaryValue,
    "private-by-default"
  );

  await engine.applyQuestDecision({
    relationshipId,
    questInstanceId: "quest-convergence-001",
    sourceActorId: SOVEREIGN_ID,
    decisionType: "forced-binary",
    selectedOption: "create-third-path",
    nextStatus: "restored",
    idempotencyKey: "quest-convergence-001:decision:third-path",
    evidenceRefs: ["commandment-15", "relationship-receipt"],
  });

  // A new runtime instance receives the same authority and projection adapters,
  // mirroring an application restart against persistent databases.
  const restarted = new RelationshipEngine(authority, projections);
  const restored = await restarted.getSnapshot(relationshipId);

  assert.ok(restored);
  assert.equal(restored.relationship.status, "restored");
  assert.equal(restored.decisions.length, 1);
  assert.equal(restored.receipts.length, 4);
  assert.equal(restored.projection?.projectionVersion, 4);
  assert.match(restored.projection?.currentSummary ?? "", /1 governed quest decisions/);
});
