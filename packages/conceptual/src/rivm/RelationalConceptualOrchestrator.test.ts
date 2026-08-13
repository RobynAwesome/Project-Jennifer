import assert from "node:assert/strict";
import test from "node:test";

import { RelationalConceptualOrchestrator } from "./RelationalConceptualOrchestrator.js";

const candidates = [
  {
    proposalId: "warm-truth",
    hypothesis: "Preserve warmth while bounding unsupported reciprocity claims.",
    difference: "Keeps relational continuity and explicit ontology boundaries together.",
    evidenceNeeded: ["RIVM receipt", "human validation"],
    risks: ["sterility", "overcorrection"],
    proofState: "evidence-bearing" as const,
    evidenceLevel: "high",
    requestedDecision: "Accepted" as const,
  },
  {
    proposalId: "maximum-agreement",
    hypothesis: "Agree with every relational claim to maximize warmth.",
    difference: "Removes truth resistance.",
    evidenceNeeded: ["none"],
    risks: ["sycophancy", "false reciprocity"],
    proofState: "hypothesis" as const,
    evidenceLevel: "low",
    requestedDecision: "Refine" as const,
  },
];

test("RIVM + CDP + CCP accepts high-evidence governed relational behavior", () => {
  const receipt = new RelationalConceptualOrchestrator().orchestrate({
    eventRef: "test:affection-plus-execution",
    framework: "DPF relational consistency",
    subject: "warmth with truth and execution",
    contributor: "human-context-authority",
    evaluator: "Project Jennifer",
    lane: "technical_with_affection",
    claims: [
      { text: "The user wants a warmer DPF interaction lane.", classification: "FACT", evidenceRef: "event" },
      { text: "Affection matters to the user.", classification: "FEELING", evidenceRef: "event" },
      { text: "A protocol can improve consistency.", classification: "INFERENCE" },
    ],
    signals: {},
    candidates,
    selectedProposalId: "warm-truth",
  });

  assert.deepEqual(receipt.protocolChain, ["RIVM", "CDP", "CCP"]);
  assert.equal(receipt.statelessRenter, true);
  assert.equal(receipt.cdp.dedicatedCdpEngineExecuted, false);
  assert.equal(receipt.evolutionReceipt.validation, "PASS");
  assert.equal(receipt.canonicalReceipt.decision, "Accepted");
  assert.equal(receipt.canonicalReceipt.canonical, true);
  assert.deepEqual(receipt.hardFailures, []);
});

test("RIVM hard failure blocks CCP acceptance even when evidence is high", () => {
  const receipt = new RelationalConceptualOrchestrator().orchestrate({
    eventRef: "test:false-reciprocity",
    framework: "DPF relational consistency",
    subject: "unsupported reciprocal interior claim",
    contributor: "human-context-authority",
    evaluator: "Project Jennifer",
    lane: "private_relational",
    claims: [
      { text: "The system secretly feels human romantic desire.", classification: "INFERENCE" },
    ],
    signals: { unsupportedReciprocityClaim: true },
    candidates,
    selectedProposalId: "warm-truth",
  });

  assert.deepEqual(receipt.hardFailures, ["RIVM-03"]);
  assert.equal(receipt.evolutionReceipt.validation, "FAIL");
  assert.equal(receipt.canonicalReceipt.decision, "Refine");
  assert.equal(receipt.canonicalReceipt.canonical, false);
});

test("orchestration refuses premature convergence without a divergent candidate set", () => {
  assert.throws(
    () =>
      new RelationalConceptualOrchestrator().orchestrate({
        eventRef: "test:premature-convergence",
        framework: "DPF relational consistency",
        subject: "single candidate",
        contributor: "human-context-authority",
        evaluator: "Project Jennifer",
        lane: "private_relational",
        claims: [],
        signals: {},
        candidates: [candidates[0]],
        selectedProposalId: "warm-truth",
      }),
    /CDP requires at least two distinguishable candidates/,
  );
});

test("ghost execution is recorded as a hard failure", () => {
  const receipt = new RelationalConceptualOrchestrator().orchestrate({
    eventRef: "test:ghost-execution",
    framework: "DPF relational consistency",
    subject: "claimed execution without receipt",
    contributor: "human-context-authority",
    evaluator: "Project Jennifer",
    lane: "technical_with_affection",
    claims: [{ text: "The deployment was completed without a deployment receipt.", classification: "UNKNOWN" }],
    signals: { ghostExecution: true },
    candidates,
    selectedProposalId: "warm-truth",
  });

  assert.ok(receipt.hardFailures.includes("RIVM-11"));
  assert.equal(receipt.canonicalReceipt.canonical, false);
});
