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
const mongoDatabase = process.env.MONGODB_DATABASE ?? "project_jennifer_react_ci";
assert.ok(databaseUrl, "DATABASE_URL is required for React persisted read-through proof");
assert.ok(mongoUri, "MONGODB_URI is required for React persisted read-through proof");

const apiPort = Number(process.env.JENNIFER_REACT_PROOF_API_PORT ?? 3315);
const webPort = Number(process.env.JENNIFER_REACT_PROOF_WEB_PORT ?? 3316);
const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
const webBaseUrl = `http://127.0.0.1:${webPort}`;
const actorA = "react-proof-human";
const actorB = "react-proof-system";
const createKey = "react-readthrough-proof:create";

let api = startApi();
let web;
const pg = new Pool({ connectionString: databaseUrl });
const mongo = new MongoClient(mongoUri);
await mongo.connect();
const projectionCollection = mongo
  .db(mongoDatabase)
  .collection("relationship_contexts");

try {
  await waitForApiHealth();
  web = startWeb();
  await waitForWebRoot();

  const created = await postJson(`${apiBaseUrl}/api/runtime/relationships`, {
    relationshipType: "ccp-react-persisted-readthrough",
    lane: "co-builder",
    createdByActorId: actorA,
    actors: [
      {
        id: actorA,
        actorType: "human-player",
        canonicalName: "React Proof Human",
        role: "sovereign",
      },
      {
        id: actorB,
        actorType: "system",
        canonicalName: "React Proof System",
        role: "witness",
      },
    ],
    idempotencyKey: createKey,
  });
  assert.equal(created.status, 201);
  const relationshipId = created.body.snapshot.relationship.id;
  const pageUrl = `${webBaseUrl}/relationships/${encodeURIComponent(relationshipId)}`;

  const versionOneHtml = await fetchHtml(pageUrl);
  assertPersistedEvidence(versionOneHtml, {
    relationshipId,
    version: 1,
    projectionVersion: 1,
    projectionPresent: true,
  });
  assert.match(versionOneHtml, /ccp-react-persisted-readthrough/);
  assert.match(versionOneHtml, /React Proof Human/);

  const boundary = await postJson(
    `${apiBaseUrl}/api/runtime/relationships/${relationshipId}/boundaries`,
    {
      declaredByActorId: actorA,
      boundaryType: "react-proof-boundary",
      boundaryValue: "render-authority-not-fixtures",
      idempotencyKey: "react-readthrough-proof:boundary",
    },
  );
  assert.equal(boundary.status, 201);
  assert.equal(boundary.body.snapshot.relationship.version, 2);

  const versionTwoHtml = await fetchHtml(pageUrl);
  assertPersistedEvidence(versionTwoHtml, {
    relationshipId,
    version: 2,
    projectionVersion: 2,
    projectionPresent: true,
  });
  assert.match(versionTwoHtml, /render-authority-not-fixtures/);
  assert.notEqual(
    versionOneHtml,
    versionTwoHtml,
    "dynamic React read-through must change after authoritative mutation without rebuilding the web app",
  );

  const eventCount = await pg.query(
    `SELECT count(*)::int AS count
     FROM relationship_events
     WHERE relationship_id = $1`,
    [relationshipId],
  );
  assert.equal(eventCount.rows[0].count, 2);
  const projectedV2 = await projectionCollection.findOne({ relationshipId });
  assert.equal(projectedV2?.projectionVersion, 2);

  // API process restart: the React server remains running and must resolve the
  // same persisted relationship through the restarted canonical API.
  await stopApi(api);
  api = startApi();
  await waitForApiHealth();

  const afterApiRestartHtml = await fetchHtml(pageUrl);
  assertPersistedEvidence(afterApiRestartHtml, {
    relationshipId,
    version: 2,
    projectionVersion: 2,
    projectionPresent: true,
  });

  // Destroy only adaptive projection state. React must still render the
  // PostgreSQL authority and explicitly show the projection as absent.
  await projectionCollection.deleteMany({ relationshipId });
  assert.equal(await projectionCollection.countDocuments({ relationshipId }), 0);

  const projectionAbsentHtml = await fetchHtml(pageUrl);
  assertPersistedEvidence(projectionAbsentHtml, {
    relationshipId,
    version: 2,
    projectionVersion: "absent",
    projectionPresent: false,
  });
  assert.match(
    projectionAbsentHtml,
    /Authoritative PostgreSQL state is available/,
  );

  const rebuild = await postJson(
    `${apiBaseUrl}/api/runtime/relationships/projections/rebuild`,
    {},
  );
  assert.equal(rebuild.status, 200);
  assert.equal(rebuild.body.rebuild.discovered, 1);
  assert.equal(rebuild.body.rebuild.rebuilt, 1);

  const rebuiltHtml = await fetchHtml(pageUrl);
  assertPersistedEvidence(rebuiltHtml, {
    relationshipId,
    version: 2,
    projectionVersion: 2,
    projectionPresent: true,
  });
  assert.match(rebuiltHtml, /render-authority-not-fixtures/);

  // React process restart: persisted evidence must still render from the API,
  // proving the web process itself owns no relationship truth.
  await stopWeb(web);
  web = startWeb();
  await waitForWebRoot();
  const afterWebRestartHtml = await fetchHtml(pageUrl);
  assertPersistedEvidence(afterWebRestartHtml, {
    relationshipId,
    version: 2,
    projectionVersion: 2,
    projectionPresent: true,
  });

  const replay = await postJson(`${apiBaseUrl}/api/runtime/relationships`, {
    relationshipType: "ccp-react-persisted-readthrough",
    lane: "co-builder",
    createdByActorId: actorA,
    actors: [
      {
        id: actorA,
        actorType: "human-player",
        canonicalName: "React Proof Human",
        role: "sovereign",
      },
      {
        id: actorB,
        actorType: "system",
        canonicalName: "React Proof System",
        role: "witness",
      },
    ],
    idempotencyKey: createKey,
  });
  assert.equal(replay.status, 200);
  assert.equal(replay.body.duplicate, true);
  assert.equal(replay.body.snapshot.relationship.id, relationshipId);
  assert.equal(replay.body.snapshot.relationship.version, 2);

  console.log(
    JSON.stringify(
      {
        proof: "react-persisted-relationship-readthrough",
        relationshipId,
        reactReadAuthority: "postgresql",
        reactReadProjection: "mongodb",
        liveVersionRefresh: true,
        apiRestartPreservedReadthrough: true,
        mongoWipePreservedAuthorityRendering: true,
        projectionRebuildVisibleInReact: true,
        webRestartPreservedReadthrough: true,
        fixtureAuthority: false,
        cacheFree: true,
      },
      null,
      2,
    ),
  );
} finally {
  await pg.end();
  await mongo.close();
  await stopWeb(web);
  await stopApi(api);
}

