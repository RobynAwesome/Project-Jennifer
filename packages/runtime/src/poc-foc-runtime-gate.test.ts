import test from "node:test";
import assert from "node:assert/strict";

import type { FrameworkDefinition, VOCRegistry } from "@jennifer/conceptual";

import { POCFOCRuntimeGate } from "./poc-foc-runtime-gate.js";

const registry: VOCRegistry = {
  parentFramework: "VOC",
  poc: {
    id: "POC",
    label: "Proof of Concept",
    groupCount: 1,
  },
  foc: {
    id: "FOC",
    labels: ["Failure of Concept", "Freedom of Concept"],
    emergent: true,
    severeBreachCode: "FOC_CONTEXT_CORRUPTION",
    groups: [
      {
        groupId: "FOC-G01",
        designation: "NeuralFailureFirewall",
        detectionMechanism: "8th Deadly Sin Monitor",
        defensiveLoop: "Immediate freeze of affected generation loops.",
      },
      {
        groupId: "FOC-G02",
        designation: "ContextBleedAnomaly",
        detectionMechanism: "CBP Telemetry Audit",
        defensiveLoop: "Non-judgmental logging of ambient packet data.",
      },
      {
        groupId: "FOC-G03",
        designation: "SemanticDriftLeak",
        detectionMechanism: "Invariance Shift Check",
        defensiveLoop: "Real-time reset of token alignment weights.",
      },
      {
        groupId: "FOC-G04",
        designation: "GhostExecutionLoop",
        detectionMechanism: "Run-time Resource Scan",
        defensiveLoop: "Isolation of non-responsive background threads.",
      },
      {
        groupId: "FOC-G05",
        designation: "ContextCorruptionBreach",
        detectionMechanism: "Unauthorized Context Wiping",
        defensiveLoop: "Immediate termination of active session parameters.",
      },
    ],
  },
  source: {
    authorityOrigin: "Kopano-Labs/Introduction-to-MCP",
    sourceRef: "test-fixture",
    indexPath: "poc-vs-foc/INDEX.md",
    classificationPath: "poc-vs-foc/FOC_CLASSIFICATION_INDEX.md",
    manifestPath: "poc-vs-foc/VOC_MANIFEST.md",
  },
};

const framework: FrameworkDefinition = {
  frameworkName: "Runtime Gate Test",
  purpose: "Prove consequential mutation is receipt-gated",
  authority: ["KPGS"],
  dependencies: [],
  contracts: ["POCFOCRuntimeGate"],
  receiptsProduced: ["MemoryReceipt"],
  receiptsConsumed: [],
  implementations: [],
  classification: "runtime-gate",
  currentPOCScore: 0,
  currentFOCRisks: [],
  recommendations: [],
};

function baseInput(actionId: string) {
  return {
    actionId,
    subject: "Quest decision",
    claim: "The player choice may mutate relationship state.",
    framework,
    supportingReceipts: [],
    evaluationRules: [],
    evidenceRefs: ["quest-event-001"],
    observedFOCSignals: [] as string[],
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
  const gate = new POCFOCRuntimeGate(registry);
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

test("operational FOC group match rejects action and preserves state", async () => {
  const gate = new POCFOCRuntimeGate(registry);
  let mutations = 0;
  const input = baseInput("action-reject");
  input.observedFOCSignals = [
    "Detected ContextCorruptionBreach after Unauthorized Context Wiping",
  ];

  const result = await gate.execute(input, () => {
    mutations += 1;
    return "should-not-run";
  });

  assert.equal(result.decision, "REJECT");
  assert.equal(result.mutationApplied, false);
  assert.equal(mutations, 0);
  assert.equal(result.matchedFOCGroups[0]?.groupId, "FOC-G05");
  assert.equal(result.memoryReceipt.conceptState, "failure-of-concept");
  assert.equal(result.memoryReceipt.admission, "admitted");
});

test("unverified evidence is held and duplicate action cannot execute twice", async () => {
  const gate = new POCFOCRuntimeGate(registry);
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
