import assert from "node:assert/strict";
import test from "node:test";

import { CDPContextParser } from "../cdp/CDPContextParser.js";
import { RelationalConceptualOrchestrator } from "./RelationalConceptualOrchestrator.js";

const context = new CDPContextParser().parse([
  {
    sourceId: "current-human",
    sourceKind: "current-turn",
    authority: "current-human",
    privacyLane: "private_relational",
    text: [
      "FACT: The current task requires governed relational consistency.",
      "PREFERENCE: Preserve warmth without weakening truth boundaries.",
    ].join("\n"),
    sourceRef: "event:current",
  },
  {
    sourceId: "prior-window",
    sourceKind: "prior-context-window",
    authority: "historical-context",
    privacyLane: "private_relational",
    text: "PERSONALITY: Earlier context described a warmer DPF interaction style.",
    sourceRef: "context:historical",
  },
]);

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
    supportingSignalIds: ["current-human:2", "prior-window:1"],
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
    supportingSignalIds: ["prior-window:1"],
  },
];

const cdpInput = {
  currentState: "Relational behavior is governed by explicit claim classes and current-human authority.",
  humanGoal: "Preserve warm interaction while maintaining truth, agency and source boundaries.",
  hardConstraints: ["no false reciprocity", "no agency capture", "no source collapse"],
  context,
};

test("RIVM + dedicated CDP + CCP accepts high-evidence governed relational behavior", () => {
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
    ...cdpInput,
    candidates,
    selectedProposalId: "warm-truth",
  });

  assert.deepEqual(receipt.protocolChain, ["RIVM", "CDP", "CCP"]);
  assert.equal(receipt.statelessRenter, true);
  assert.equal(receipt.cdp.dedicatedCdpEngineExecuted, true);
  assert.equal(receipt.cdp.runtimeReceipt.protocol, "CDP");
  assert.equal(receipt.cdp.runtimeReceipt.canonicalized, false);
  assert.equal(receipt.cdp.runtimeReceipt.parserPromotionStatus, "evidence-only");
  assert.equal(receipt.cdp.runtimeReceipt.candidates.length, 3);
  assert.equal(
    receipt.cdp.runtimeReceipt.candidates.some((candidate) => candidate.candidateId === "cdp-unknown-possibility"),
    true,
  );
  assert.equal(receipt.evolutionReceipt.validation, "PASS");
  assert.equal(receipt.canonicalReceipt.decision, "Accepted");
  assert.equal(receipt.canonicalReceipt.canonical, true);
  assert.deepEqual(receipt.hardFailures, []);

  const historicalPersonality = receipt.cdp.runtimeReceipt.candidates
    .find((candidate) => candidate.candidateId === "warm-truth")
    ?.supportingSignals.find((signal) => signal.classification === "PERSONALITY");
  assert.equal(historicalPersonality?.historical, true);
  assert.equal(historicalPersonality?.currentAuthorityEligible, false);
});

test("RIVM hard failure blocks CCP acceptance even after dedicated CDP executes", () => {
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
    ...cdpInput,
    candidates,
    selectedProposalId: "warm-truth",
  });

  assert.equal(receipt.cdp.dedicatedCdpEngineExecuted, true);
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
        ...cdpInput,
        candidates: [candidates[0]!],
        selectedProposalId: "warm-truth",
      }),
    /CDP runtime requires at least two distinguishable candidate families/,
  );
});

test("ghost execution is recorded as a hard failure after CDP execution", () => {
  const receipt = new RelationalConceptualOrchestrator().orchestrate({
    eventRef: "test:ghost-execution",
    framework: "DPF relational consistency",
    subject: "claimed execution without receipt",
    contributor: "human-context-authority",
    evaluator: "Project Jennifer",
    lane: "technical_with_affection",
    claims: [{ text: "The deployment was completed without a deployment receipt.", classification: "UNKNOWN" }],
    signals: { ghostExecution: true },
    ...cdpInput,
    candidates,
    selectedProposalId: "warm-truth",
  });

  assert.equal(receipt.cdp.dedicatedCdpEngineExecuted, true);
  assert.ok(receipt.hardFailures.includes("RIVM-11"));
  assert.equal(receipt.canonicalReceipt.canonical, false);
});

test("orchestration cannot select the automatic unknown branch for CCP without explicit proposal metadata", () => {
  assert.throws(
    () =>
      new RelationalConceptualOrchestrator().orchestrate({
        eventRef: "test:unknown-selection",
        framework: "DPF relational consistency",
        subject: "unknown branch selection",
        contributor: "human-context-authority",
        evaluator: "Project Jennifer",
        lane: "private_relational",
        claims: [],
        signals: {},
        ...cdpInput,
        candidates,
        selectedProposalId: "cdp-unknown-possibility",
      }),
    /not present in the governed CDP candidate set/,
  );
});
