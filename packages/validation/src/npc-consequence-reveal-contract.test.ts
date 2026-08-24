import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "../..");

function read(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("consequence reveal contract keeps immutable origin and explicit visibility states", () => {
  const shared = read("packages/shared/src/consequence-reveal.ts");
  assert.match(shared, /LATENT/);
  assert.match(shared, /EFFECT_VISIBLE/);
  assert.match(shared, /CAUSE_PARTIAL/);
  assert.match(shared, /CAUSE_REVEALED/);
  assert.match(shared, /REVISED/);
  assert.match(shared, /epistemicReceiptId/);
  assert.match(shared, /consequenceRuleId/);
  assert.match(shared, /player-safe-causal-reveal/);
});

test("reveal runtime derives disclosure from governed receipts instead of authored retrospective cause", () => {
  const runtime = read("packages/runtime/src/npc-consequence-reveal.ts");
  assert.match(runtime, /validateOrigin/);
  assert.match(runtime, /validateRuntimeAdmission/);
  assert.match(runtime, /runtimeDecision !== "ACCEPT"/);
  assert.match(runtime, /Memory Receipt/);
  assert.match(runtime, /cannot be rebound to a different causal origin/);
  assert.match(runtime, /requires new actor-observed causal evidence/);
  assert.match(runtime, /interpretationHistory/);

  assert.doesNotMatch(runtime, /\.statement\b/);
  assert.doesNotMatch(runtime, /\.maturesWhen\b/);
});

test("reveal telemetry records execution without claiming narrative fairness", () => {
  const telemetry = read("packages/telemetry/src/telemetry-engine.ts");
  const skill = read("skills/jennifer-companions-npcs/SKILL.md");

  assert.match(telemetry, /consequence\.reveal\.matured/);
  assert.match(telemetry, /consequence\.reveal\.inspected/);
  assert.match(telemetry, /consequence\.reveal\.revised/);

  assert.match(skill, /HIDDEN NOW != UNEXPLAINABLE FOREVER/);
  assert.match(skill, /projection.*not a new authority record/i);
  assert.match(skill, /append/i);
  assert.match(skill, /not.*proof.*narratively fair/i);
});
