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

test("React relationship evidence reads only through the governed API", () => {
  const apiClient = read("apps/web/src/lib/jennifer-api.ts");
  const webPackage = read("apps/web/package.json");
  const env = read(".env.example");

  assert.match(apiClient, /\/api\/runtime\/relationships\//);
  assert.match(apiClient, /\/health/);
  assert.match(apiClient, /cache:\s*"no-store"/);
  assert.match(apiClient, /JENNIFER_API_URL/);
  assert.match(apiClient, /JENNIFER_API_URL is required.*production/);
  assert.doesNotMatch(apiClient, /new (Pool|MongoClient)/);
  assert.doesNotMatch(webPackage, /"pg"\s*:/);
  assert.doesNotMatch(webPackage, /"mongodb"\s*:/);
  assert.match(env, /JENNIFER_API_URL=http:\/\/127\.0\.0\.1:3001/);
});

test("persisted relationship evidence page is dynamic and exposes source receipts", () => {
  const page = read(
    "apps/web/src/app/relationships/[relationshipId]/page.tsx",
  );

  assert.match(page, /export const dynamic = "force-dynamic"/);
  assert.match(page, /export const revalidate = 0/);
  assert.match(page, /readJenniferRelationship\(params\.relationshipId\)/);
  assert.match(page, /data-jennifer-readthrough="persisted"/);
  assert.match(page, /data-authority=\{persistence\.authority\}/);
  assert.match(page, /data-projection-mode=\{persistence\.projection\.mode\}/);
  assert.match(page, /data-relationship-version=\{relationship\.version\}/);
  assert.match(page, /data-projection-version=\{projection\?\.projectionVersion \?\? "absent"\}/);
  assert.match(page, /data-boundary-value=\{boundary\.boundaryValue\}/);
  assert.match(page, /Authoritative PostgreSQL state is available/);
});

test("React persisted evidence is discoverable without client-owned relationship state", () => {
  const home = read("apps/web/src/app/page.tsx");
  const gateway = read("apps/web/src/app/relationships/page.tsx");

  assert.match(home, /href="\/relationships"/);
  assert.match(home, /Persistence Evidence/);
  assert.match(gateway, /<form method="get"/);
  assert.match(gateway, /name="relationshipId"/);
  assert.match(gateway, /Open persisted evidence/);
  assert.doesNotMatch(gateway, /use(State|Effect|Reducer|Context)/);
});

test("live React proof crosses PostgreSQL, MongoDB, API restart, projection rebuild, and web restart", () => {
  const workflowPath = ".github/workflows/react-persisted-readthrough-proof.yml";
  const proofPath = "tools/prove-react-persisted-readthrough.mjs";
  assert.equal(existsSync(repoPath(workflowPath)), true);
  assert.equal(existsSync(repoPath(proofPath)), true);

  const workflow = read(workflowPath);
  const proof = read(proofPath);

  assert.match(workflow, /postgres:16-alpine/);
  assert.match(workflow, /mongo:7/);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.match(workflow, /pnpm --filter @jennifer\/web build/);
  assert.match(workflow, /prove-react-persisted-readthrough\.mjs/);

  assert.match(proof, /data-jennifer-readthrough=\\?"persisted/);
  assert.match(proof, /data-authority=\\?"postgresql/);
  assert.match(proof, /data-projection-mode=\\?"mongodb/);
  assert.match(proof, /deleteMany\(\{ relationshipId \}\)/);
  assert.match(proof, /projections\/rebuild/);
  assert.match(proof, /stopApi\(api\)/);
  assert.match(proof, /stopWeb\(web\)/);
  assert.match(proof, /liveVersionRefresh:\s*true/);
  assert.match(proof, /apiRestartPreservedReadthrough:\s*true/);
  assert.match(proof, /mongoWipePreservedAuthorityRendering:\s*true/);
  assert.match(proof, /projectionRebuildVisibleInReact:\s*true/);
  assert.match(proof, /webRestartPreservedReadthrough:\s*true/);
  assert.match(proof, /fixtureAuthority:\s*false/);
  assert.match(proof, /cacheFree:\s*true/);
});
