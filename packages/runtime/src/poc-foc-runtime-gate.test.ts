import test from "node:test";
import assert from "node:assert/strict";

import type { POCFOCActionEvaluation } from "@jennifer/shared";

import { POCFOCRuntimeGate } from "./poc-foc-runtime-gate.js";

const acceptedEvaluation: POCFOCActionEvaluation = {
  decision: "ACCEPT",
  pocScore: 0.72,
  reasons: ["Conceptual POC/FOC checks passed."],
  matchedFOCGroups: [],
  sourceAuthority: "Kopano-Labs/Introduction-to-MCP",
  sourceRef: "test-fixture",
};

const rejectedEvaluation: POCFOCActionEvaluation = {
  decision: "REJECT",
  pocScore: 0.72,
  reasons: ["Operational FOC match: FOC-G05 ContextCorruptionBreach"],
  matchedFOCGroups: [
    {
      groupId: "FOC-G05",
      designation: "ContextCorruptionBreach",
      detectionMechanism: "Unauthorized Context Wiping",
      defensiveLoop: "Immediate termination of active session parameters.",
    },
  ],
  sourceAuthority: "Kopano-Labs/Introduction-to-MCP",
  sourceRef: "test-fixture",
};

function baseInput(
  actionId: string,
  evaluation: POCFOCActionEvaluation = acceptedEvaluation,
) {
  return {
    actionId,
    subject: "Quest decision",
    claim: "The player choice may mutate relationship state.",
    evaluation,
    evidenceRefs: ["quest-event-001"],
    confidence: 0.9,
    provenance: {
      source: "runtime-test",
    },
    retrieval: {
      evidenceVerified: true,
      answerBoundToEvidence: true,
      retrievalRoots: ["quest-event-001"],
    },
  };
}

test("accepted action issues admitted memory receipt before mutation", async () => {
  const gate = new POCFOCRuntimeGate();
  let mutations = 0;

  const result = await gate.execute(baseInput("action-accept"), () => {
    mutations += 1;
    return { relationshipStatus: "allied" };
  });

  assert.equal(result.decision, "ACCEPT");
  assert.equal(result.mutationApplied, true);
  assert.equal(result.duplicate, false);
  assert.equal(mutations, 1);
  assert.equal(result.memoryReceipt.admission, "admitted");
  assert.equal(result.memoryReceipt.conceptState, "proof-of-concept");
  assert.deepEqual(result.output, { relationshipStatus: "allied" });
});

test("operational FOC rejection preserves state and still emits receipt", async () => {
  const gate = new POCFOCRuntimeGate();
  let mutations = 0;

  const result = await gate.execute(
    baseInput("action-reject", rejectedEvaluation),
    () => {
      mutations += 1;
      return "should-not-run";
    },
  );

  assert.equal(result.decision, "REJECT");
  assert.equal(result.mutationApplied, false);
  assert.equal(mutations, 0);
  assert.equal(result.evaluation.matchedFOCGroups[0]?.groupId, "FOC-G05");
  assert.equal(result.memoryReceipt.conceptState, "failure-of-concept");
  assert.equal(result.memoryReceipt.admission, "admitted");
});

test("unverified evidence is held and duplicate action cannot execute twice", async () => {
  const gate = new POCFOCRuntimeGate();
  let mutations = 0;
  const heldInput = baseInput("action-hold");
  heldInput.retrieval.evidenceVerified = false;

  const held = await gate.execute(heldInput, () => {
    mutations += 1;
    return "should-not-run";
  });

  assert.equal(held.decision, "HOLD");
  assert.equal(held.mutationApplied, false);
  assert.equal(held.memoryReceipt.admission, "deferred");
  assert.equal(mutations, 0);

  const first = await gate.execute(baseInput("action-idempotent"), () => {
    mutations += 1;
    return "applied-once";
  });
  const duplicate = await gate.execute(baseInput("action-idempotent"), () => {
    mutations += 1;
    return "must-not-run";
  });

  assert.equal(first.mutationApplied, true);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.memoryReceipt.id, first.memoryReceipt.id);
  assert.equal(mutations, 1);
});
