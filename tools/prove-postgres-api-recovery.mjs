import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";

const databaseUrl = process.env.DATABASE_URL;
const postgresContainerId = process.env.POSTGRES_CONTAINER_ID;
assert.ok(databaseUrl, "DATABASE_URL is required for PostgreSQL recovery proof");
assert.ok(
  postgresContainerId,
  "POSTGRES_CONTAINER_ID is required for PostgreSQL recovery proof",
);

const port = Number(process.env.JENNIFER_API_RECOVERY_PORT ?? 3312);
const baseUrl = `http://127.0.0.1:${port}`;
const actorA = "recovery-proof-human";
const actorB = "recovery-proof-system";
const idempotencyKey = "api-recovery-proof:relationship";
const payload = {
  relationshipType: "ccp-api-recovery-proof",
  lane: "co-builder",
  createdByActorId: actorA,
  actors: [
    {
      id: actorA,
      actorType: "human-player",
      canonicalName: "Recovery Proof Human",
      role: "sovereign",
    },
    {
      id: actorB,
      actorType: "system",
      canonicalName: "Recovery Proof System",
      role: "witness",
    },
  ],
  idempotencyKey,
};

const server = startServer();
const serverPid = server.pid;
assert.ok(serverPid, "Jennifer API child process must have a PID");

try {
  const ready = await waitForHealth(200, 20_000);
  assert.equal(ready.body.persistence.database, "ready");

  const created = await postJson(
    `${baseUrl}/api/runtime/relationships`,
    payload,
  );
  assert.equal(created.status, 201);
  const relationshipId = created.body.snapshot.relationship.id;
  assert.ok(relationshipId);

  execFileSync("docker", ["stop", postgresContainerId], { stdio: "inherit" });
  await delay(500);
  assert.equal(server.exitCode, null, "database outage must not terminate Jennifer");
  assert.equal(server.pid, serverPid, "Jennifer process identity must remain stable");

  const degraded = await waitForHealth(503, 15_000);
  assert.equal(degraded.body.status, "degraded");
  assert.equal(degraded.body.persistence.database, "unavailable");
  assert.equal(server.exitCode, null, "Jennifer must remain alive while degraded");

  const outageTelemetry = await fetchJson(`${baseUrl}/api/telemetry`);
  assert.equal(outageTelemetry.status, 200);
  assert.ok(
    hasPersistenceOperation(
      outageTelemetry.body.events,
      "persistence.database-unavailable",
    ),
    "database-unavailable transition telemetry must be emitted once readiness degrades",
  );

  const unavailableRead = await fetchJson(
    `${baseUrl}/api/runtime/relationships/${relationshipId}`,
  );
  assert.equal(
    unavailableRead.status,
    500,
    "authoritative reads must fail while PostgreSQL is unavailable instead of falling back",
  );

  execFileSync("docker", ["start", postgresContainerId], { stdio: "inherit" });
  await waitForContainerHealthy(postgresContainerId, 20_000);

  const recovered = await waitForHealth(200, 20_000);
  assert.equal(recovered.body.status, "ok");
  assert.equal(recovered.body.persistence.database, "ready");
  assert.equal(server.pid, serverPid, "recovery must occur without process replacement");
  assert.equal(server.exitCode, null, "Jennifer must remain alive after recovery");

  const recoveryTelemetry = await fetchJson(`${baseUrl}/api/telemetry`);
  assert.equal(recoveryTelemetry.status, 200);
  assert.ok(
    hasPersistenceOperation(
      recoveryTelemetry.body.events,
      "persistence.database-recovered",
    ),
    "database-recovered transition telemetry must be emitted after readiness returns",
  );

  const restoredRead = await fetchJson(
    `${baseUrl}/api/runtime/relationships/${relationshipId}`,
  );
  assert.equal(restoredRead.status, 200);
  assert.equal(restoredRead.body.snapshot.relationship.id, relationshipId);
  assert.equal(restoredRead.body.snapshot.events.length, 1);

  const replay = await postJson(
    `${baseUrl}/api/runtime/relationships`,
    payload,
  );
  assert.equal(replay.status, 200);
  assert.equal(replay.body.duplicate, true);
  assert.equal(replay.body.snapshot.relationship.id, relationshipId);
  assert.equal(replay.body.snapshot.events.length, 1);

  console.log(
    JSON.stringify(
      {
        proof: "postgres-api-outage-recovery",
        processStable: true,
        readinessDegraded: true,
        fallbackSuppressed: true,
        readinessRecovered: true,
        outageTelemetry: true,
        recoveryTelemetry: true,
        authoritativeStateRecovered: true,
        replaySuppressedAfterRecovery: true,
      },
      null,
      2,
    ),
  );
} finally {
  if (containerState(postgresContainerId) !== "running") {
    execFileSync("docker", ["start", postgresContainerId], { stdio: "inherit" });
  }
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
      DATABASE_URL: databaseUrl,
      POSTGRES_SSL: "false",
      POSTGRES_APPLICATION_NAME: "project-jennifer-api-recovery-proof",
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
    `Jennifer health did not reach ${expectedStatus}; last=${formatLast(last)}`,
  );
}

async function waitForContainerHealthy(containerId, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastState = "unknown";
  while (Date.now() < deadline) {
    lastState = containerHealth(containerId);
    if (lastState === "healthy") return;
    await delay(250);
  }
  throw new Error(`PostgreSQL container health did not recover; last=${lastState}`);
}

function containerHealth(containerId) {
  return execFileSync(
    "docker",
    ["inspect", "--format={{.State.Health.Status}}", containerId],
    { encoding: "utf8" },
  ).trim();
}

function containerState(containerId) {
  try {
    return execFileSync(
      "docker",
      ["inspect", "--format={{.State.Status}}", containerId],
      { encoding: "utf8" },
    ).trim();
  } catch {
    return "unknown";
  }
}

function hasPersistenceOperation(events, operation) {
  return Array.isArray(events) && events.some(
    (event) =>
      event?.source === "persistence" &&
      event?.payload?.operation === operation,
  );
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8_000),
  });
  return { status: response.status, body: await response.json() };
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  return { status: response.status, body: await response.json() };
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  const [code, signal] = await once(child, "exit");
  assert.equal(signal, null, `governed shutdown should handle SIGTERM, got ${signal}`);
  assert.equal(code, 0, "Jennifer API should close governed resources cleanly");
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
