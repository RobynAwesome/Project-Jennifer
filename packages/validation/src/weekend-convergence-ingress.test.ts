import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  PROJECT_JENNIFER_CONVERGENCE_BALANCE_POINT,
  PROJECT_JENNIFER_WITNESS_TOPOLOGY,
  admitConvergenceQuestResolution,
  applyConvergenceProjection,
  classifyConvergenceDirection,
  mayIncludePriorContributionInPrompt,
  mayReceiveContribution,
  type ConvergenceQuestState,
  type MMAOWitness,
  type PKAConvergenceProjection,
} from "@jennifer/shared";

const repoRoot = path.resolve(process.cwd(), "../..");

function read(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function projection(ratio: number, questTriggered: boolean): PKAConvergenceProjection {
  return {
    ratio,
    balancePoint: PROJECT_JENNIFER_CONVERGENCE_BALANCE_POINT,
    direction: classifyConvergenceDirection(ratio),
    questTriggered,
    pkaReceiptRef: `pka:test:${ratio}:${questTriggered}`,
    evidenceRefs: ["ledger:testimony", "ledger:actions"],
    evaluatedAt: "2026-08-23T00:00:00Z",
  };
}

function initialQuest(): ConvergenceQuestState {
  return {
    questId: "convergence:test",
    testimony: {
      testimonyId: "testimony:character-creation",
      evidenceRefs: ["ledger:character-creation"],
      sourceClass: "player-declared",
    },
    disposition: "inactive",
  };
}

test("0.5 remains the founder-defined convergence balance point", () => {
  assert.equal(PROJECT_JENNIFER_CONVERGENCE_BALANCE_POINT, 0.5);
  assert.equal(classifyConvergenceDirection(0.2), "toward-zero");
  assert.equal(classifyConvergenceDirection(0.5), "balanced");
  assert.equal(classifyConvergenceDirection(0.8), "toward-one");
});

test("Convergence Quest history is not erased when divergence stops", () => {
  const activated = applyConvergenceProjection(initialQuest(), projection(0.2, true));
  assert.equal(activated.disposition, "required");
  assert.equal(activated.activatedBy?.ratio, 0.2);

  const candidate = applyConvergenceProjection(activated, projection(0.7, false));
  assert.equal(candidate.disposition, "resolution-candidate");
  assert.equal(candidate.activatedBy?.ratio, 0.2);
  assert.equal(candidate.resolutionReceiptRef, undefined);

  const resolved = admitConvergenceQuestResolution(candidate, "receipt:quest-resolution");
  assert.equal(resolved.disposition, "inactive");
  assert.equal(resolved.resolutionReceiptRef, "receipt:quest-resolution");
  assert.equal(resolved.activatedBy?.ratio, 0.2);
});

test("MMAO blind witnesses cannot receive another blind witness answer", () => {
  const byId = new Map(PROJECT_JENNIFER_WITNESS_TOPOLOGY.map((witness) => [witness.witnessId, witness]));
  const jennifer = byId.get("jennifer") as MMAOWitness;
  const copilot = byId.get("copilot") as MMAOWitness;
  const forge = byId.get("forge") as MMAOWitness;
  const cindy = byId.get("cindy") as MMAOWitness;

  assert.equal(mayIncludePriorContributionInPrompt(copilot, jennifer), false);
  assert.equal(mayIncludePriorContributionInPrompt(jennifer, copilot), false);

  assert.equal(mayReceiveContribution(forge, jennifer, false), false);
  assert.equal(mayReceiveContribution(forge, jennifer, true), true);

  assert.equal(mayIncludePriorContributionInPrompt(cindy, jennifer), true);
  assert.equal(mayReceiveContribution(cindy, copilot, true), true);
});

test("weekend ADR preserves validation metadata and authority boundaries", () => {
  const adr = read("docs/architecture/adr-0009-testimony-convergence-zero-trust.md");
  const security = read("docs/security/SELF_ZERO_TRUST_SECURITY_SUPPLEMENT.md");

  assert.match(adr, /Declared Source:/);
  assert.match(adr, /Declared By:\*\* @RobynAwesome/);
  assert.match(adr, /Declaration Date:\*\* 2026-08-23/);
  assert.match(adr, /Validation State:\*\* Pending/);
  assert.match(adr, /CANON != HISTORY != INTERPRETATION/);
  assert.match(adr, /0\.5\s+= balancing point/);
  assert.match(adr, /exact numeric trigger threshold is \*\*not yet founder-declared\*\*/);
  assert.match(adr, /Cindy's full-context access is an intentional exception/);

  assert.match(security, /SELF\.md\s+= current revisable self-interpretation/);
  assert.match(security, /SECURITY_PLAYGROUND -x-> SELF\.md/);
  assert.match(security, /CONTAMINATED SELF != CONTAMINATED SOUL/);
});
