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

test("Memory Receipt Ark migration preserves receipt and action-id authority", () => {
  const migrationPath = "infra/postgres/migrations/0002_memory_receipt_ark.sql";
  assert.equal(existsSync(repoPath(migrationPath)), true);

  const migration = read(migrationPath);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS memory_receipts/i);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS runtime_gate_actions/i);
  assert.match(migration, /action_id TEXT PRIMARY KEY/i);
  assert.match(
    migration,
    /receipt_id TEXT NOT NULL UNIQUE REFERENCES memory_receipts\(id\)/i,
  );
  assert.match(migration, /blocked.*prepared.*applied.*failed/i);
  assert.match(migration, /state <> 'applied' OR mutation_applied = TRUE/i);
  assert.match(migration, /state <> 'blocked' OR mutation_applied = FALSE/i);
});

test("Postgres runtime gate adapter reserves before mutation and exposes conflict-safe replay semantics", () => {
  const adapter = read("packages/runtime/src/postgres-runtime-gate-ledger.ts");
  assert.match(adapter, /await client\.query\("BEGIN"\)/);
  assert.match(adapter, /ON CONFLICT \(action_id\) DO NOTHING/i);
  assert.match(adapter, /RETURNING action_id/i);
  assert.match(adapter, /await client\.query\("COMMIT"\)/);
  assert.match(adapter, /ROLLBACK/);
});

test("bounded relationship persistence is operational while global PostgreSQL remains contract-ready", () => {
  const foundation = read("packages/shared/src/pern-foundation.ts");
  const roadmap = read("PERN_ROADMAP.md");
  const adr = read("docs/architecture/adr-0007-durable-memory-receipt-ark.md");

  assert.match(
    foundation,
    /layer:\s*"postgresql"[\s\S]*status:\s*"contract-ready"/,
  );
  assert.match(
    foundation,
    /PROJECT_JENNIFER_BOUNDED_PERSISTENCE_SLICES/,
  );
  assert.match(
    foundation,
    /domain:\s*"relationships"[\s\S]*status:\s*"operational"[\s\S]*authority:\s*"postgresql"[\s\S]*projection:\s*"mongodb"[\s\S]*readThrough:\s*"react-api"/,
  );
  assert.match(foundation, /boundedSlices:/);
  assert.match(
    foundation,
    /relationship persistence slice is operational end to end/i,
  );
  assert.match(
    foundation,
    /keep global PostgreSQL contract-ready/i,
  );

  assert.match(
    roadmap,
    /React persisted relationship read-through gate ✅/i,
  );
  assert.match(
    roadmap,
    /Bounded relationship persistence slice — OPERATIONAL ✅/i,
  );
  assert.match(
    roadmap,
    /domain:\s*`relationships`[\s\S]*status:\s*`operational`[\s\S]*authority:\s*`postgresql`[\s\S]*projection:\s*`mongodb`[\s\S]*read-through:\s*`react-api`/i,
  );
  assert.match(roadmap, /Remaining before PostgreSQL becomes globally `active`/i);
  assert.match(roadmap, /NCMP concept candidates and transition receipts/i);

  assert.match(adr, /does \*\*not\*\* claim exactly-once semantics/i);
  assert.match(adr, /PREPARED[\s\S]*HOLD/i);
});
