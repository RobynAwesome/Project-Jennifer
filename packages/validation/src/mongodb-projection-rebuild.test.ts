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

test("MongoDB is configured only as a rebuildable relationship projection", () => {
  const packageJson = read("apps/api/package.json");
  const env = read(".env.example");
  const persistence = read("apps/api/src/persistence.ts");

  assert.match(packageJson, /"mongodb":\s*"\^7\.5\.0"/);
  assert.match(env, /JENNIFER_PROJECTION_MODE=in-memory/);
  assert.match(env, /MONGODB_URI=/);
  assert.match(persistence, /JENNIFER_PROJECTION_MODE=mongodb requires JENNIFER_PERSISTENCE_MODE=postgres/);
  assert.match(persistence, /new PostgresRelationshipAuthorityStore\(observed\)/);
  assert.match(persistence, /projectionRuntime\.store \?\? new InMemoryRelationshipProjectionStore/);
  assert.doesNotMatch(persistence, /new MongoClient/);
});

test("Mongo projection version is authoritative and deterministic across retries", () => {
  const adapter = read(
    "packages/runtime/src/mongo-relationship-projection-store.ts",
  );
  const mongoBinding = read("apps/api/src/mongo-projection.ts");

  assert.match(adapter, /projectionVersion:\s*snapshot\.relationship\.version/);
  assert.match(adapter, /updatedAt:\s*snapshot\.relationship\.updatedAt/);
  assert.match(adapter, /snapshot\.events\.at\(-1\)\?\.id \?\? eventId/);
  assert.match(mongoBinding, /putMonotonic/);
  assert.match(mongoBinding, /current\.projectionVersion > projection\.projectionVersion/);
  assert.match(mongoBinding, /current\.projectionVersion === projection\.projectionVersion/);
  assert.match(mongoBinding, /Projection version conflict/);
  assert.match(mongoBinding, /insertOne\(\{ \.\.\.projection \}\)/);
  assert.match(mongoBinding, /_id:\s*_ignored/);
});

test("projection rebuild discovers relationships from PostgreSQL outbox history", () => {
  const rebuilder = read(
    "packages/runtime/src/relationship-projection-rebuilder.ts",
  );
  const persistence = read("apps/api/src/persistence.ts");
  const router = read("apps/api/src/routes/relationships.ts");

  assert.match(rebuilder, /SELECT DISTINCT aggregate_id/);
  assert.match(rebuilder, /FROM relationship_outbox_events/);
  assert.match(rebuilder, /aggregate_type = 'relationship'/);
  assert.doesNotMatch(rebuilder, /published_at IS NULL/);
  assert.match(rebuilder, /authority\.getSnapshot\(relationshipId\)/);
  assert.match(rebuilder, /projections\.upsertFromAuthoritativeSnapshot/);
  assert.match(persistence, /new RelationshipProjectionRebuilder/);
  assert.match(router, /"\/projections\/rebuild"/);
  assert.match(router, /res\.status\(409\)/);
});

test("configured Mongo projection participates in API readiness", () => {
  const server = read("apps/api/src/server.ts");
  const mongoBinding = read("apps/api/src/mongo-projection.ts");

  assert.match(server, /persistenceHealth\.projection\.mode !== "mongodb"/);
  assert.match(server, /persistenceHealth\.projection\.database === "ready"/);
  assert.match(server, /projectionMode/);
  assert.match(mongoBinding, /database\.command\(\{ ping: 1 \}\)/);
  assert.match(mongoBinding, /serverSelectionTimeoutMS:\s*5_000/);
});

test("live PostgreSQL to MongoDB rebuild proof wipes projection and converges", () => {
  const workflowPath = ".github/workflows/mongodb-projection-rebuild-proof.yml";
  const proofPath = "tools/prove-mongodb-projection-rebuild.mjs";
  assert.equal(existsSync(repoPath(workflowPath)), true);
  assert.equal(existsSync(repoPath(proofPath)), true);

  const workflow = read(workflowPath);
  const proof = read(proofPath);
  assert.match(workflow, /postgres:16-alpine/);
  assert.match(workflow, /mongo:7/);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.match(workflow, /prove-mongodb-projection-rebuild\.mjs/);
  assert.match(proof, /SET published_at = NULL/);
  assert.match(proof, /deleteMany\(\{ relationshipId \}\)/);
  assert.match(proof, /projections\/rebuild/);
  assert.match(proof, /duplicateDeliveryIdempotent:\s*true/);
  assert.match(proof, /rebuiltFromPostgresOutboxEvidence:\s*true/);
  assert.match(proof, /repeatedRebuildIdempotent:\s*true/);
});
