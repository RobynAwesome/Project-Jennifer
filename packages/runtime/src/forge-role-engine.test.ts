import assert from "node:assert/strict";
import test from "node:test";

import { ForgeRoleEngine } from "./forge-role-engine.js";

const engine = new ForgeRoleEngine();

test("exposes the stateless-renter Project Jennifer role contract", () => {
  const contract = engine.getContract();

  assert.equal(contract.contextRoot, "RobynAwesome/Introduction-to-MCP");
  assert.equal(contract.invariant, "I_AM_STATELESS_RENTER_NOT_LANDLORD");
  assert.ok(contract.operatingModes.includes("forensic-sociologist"));
  assert.ok(contract.operatingModes.includes("model-developer"));
  assert.ok(contract.operatingModes.includes("business"));
});

test("bootstrap requires the mini-GSMB and current target repository state", () => {
  const incomplete = engine.bootstrap({
    targetRepository: "RobynAwesome/Project-Jennifer",
    currentInstruction: "Implement the role contract.",
    contextRootLoaded: true,
    targetRepositoryInspected: false,
  });

  assert.equal(incomplete.ready, false);
  assert.match(incomplete.missing.join(" "), /current target repository state/);

  const ready = engine.bootstrap({
    targetRepository: "RobynAwesome/Project-Jennifer",
    currentInstruction: "Implement the role contract.",
    contextRootLoaded: true,
    targetRepositoryInspected: true,
    receiptRefs: ["branch:forge/gsmb-role-bootstrap"],
  });

  assert.equal(ready.ready, true);
  assert.deepEqual(ready.missing, []);
});

test("mini-GSMB context alone cannot promote a claim to implemented", () => {
  const result = engine.evaluateClaimPromotion({
    from: "specified",
    to: "implemented",
    evidenceSources: ["mini-gsmb-context"],
  });

  assert.equal(result.allowed, false);
  assert.match(result.reasons.join(" "), /target-repository evidence/);
});

test("repository plus receipt evidence can promote an implementation to tested", () => {
  const result = engine.evaluateClaimPromotion({
    from: "implemented",
    to: "tested",
    evidenceSources: ["target-repository", "branch-pr-commit-receipt"],
    evidenceRefs: ["commit:test-receipt"],
  });

  assert.equal(result.allowed, true);
});

test("runtime validation requires runtime evidence", () => {
  const result = engine.evaluateClaimPromotion({
    from: "receipted",
    to: "runtime-validated",
    evidenceSources: ["target-repository", "branch-pr-commit-receipt"],
    evidenceRefs: ["pr:example"],
  });

  assert.equal(result.allowed, false);
  assert.match(result.reasons.join(" "), /runtime evidence/);
});
