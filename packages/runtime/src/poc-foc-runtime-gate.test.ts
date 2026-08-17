import test from "node:test";
import assert from "node:assert/strict";

import type { POCFOCActionEvaluation } from "@jennifer/shared";
import { MemoryReceiptEngine } from "@jennifer/memory";

import {
  POCFOCRuntimeGate,
  RuntimeGateOutcomePersistenceError,
} from "./poc-foc-runtime-gate.js";
import {
  InMemoryRuntimeGateLedger,
  createRuntimeGateLedgerRecord,
  type RuntimeGateLedgerRecord,
} from "./runtime-gate-ledger.js";

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

class OutcomePersistenceFailureLedger extends InMemoryRuntimeGateLedger {
  override async markApplied<TOutput = unknown>(
    _actionId: string,
    _output: TOutput,
  ): Promise<RuntimeGateLedgerRecord<TOutput>> {
    throw new Error("simulated outcome persistence failure");
  }
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

test("recreated runtime uses shared ledger receipt and does not replay applied action", async () => {
  const ledger = new InMemoryRuntimeGateLedger();
  const firstRuntime = new POCFOCRuntimeGate(new MemoryReceiptEngine(), ledger);
  let mutations = 0;

  const first = await firstRuntime.execute(
    baseInput("action-survives-runtime-recreation"),
    () => {
      mutations += 1;
      return { questState: "restored" };
    },
  );

  const recreatedRuntime = new POCFOCRuntimeGate(
    new MemoryReceiptEngine(),
    ledger,
  );
  const replay = await recreatedRuntime.execute(
    baseInput("action-survives-runtime-recreation"),
    () => {
      mutations += 1;
      return { questState: "duplicated" };
    },
  );

  assert.equal(first.decision, "ACCEPT");
  assert.equal(replay.decision, "ACCEPT");
  assert.equal(replay.duplicate, true);
  assert.equal(replay.mutationApplied, true);
  assert.equal(replay.memoryReceipt.id, first.memoryReceipt.id);
  assert.deepEqual(replay.output, { questState: "restored" });
  assert.equal(mutations, 1);
});

test("prepared action is held after runtime recreation instead of guessed or replayed", async () => {
  const ledger = new InMemoryRuntimeGateLedger();
  const receiptEngine = new MemoryReceiptEngine();
  const receipt = receiptEngine.issue({
    subject: "Prepared quest decision",
    claim: "A prepared action exists but its mutation outcome is unknown.",
    evidenceRefs: ["quest-event-crash-window"],
    conceptState: "proof-of-concept",
    confidence: 0.9,
    provenance: { source: "runtime-test" },
    temporal: { lane: "procedure" },
    retrieval: {
      evidenceVerified: true,
      answerBoundToEvidence: true,
      retrievalRoots: ["quest-event-crash-window"],
    },
  });

  await ledger.reserve(
    createRuntimeGateLedgerRecord({
      actionId: "action-prepared-before-crash",
      decision: "ACCEPT",
      reasons: ["Conceptual POC/FOC checks passed."],
      evaluation: acceptedEvaluation,
      memoryReceipt: receipt,
      state: "prepared",
    }),
  );

  let mutations = 0;
  const recreatedRuntime = new POCFOCRuntimeGate(
    new MemoryReceiptEngine(),
    ledger,
  );
  const result = await recreatedRuntime.execute(
    baseInput("action-prepared-before-crash"),
    () => {
      mutations += 1;
      return "must-not-replay";
    },
  );

  assert.equal(result.decision, "HOLD");
  assert.equal(result.duplicate, true);
  assert.equal(result.mutationApplied, false);
  assert.match(result.reasons.at(-1) ?? "", /pending reconciliation/i);
  assert.equal(mutations, 0);
});

test("successful mutation with outcome persistence failure remains prepared and blocks replay", async () => {
  const ledger = new OutcomePersistenceFailureLedger();
  const gate = new POCFOCRuntimeGate(new MemoryReceiptEngine(), ledger);
  let mutations = 0;

  await assert.rejects(
    () =>
      gate.execute(baseInput("action-outcome-write-failed"), () => {
        mutations += 1;
        return "mutation-returned";
      }),
    (error: unknown) => error instanceof RuntimeGateOutcomePersistenceError,
  );

  const uncertain = await gate.getAction("action-outcome-write-failed");
  assert.equal(uncertain?.state, "prepared");
  assert.equal(uncertain?.mutationApplied, false);
  assert.equal(mutations, 1);

  const recreatedRuntime = new POCFOCRuntimeGate(
    new MemoryReceiptEngine(),
    ledger,
  );
  const replay = await recreatedRuntime.execute(
    baseInput("action-outcome-write-failed"),
    () => {
      mutations += 1;
      return "must-not-replay";
    },
  );

  assert.equal(replay.decision, "HOLD");
  assert.equal(replay.duplicate, true);
  assert.equal(replay.mutationApplied, false);
  assert.equal(mutations, 1);
});
