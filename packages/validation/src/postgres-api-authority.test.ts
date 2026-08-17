import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "../..");

function repoPath(relativePath: string): string {
  return path.join(repoRoot, relativePath);
}

function read(relativePath: string): string {
  return readFileSync(repoPath(relativePath), "utf8");
}

test("API persistence selection is explicit and durable mode fails closed", () => {
  const persistence = read("apps/api/src/persistence.ts");
  const env = read(".env.example");

  assert.match(env, /JENNIFER_PERSISTENCE_MODE=in-memory/);
  assert.match(persistence, /NODE_ENV[\s\S]*production/);
  assert.match(
    persistence,
    /JENNIFER_PERSISTENCE_MODE must be explicit in production/,
  );
  assert.match(persistence, /new PostgresMigrationRunner\(observed\)\.apply/);
  assert.match(persistence, /new PostgresRelationshipAuthorityStore\(observed\)/);
  assert.doesNotMatch(persistence, /catch[\s\S]{0,300}new InMemoryRelationshipAuthorityStore/);
});

test("relationship authority adapter transaction-binds event, receipt, and outbox", () => {
  const adapter = read(
    "packages/runtime/src/postgres-relationship-authority-store.ts",
  );

  assert.match(adapter, /await client\.query\("BEGIN"\)/);
  assert.match(adapter, /pg_advisory_xact_lock\(hashtextextended\(\$1, 0\)\)/);
  assert.match(adapter, /INSERT INTO relationship_instances/i);
  assert.match(adapter, /INSERT INTO relationship_events/i);
  assert.match(adapter, /INSERT INTO relationship_validation_receipts/i);
  assert.match(adapter, /INSERT INTO relationship_outbox_events/i);
  assert.match(adapter, /await client\.query\("COMMIT"\)/);
  assert.match(adapter, /RelationshipAuthorityDuplicateError/);
});

test("canonical relationship router is the only source-level relationship HTTP authority", () => {
  const server = read("apps/api/src/server.ts");
  const legacyRuntime = read("apps/api/src/routes/runtime.ts");
  const canonicalMount = server.indexOf(
    'app.use(\n  "/api/runtime/relationships"',
  );
  const legacyMount = server.indexOf('app.use("/api/runtime", runtimeRouter)');

  assert.ok(canonicalMount >= 0, "canonical relationship router must be mounted");
  assert.ok(legacyMount >= 0, "legacy runtime router must remain mounted for non-relationship routes");
  assert.ok(
    canonicalMount < legacyMount,
    "canonical relationship authority must be mounted before the legacy runtime router",
  );
  assert.doesNotMatch(legacyRuntime, /router\.(get|post)\("\/relationships/);
  assert.doesNotMatch(legacyRuntime, /new RelationshipEngine\(/);
  assert.match(legacyRuntime, /Relationship authority intentionally does not live in this legacy router/);
  assert.match(server, /persistence:\s*persistenceHealth/);
  assert.match(server, /persistenceHealth\.database === "ready"/);
});

test("PostgreSQL readiness transitions survive pool errors and emit explicit recovery telemetry", () => {
  const persistence = read("apps/api/src/persistence.ts");

  assert.match(persistence, /this\.pool\.on\("error"/);
  assert.match(persistence, /"pool-error"/);
  assert.match(persistence, /persistence\.database-unavailable/);
  assert.match(persistence, /persistence\.database-recovered/);
  assert.match(persistence, /databaseState === "unavailable"/);
});

test("live API authority and outage recovery proofs are executable PostgreSQL 16 gates", () => {
  const workflowPath = ".github/workflows/postgres-api-authority-proof.yml";
  const authorityProofPath = "tools/prove-postgres-api-authority.mjs";
  const recoveryProofPath = "tools/prove-postgres-api-recovery.mjs";
  assert.equal(existsSync(repoPath(workflowPath)), true);
  assert.equal(existsSync(repoPath(authorityProofPath)), true);
  assert.equal(existsSync(repoPath(recoveryProofPath)), true);

  const workflow = read(workflowPath);
  const authorityProof = read(authorityProofPath);
  const recoveryProof = read(recoveryProofPath);
  assert.match(workflow, /postgres:16-alpine/);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.match(workflow, /prove-postgres-api-authority\.mjs/);
  assert.match(workflow, /POSTGRES_CONTAINER_ID:\s*\$\{\{ job\.services\.postgres\.id \}\}/);
  assert.match(workflow, /prove-postgres-api-recovery\.mjs/);

  assert.match(authorityProof, /Promise\.all/);
  assert.match(authorityProof, /restartRecovered:\s*true/);
  assert.match(authorityProof, /replaySuppressed:\s*true/);
  assert.match(authorityProof, /databaseFailureFailsClosed:\s*true/);
  assert.match(authorityProof, /productionModeMustBeExplicit:\s*true/);

  assert.match(recoveryProof, /docker", \["stop"/);
  assert.match(recoveryProof, /docker", \["start"/);
  assert.match(recoveryProof, /processStable:\s*true/);
  assert.match(recoveryProof, /readinessDegraded:\s*true/);
  assert.match(recoveryProof, /readinessRecovered:\s*true/);
  assert.match(recoveryProof, /outageTelemetry:\s*true/);
  assert.match(recoveryProof, /recoveryTelemetry:\s*true/);
  assert.match(recoveryProof, /replaySuppressedAfterRecovery:\s*true/);
});