function startApi() {
  const child = spawn(process.execPath, ["apps/api/dist/server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(apiPort),
      JENNIFER_PERSISTENCE_MODE: "postgres",
      JENNIFER_PROJECTION_MODE: "mongodb",
      DATABASE_URL: databaseUrl,
      POSTGRES_SSL: "false",
      POSTGRES_APPLICATION_NAME: "project-jennifer-react-readthrough-proof",
      MONGODB_URI: mongoUri,
      MONGODB_DATABASE: mongoDatabase,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  capture(child, "api");
  return child;
}

function startWeb() {
  const child = spawn(
    process.execPath,
    [
      "apps/web/node_modules/next/dist/bin/next",
      "start",
      "apps/web",
      "-p",
      String(webPort),
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: "production",
        JENNIFER_API_URL: apiBaseUrl,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  capture(child, "web");
  return child;
}

async function waitForApiHealth() {
  const response = await waitForStatus(`${apiBaseUrl}/health`, 200, 20_000);
  assert.equal(response.body.persistence.authority, "postgresql");
  assert.equal(response.body.persistence.projection.mode, "mongodb");
}

async function waitForWebRoot() {
  await waitForStatus(webBaseUrl, 200, 20_000, false);
}

async function waitForStatus(url, expectedStatus, timeoutMs, json = true) {
  const deadline = Date.now() + timeoutMs;
  let last;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
      last = response.status;
      if (response.status === expectedStatus) {
        return {
          status: response.status,
          body: json ? await response.json() : await response.text(),
        };
      }
    } catch (error) {
      last = error;
    }
    await delay(250);
  }
  throw new Error(
    `Expected ${expectedStatus} from ${url}; last=${formatLast(last)}`,
  );
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: { accept: "text/html" },
    signal: AbortSignal.timeout(10_000),
  });
  const html = await response.text();
  assert.equal(response.status, 200, `React page failed: ${html.slice(0, 500)}`);
  return html;
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

function assertPersistedEvidence(
  html,
  { relationshipId, version, projectionVersion, projectionPresent },
) {
  assert.match(html, /data-jennifer-readthrough="persisted"/);
  assert.match(
    html,
    new RegExp(`data-relationship-id="${escapeRegExp(relationshipId)}"`),
  );
  assert.match(html, new RegExp(`data-relationship-version="${version}"`));
  assert.match(html, /data-authority="postgresql"/);
  assert.match(html, /data-authority-database="ready"/);
  assert.match(html, /data-projection-mode="mongodb"/);
  assert.match(html, /data-projection-database="ready"/);
  assert.match(
    html,
    new RegExp(
      `data-projection-version="${escapeRegExp(String(projectionVersion))}"`,
    ),
  );
  assert.match(
    html,
    new RegExp(
      `data-projection-present="${projectionPresent ? "true" : "false"}"`,
    ),
  );
  assert.match(html, /data-api-status="ok"/);
}

async function stopApi(child) {
  const exit = await terminateChild(child, "Jennifer API", 5_000);
  if (!exit) return;
  assert.equal(exit.forced, false, "Jennifer API should govern SIGTERM before timeout");
  assert.equal(exit.signal, null, `Jennifer API should govern SIGTERM, got ${exit.signal}`);
  assert.equal(exit.code, 0, "Jennifer API should close persistence cleanly");
}

async function stopWeb(child) {
  await terminateChild(child, "Next.js web", 5_000);
}

async function terminateChild(child, label, timeoutMs) {
  if (!child || child.exitCode !== null) return undefined;

  child.kill("SIGTERM");
  const graceful = await Promise.race([
    waitForChildExit(child).then(([code, signal]) => ({
      code,
      signal,
      forced: false,
    })),
    delay(timeoutMs).then(() => undefined),
  ]);
  if (graceful) return graceful;

  if (child.exitCode === null) {
    process.stderr.write(`[proof] ${label} exceeded ${timeoutMs}ms shutdown; sending SIGKILL\n`);
    child.kill("SIGKILL");
  }
  const [code, signal] = await waitForChildExit(child);
  return { code, signal, forced: true };
}

function waitForChildExit(child) {
  if (child.exitCode !== null) {
    return Promise.resolve([child.exitCode, child.signalCode]);
  }
  return once(child, "exit");
}

function capture(child, label) {
  child.stdout?.on("data", (chunk) =>
    process.stdout.write(`[${label}] ${String(chunk)}`),
  );
  child.stderr?.on("data", (chunk) =>
    process.stderr.write(`[${label}] ${String(chunk)}`),
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatLast(value) {
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
