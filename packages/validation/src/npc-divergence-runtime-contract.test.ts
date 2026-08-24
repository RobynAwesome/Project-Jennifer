import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "../..");

function read(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("NPC tick integration preserves actor-model receipts and blocks direct consequence mutation", () => {
  const runtime = read("packages/npc/src/npc-runtime.ts");
  assert.match(runtime, /queueEpistemicEvent/);
  assert.match(runtime, /broadcastEpistemicEvent/);
  assert.match(runtime, /tickDetailed/);
  assert.match(runtime, /mutationApplied:\s*false/);
  assert.match(runtime, /consequenceMutationApplied:\s*false/);
  assert.match(runtime, /validationState/);
  assert.match(runtime, /proofState/);
});

test("NPC consequence gateway requires maturity evidence and delegates mutation to POCFOCRuntimeGate", () => {
  const gateway = read("packages/runtime/src/npc-consequence-admission.ts");
  assert.match(gateway, /PENDING_MATURITY/);
  assert.match(gateway, /requires maturity evidence/);
  assert.match(gateway, /POCFOCRuntimeGate/);
  assert.match(gateway, /runtimeGate\.execute/);
  assert.match(gateway, /actorValidationState/);
  assert.match(gateway, /npc-consequence:/);
});

test("NPC skill surfaces preserve delayed consequence governance", () => {
  const npcSkill = read("skills/jennifer-companions-npcs/SKILL.md");
  const runtimeSkill = read("skills/jennifer-runtime-memory/SKILL.md");
  const architecture = read("docs/architecture/npc-divergence-runtime-integration.md");

  for (const source of [npcSkill, runtimeSkill, architecture]) {
    assert.match(source, /maturity evidence/i);
    assert.match(source, /POCFOC|POC\/FOC/);
    assert.match(source, /Memory Receipt/);
  }

  assert.match(npcSkill, /actor-model/);
  assert.match(npcSkill, /mutationApplied:\s*false/);
  assert.match(architecture, /UNVALIDATED != admitted mutation/);
});
