import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const repositoryRoot = process.cwd();
const databaseUrl = process.env.DATABASE_URL;
const pgModuleRoot = process.env.PG_MODULE_ROOT;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for the PostgreSQL live proof.");
}
if (!pgModuleRoot) {
  throw new Error("PG_MODULE_ROOT is required for the PostgreSQL live proof.");
}

const requireFromPgRoot = createRequire(
  path.join(path.resolve(pgModuleRoot), "package.json"),
);
const { Pool } = requireFromPgRoot("pg");

const {
  POCFOCRuntimeGate,
  PostgresMigrationDriftError,
  PostgresMigrationRunner,
  PostgresRuntimeGateLedger,
} = await import("../packages/runtime/dist/index.js");

const acceptedEvaluation = {
  decision: "ACCEPT",
  pocScore: 0.91,
  reasons: ["Live PostgreSQL proof gate admitted the governed action."],
  matchedFOCGroups: [],
  sourceAuthority: "Kopano-Labs/Introduction-to-MCP",
  sourceRef: "postgres-live-proof",
};

const actionId = `postgres-live-proof-${Date.now()}`;
const actionInput = {
  actionId,
  subject: "PostgreSQL live persistence proof",
  claim: "A governed mutation reservation survives a real pool recreation.",
  evaluation: acceptedEvaluation,
  evidenceRefs: ["postgres-live-proof-ci"],
  confidence: 0.98,
  provenance: {
    source: "tools/prove-postgres-runtime-gate.mjs",
    proofLane: "github-actions-postgres-service",
  },
  retrieval: {
    evidenceVerified: true,
    answerBoundToEvidence: true,
    retrievalRoots: ["postgres-live-proof-ci"],
  },
};

const migrations = await loadMigrations();
assert.ok(migrations.length > 0, "Expected at least one PostgreSQL migration.");

const firstPool = createPool();
try {
  await assertDatabaseReachable(firstPool);

  const migrationRunner = new PostgresMigrationRunner(firstPool);
  const firstMigrationPass = await migrationRunner.apply(migrations);
  assert.equal(
    firstMigrationPass.every((result) => result.applied),
    true,
    "Fresh database must apply every repository migration.",
  );

  const secondMigrationPass = await migrationRunner.apply(migrations);
  assert.equal(
    secondMigrationPass.every((result) => !result.applied),
    true,
    "Second migration pass must be a checksum-verified no-op.",
  );

  const migrationLedger = await firstPool.query(
    "SELECT migration_id, checksum FROM jennifer_schema_migrations ORDER BY migration_id",
  );
  assert.equal(migrationLedger.rows.length, migrations.length);

  const firstGate = new POCFOCRuntimeGate(
    undefined,
    new PostgresRuntimeGateLedger(firstPool),
  );
  const secondGate = new POCFOCRuntimeGate(
    undefined,
    new PostgresRuntimeGateLedger(firstPool),
  );

  let mutationExecutions = 0;
  const mutation = async () => {
    mutationExecutions += 1;
    await new Promise((resolve) => setTimeout(resolve, 25));
    return {
      persisted: true,
      execution: mutationExecutions,
    };
  };

  const concurrentResults = await Promise.all([
    firstGate.execute(actionInput, mutation),
    secondGate.execute(actionInput, mutation),
  ]);

  assert.equal(
    mutationExecutions,
    1,
    "Two runtimes must not execute the same governed mutation twice.",
  );
  assert.equal(
    concurrentResults.filter((result) => result.duplicate).length,
    1,
    "Exactly one concurrent runtime must observe a duplicate reservation.",
  );

  const persistedAction = await firstPool.query(
    `
      SELECT state, mutation_applied, output_json
      FROM runtime_gate_actions
      WHERE action_id = $1
    `,
    [actionId],
  );
  assert.equal(persistedAction.rows[0]?.state, "applied");
  assert.equal(persistedAction.rows[0]?.mutation_applied, true);
} finally {
  await firstPool.end();
}

const recreatedPool = createPool();
try {
  await assertDatabaseReachable(recreatedPool);

  let replayMutations = 0;
  const recreatedGate = new POCFOCRuntimeGate(
    undefined,
    new PostgresRuntimeGateLedger(recreatedPool),
  );
  const replay = await recreatedGate.execute(actionInput, () => {
    replayMutations += 1;
    return { persisted: false, replayed: true };
  });

  assert.equal(replay.duplicate, true);
  assert.equal(replay.mutationApplied, true);
  assert.equal(replayMutations, 0, "Recreated runtime must not replay the mutation.");
  assert.deepEqual(replay.output, { persisted: true, execution: 1 });

  const drifted = migrations.map((migration, index) =>
    index === 0
      ? { ...migration, checksum: `${migration.checksum}-drift` }
      : migration,
  );
  await assert.rejects(
    () => new PostgresMigrationRunner(recreatedPool).apply(drifted),
    (error) => error instanceof PostgresMigrationDriftError,
  );

  console.log(
    JSON.stringify(
      {
        proof: "PASS",
        migrationCount: migrations.length,
        actionId,
        concurrentMutationExecutions: 1,
        restartReplayBlocked: true,
        checksumDriftBlocked: true,
      },
      null,
      2,
    ),
  );
} finally {
  await recreatedPool.end();
}

function createPool() {
  return new Pool({
    connectionString: databaseUrl,
    application_name: "project-jennifer-postgres-live-proof",
    max: 6,
    connectionTimeoutMillis: 5_000,
  });
}

async function assertDatabaseReachable(pool) {
  const result = await pool.query("SELECT current_database() AS database_name");
  assert.equal(typeof result.rows[0]?.database_name, "string");
}

async function loadMigrations() {
  const migrationDirectory = path.join(
    repositoryRoot,
    "infra",
    "postgres",
    "migrations",
  );
  const migrationFiles = (await readdir(migrationDirectory))
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  return Promise.all(
    migrationFiles.map(async (fileName) => {
      const sql = await readFile(path.join(migrationDirectory, fileName), "utf8");
      return {
        id: fileName,
        checksum: createHash("sha256").update(sql).digest("hex"),
        sql,
      };
    }),
  );
}
