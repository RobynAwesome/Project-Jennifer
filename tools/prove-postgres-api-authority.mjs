import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { once } from "node:events";

const requireFromApi = createRequire(
  new URL("../apps/api/package.json", import.meta.url),
);
const { Pool } = requireFromApi("pg");

const databaseUrl = process.env.DATABASE_URL;
assert.ok(databaseUrl, "DATABASE_URL is required for PostgreSQL API authority proof");

const port = Number(process.env.JENNIFER_API_PROOF_PORT ?? 3311);
const baseUrl = `http://127.0.0.1:${port}`;
const actorA = "api-proof-human";
const actorB = "api-proof-system";
const idempotencyKey = "api-authority-proof:concurrent-create";
const payload = {
  relationshipType: "ccp-api-authority-proof",
  lane: "co-builder",
  createdByActorId: actorA,
  actors: [
    {
      id: actorA,
      actorType: "human-player",
      canonicalName: "API Proof Human",
      role: "sovereign",
    },
    {
      id: actorB,
      actorType: "system",
      canonicalName: "API Proof System",
      role: "witness",
    },
  ],
  idempotencyKey,
};

let server = await startServer({ port, databaseUrl });
const health = await waitForHealth(baseUrl);
assert.equal(health.status, "ok");
assert.equal(health.persistence.mode, "postgres");
assert.equal(health.persistence.authority, "postgresql");
assert.equal(health.persistence.durable, true);
assert.equal(health.persistence.database, "ready");

const [left, right] = await Promise.all([
  postJson(`${baseUrl}/api/runtime/relationships`, payload),
  postJson(`${baseUrl}/api/runtime/relationships`, payload),
]);

assert.deepEqual(
  [left.status, right.status].sort((a, b) => a - b),
  [200, 201],
  "concurrent idempotent creates must produce one created result and one duplicate result",
);
assert.equal(left.body.snapshot.relationship.id, right.body.snapshot.relationship.id);
assert.deepEqual(
  [left.body.duplicate, right.body.duplicate].sort(),
  [false, true],
);

const relationshipId = left.body.snapshot.relationship.id;
assert.equal(left.body.snapshot.events.length, 1);
assert.equal(right.body.snapshot.events.length, 1);
assert.equal(left.body.snapshot.receipts.length, 1);
assert.equal(right.body.snapshot.receipts.length, 1);

const pool = new Pool({ connectionString: databaseUrl });
try {
  const count = await pool.query(
    "SELECT count(*)::int AS count FROM relationship_events WHERE idempotency_key = $1",
    [idempotencyKey],
  );
  assert.equal(count.rows[0].count, 1, "database must contain one authoritative event");
} finally {
  await pool.end();
}

await stopServer(server);
server = await startServer({ port, databaseUrl });
const restartedHealth = await waitForHealth(baseUrl);
assert.equal(restartedHealth.persistence.database, "ready");

const snapshotResponse = await fetchJson(
  `${baseUrl}/api/runtime/relationships/${relationshipId}`,
);
assert.equal(snapshotResponse.status, 200);
assert.equal(snapshotResponse.body.snapshot.relationship.id, relationshipId);
assert.equal(snapshotResponse.body.snapshot.events.length, 1);
assert.equal(snapshotResponse.body.snapshot.receipts.length, 1);

const replay = await postJson(
  `${baseUrl}/api/runtime/relationships`,
  payload,
);
assert.equal(replay.status, 200);
assert.equal(replay.body.duplicate, true);
assert.equal(replay.body.snapshot.relationship.id, relationshipId);
assert.equal(replay.body.snapshot.events.length, 1);

await stopServer(server);
server = undefined;

await assertStartupFails({
  ...baseEnvironment(port + 1),
  JENNIFER_PERSISTENCE_MODE: "postgres",
  DATABASE_URL: databaseUrl.replace(/:5432\//, ":65432/"),
});

const missingModeEnvironment = baseEnvironment(port + 2);
delete missingModeEnvironment.JENNIFER_PERSISTENCE_MODE;
await assertStartupFails({
  ...missingModeEnvironment,
  NODE_ENV: "production",
  DATABASE_URL: databaseUrl,
});

console.log(
  JSON.stringify(
    {
      proof: "postgres-api-authority",
      relationshipId,
      concurrentResponses: [left.status, right.status],
      restartRecovered: true,
      replaySuppressed: true,
      databaseFailureFailsClosed: true,
      productionModeMustBeExplicit: true,
    },
    null,
    2,
  ),
);

async function startServer({ port: serverPort, databaseUrl: url }) {
  const child = spawn(process.execPath, ["apps/api/dist/server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...baseEnvironment(serverPort),
      JENNIFER_PERSISTENCE_MODE: "postgres",
      DATABASE_URL: url,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  captureOutput(child);
  return child;
}

function baseEnvironment(serverPort) {
  return {
    NODE_ENV: "test",
    PORT: String(serverPort),
    JENNIFER_PERSISTENCE_MODE: "postgres",
    POSTGRES_SSL: "false",
    POSTGRES_APPLICATION_NAME: "project-jennifer-api-proof",
  };
}

async function waitForHealth(url) {
  const deadline = Date.now() + 20_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetchJson(`${url}/health`);
      if (response.status === 200) return response.body;
      lastError = new Error(`health returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw lastError ?? new Error("Jennifer API health check timed out");
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return {
    status: response.status,
    body: await response.json(),
  };
}

async function fetchJson(url) {
  const response = await fetch(url);
  return {
    status: response.status,
    body: await response.json(),
  };
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  const [code, signal] = await once(child, "exit");
  assert.equal(signal, null, `server should exit through governed SIGTERM handler, got ${signal}`);
  assert.equal(code, 0, "server should close governed resources cleanly");
}

async function assertStartupFails(environment) {
  const child = spawn(process.execPath, ["apps/api/dist/server.js"], {
    cwd: process.cwd(),
    env: { ...process.env, ...environment },
    stdio: ["ignore", "pipe", "pipe"],
  });
  captureOutput(child);

  const exit = once(child, "exit");
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("expected startup failure timed out")), 10_000),
  );
  const [code] = await Promise.race([exit, timeout]);
  assert.notEqual(code, 0, "invalid durable startup must fail closed");
}

function captureOutput(child) {
  child.stdout?.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr?.on("data", (chunk) => process.stderr.write(chunk));
}
