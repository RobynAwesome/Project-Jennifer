import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { once } from "node:events";

const requireFromApi = createRequire(
  new URL("../apps/api/package.json", import.meta.url),
);
const { Pool } = requireFromApi("pg");
const { MongoClient } = requireFromApi("mongodb");

const databaseUrl = process.env.DATABASE_URL;
const mongoUri = process.env.MONGODB_URI;
const mongoDatabase = process.env.MONGODB_DATABASE ?? "project_jennifer_projection_ci";
assert.ok(databaseUrl, "DATABASE_URL is required for MongoDB projection proof");
assert.ok(mongoUri, "MONGODB_URI is required for MongoDB projection proof");

const port = Number(process.env.JENNIFER_PROJECTION_PROOF_PORT ?? 3313);
const baseUrl = `http://127.0.0.1:${port}`;
const actorA = "projection-proof-human";
const actorB = "projection-proof-system";
const createKey = "projection-proof:create";

const server = startServer();
const pg = new Pool({ connectionString: databaseUrl });
const mongo = new MongoClient(mongoUri);
await mongo.connect();
const collection = mongo.db(mongoDatabase).collection("relationship_contexts");

try {
  const health = await waitForHealth(200, 20_000);
  assert.equal(health.body.persistence.authority, "postgresql");
  assert.equal(health.body.persistence.projection.mode, "mongodb");
  assert.equal(health.body.persistence.projection.database, "ready");
  assert.equal(health.body.persistence.projection.rebuildable, true);

  const created = await postJson(`${baseUrl}/api/runtime/relationships`, {
    relationshipType: "ccp-projection-rebuild-proof",
    lane: "co-builder",
    createdByActorId: actorA,
    actors: [
      {
        id: actorA,
        actorType: "human-player",
        canonicalName: "Projection Proof Human",
        role: "sovereign",
      },
      {
        id: actorB,
        actorType: "system",
        canonicalName: "Projection Proof System",
        role: "witness",
      },
    ],
    idempotencyKey: createKey,
  });
  assert.equal(created.status, 201);
  const relationshipId = created.body.snapshot.relationship.id;

  const boundary = await postJson(
    `${baseUrl}/api/runtime/relationships/${relationshipId}/boundaries`,
    {
      declaredByActorId: actorA,
      boundaryType: "projection-proof-boundary",
      boundaryValue: "preserve-authority",
      idempotencyKey: "projection-proof:boundary",
    },
  );
  assert.equal(boundary.status, 201);

  const decision = await postJson(
    `${baseUrl}/api/runtime/relationships/${relationshipId}/decisions`,
    {
      questInstanceId: "projection-proof-quest",
      sourceActorId: actorA,
      decisionType: "projection-proof-decision",
      selectedOption: "rebuild-from-authority",
      nextStatus: "strained",
      evidenceRefs: ["postgres-outbox", "mongo-projection"],
      idempotencyKey: "projection-proof:decision",
    },
  );
  assert.equal(decision.status, 201);

  const beforeReplay = await fetchJson(
    `${baseUrl}/api/runtime/relationships/${relationshipId}`,
  );
  assert.equal(beforeReplay.status, 200);
  const authoritativeVersion = beforeReplay.body.snapshot.relationship.version;
  const expectedProjection = beforeReplay.body.snapshot.projection;
  assert.ok(expectedProjection, "MongoDB projection must be attached to relationship reads");
  assert.equal(expectedProjection.projectionVersion, authoritativeVersion);
  assert.equal(
    expectedProjection.lastAuthoritativeEventId,
    beforeReplay.body.snapshot.events.at(-1).id,
  );
  assert.equal(expectedProjection.status, "strained");
  assert.equal(expectedProjection.activeBoundaries.length, 1);
  assert.equal(expectedProjection.recentEvents.length, 3);
  assert.equal(expectedProjection.currentSummary.includes("1 governed quest decisions"), true);
  assert.equal("_id" in expectedProjection, false, "vendor MongoDB _id must not cross the domain boundary");

  const mongoCountBeforeReplay = await collection.countDocuments({ relationshipId });
  assert.equal(mongoCountBeforeReplay, 1);

  // Simulate the crash window where Mongo projection succeeded but the
  // PostgreSQL outbox publication receipt was not durably recorded.
  await pg.query(
    `UPDATE relationship_outbox_events
     SET published_at = NULL
     WHERE aggregate_id = $1`,
    [relationshipId],
  );

  const replayedFlush = await postJson(
    `${baseUrl}/api/runtime/relationships/projections/flush`,
    {},
  );
  assert.equal(replayedFlush.status, 200);
  assert.equal(replayedFlush.body.projected, 3);

  const afterReplay = await fetchJson(
    `${baseUrl}/api/runtime/relationships/${relationshipId}`,
  );
  assert.equal(afterReplay.status, 200);
  assert.deepEqual(
    afterReplay.body.snapshot.projection,
    expectedProjection,
    "replaying already-applied projection events must be a deterministic no-op",
  );
  assert.equal(await collection.countDocuments({ relationshipId }), 1);

  const published = await pg.query(
    `SELECT count(*)::int AS count
     FROM relationship_outbox_events
     WHERE aggregate_id = $1 AND published_at IS NOT NULL`,
    [relationshipId],
  );
  assert.equal(published.rows[0].count, 3);

  // Wipe only the rebuildable projection; PostgreSQL truth/outbox remain intact.
  await collection.deleteMany({ relationshipId });
  assert.equal(await collection.countDocuments({ relationshipId }), 0);

  const afterWipe = await fetchJson(
    `${baseUrl}/api/runtime/relationships/${relationshipId}`,
  );
  assert.equal(afterWipe.status, 200);
  assert.equal(
    afterWipe.body.snapshot.projection,
    undefined,
    "authoritative relationship must survive when the adaptive Mongo projection is deleted",
  );

  const rebuild = await postJson(
    `${baseUrl}/api/runtime/relationships/projections/rebuild`,
    {},
  );
  assert.equal(rebuild.status, 200);
  assert.equal(rebuild.body.rebuild.discovered, 1);
  assert.equal(rebuild.body.rebuild.rebuilt, 1);
  assert.equal(rebuild.body.rebuild.missingAuthoritativeSnapshots, 0);

  const rebuilt = await fetchJson(
    `${baseUrl}/api/runtime/relationships/${relationshipId}`,
  );
  assert.equal(rebuilt.status, 200);
  assert.deepEqual(
    rebuilt.body.snapshot.projection,
    expectedProjection,
    "projection rebuild from PostgreSQL outbox evidence must converge to the original domain projection",
  );
  assert.equal(await collection.countDocuments({ relationshipId }), 1);

  const secondRebuild = await postJson(
    `${baseUrl}/api/runtime/relationships/projections/rebuild`,
    {},
  );
  assert.equal(secondRebuild.status, 200);
  const afterSecondRebuild = await fetchJson(
    `${baseUrl}/api/runtime/relationships/${relationshipId}`,
  );
  assert.deepEqual(
    afterSecondRebuild.body.snapshot.projection,
    expectedProjection,
    "repeated full rebuild must not inflate projection version or timestamp",
  );

  const replayCreate = await postJson(
    `${baseUrl}/api/runtime/relationships`,
    {
      relationshipType: "ccp-projection-rebuild-proof",
      lane: "co-builder",
      createdByActorId: actorA,
      actors: [
        {
          id: actorA,
          actorType: "human-player",
          canonicalName: "Projection Proof Human",
          role: "sovereign",
        },
        {
          id: actorB,
          actorType: "system",
          canonicalName: "Projection Proof System",
          role: "witness",
        },
      ],
      idempotencyKey: createKey,
    },
  );
  assert.equal(replayCreate.status, 200);
  assert.equal(replayCreate.body.duplicate, true);
  assert.equal(replayCreate.body.snapshot.relationship.id, relationshipId);

  console.log(
    JSON.stringify(
      {
        proof: "mongodb-relationship-projection-rebuild",
        postgresAuthorityPreserved: true,
        mongoProjectionPersisted: true,
        duplicateDeliveryIdempotent: true,
        projectionVersion: authoritativeVersion,
        projectionWipePreservedAuthority: true,
        rebuiltFromPostgresOutboxEvidence: true,
        repeatedRebuildIdempotent: true,
        mongoDocumentCount: 1,
      },
      null,
      2,
    ),
  );
} finally {
  await pg.end();
  await mongo.close();
  await stopServer(server);
}

function startServer() {
  const child = spawn(process.execPath, ["apps/api/dist/server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(port),
      JENNIFER_PERSISTENCE_MODE: "postgres",
      JENNIFER_PROJECTION_MODE: "mongodb",
      DATABASE_URL: databaseUrl,
      POSTGRES_SSL: "false",
      POSTGRES_APPLICATION_NAME: "project-jennifer-projection-proof",
      MONGODB_URI: mongoUri,
      MONGODB_DATABASE: mongoDatabase,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout?.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr?.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

async function waitForHealth(expectedStatus, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let last;
  while (Date.now() < deadline) {
    try {
      const response = await fetchJson(`${baseUrl}/health`);
      last = response;
      if (response.status === expectedStatus) return response;
    } catch (error) {
      last = error;
    }
    await delay(250);
  }
  throw new Error(
    `Jennifer projection health did not reach ${expectedStatus}; last=${formatLast(last)}`,
  );
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  return { status: response.status, body: await response.json() };
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  return { status: response.status, body: await response.json() };
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  const [code, signal] = await once(child, "exit");
  assert.equal(signal, null, `governed shutdown should handle SIGTERM, got ${signal}`);
  assert.equal(code, 0, "Jennifer API should close PostgreSQL and MongoDB cleanly");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatLast(value) {
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
