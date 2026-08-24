import assert from "node:assert/strict";
import test from "node:test";

import { MemoryReceiptEngine } from "@jennifer/memory";
import { EpistemicDivergenceEngine } from "@jennifer/npc";
import type { POCFOCActionEvaluation } from "@jennifer/shared";

import {
  NPCConsequenceAdmissionError,
  NPCConsequenceRuntimeGateway,
} from "./npc-consequence-admission.js";
import { POCFOCRuntimeGate } from "./poc-foc-runtime-gate.js";
import { InMemoryRuntimeGateLedger } from "./runtime-gate-ledger.js";

function threateningReceipt() {
  return new EpistemicDivergenceEngine().evaluate({
    event: {
      eventId: "event-runtime-gate",
      facts: [
        {
          factId: "interrupted",
          statement: "The player interrupted a protected exchange.",
          evidenceRefs: ["telemetry:event-runtime-gate:1"],
        },
        {
          factId: "ignored-warning",
          statement: "The player continued after a warning.",
          evidenceRefs: ["telemetry:event-runtime-gate:2"],
        },
      ],
    },
    actor: {
      actorId: "npc-gate-witness",
      capability: "STANDARD",
      observations: [
        { factId: "interrupted", meaning: "threat-signal", confidence: 1 },
        { factId: "ignored-warning", meaning: "obstructs-goal", confidence: 1 },
      ],
      relationship: { targetId: "player", type: "neutral", trust: 0.1 },
      currentGoal: {
        goalId: "protect-exchange",
        description: "Protect the exchange",
        priority: 1,
      },
    },
    consequenceRules: [
      {
        ruleId: "withhold-sponsorship",
        priority: 10,
        when: {
          disposition: "CONVERGE",
          interpretation: "threatening",
          minConfidence: 0.5,
        },
        effect: "withhold-sponsorship",
        visibility: "latent",
        maturesWhen: "the player next requests sponsorship",
        evidenceRefs: ["policy:npc-social:withhold-sponsorship"],
      },
    ],
  });
}

const acceptedEvaluation: POCFOCActionEvaluation = {
  decision: "ACCEPT",
  pocScore: 0.92,
  reasons: ["Causal event evidence and policy evidence are verified."],
  matchedFOCGroups: [],
  sourceAuthority: "project-jennifer-runtime-validation",
  sourceRef: "test:npc-consequence-admission",
};

const verifiedRetrieval = {
  evidenceVerified: true,
  answerBoundToEvidence: true,
  chronologicalEvidenceRead: true,
  retrievalRoots: ["telemetry:event-runtime-gate:1", "policy:npc-social:withhold-sponsorship"],
} as const;

const matured = {
  satisfied: true,
  evidenceRefs: ["telemetry:player-requested-sponsorship:1"],
  note: "Sponsorship request observed after the originating event.",
} as const;

test("latent NPC consequence stays pending until maturity evidence exists, then mutates exactly once through runtime gate", async () => {
  const receipt = threateningReceipt();
  const gateway = new NPCConsequenceRuntimeGateway();
  let mutations = 0;

  const pending = await gateway.admit({
    receipt,
    evaluation: acceptedEvaluation,
    retrieval: verifiedRetrieval,
    maturity: { satisfied: false, evidenceRefs: [] },
    applyMutation: () => {
      mutations += 1;
      return { supportAvailable: false };
    },
  });

  assert.equal(pending.status, "PENDING_MATURITY");
  assert.equal(pending.mutationApplied, false);
  assert.equal(mutations, 0);

  const admitted = await gateway.admit({
    receipt,
    evaluation: acceptedEvaluation,
    retrieval: verifiedRetrieval,
    maturity: matured,
    applyMutation: () => {
      mutations += 1;
      return { supportAvailable: false };
    },
  });

  assert.equal(admitted.status, "GATED");
  if (admitted.status !== "GATED") return;
  assert.equal(admitted.gate.decision, "ACCEPT");
  assert.equal(admitted.gate.mutationApplied, true);
  assert.equal(admitted.gate.duplicate, false);
  assert.equal(admitted.gate.memoryReceipt.admission, "admitted");
  assert.ok(admitted.gate.memoryReceipt.evidenceRefs.includes("telemetry:player-requested-sponsorship:1"));
  assert.equal(mutations, 1);

  const duplicate = await gateway.admit({
    receipt,
    evaluation: acceptedEvaluation,
    retrieval: verifiedRetrieval,
    maturity: matured,
    applyMutation: () => {
      mutations += 1;
      return { supportAvailable: false };
    },
  });

  assert.equal(duplicate.status, "GATED");
  if (duplicate.status !== "GATED") return;
  assert.equal(duplicate.gate.duplicate, true);
  assert.equal(duplicate.gate.mutationApplied, true);
  assert.equal(mutations, 1);
});

test("recreated NPC consequence gateway reuses the action ledger and does not replay an applied mutation", async () => {
  const receipt = threateningReceipt();
  const sharedLedger = new InMemoryRuntimeGateLedger();
  let mutations = 0;

  const firstGateway = new NPCConsequenceRuntimeGateway(
    new POCFOCRuntimeGate(new MemoryReceiptEngine(), sharedLedger),
  );

  const first = await firstGateway.admit({
    receipt,
    evaluation: acceptedEvaluation,
    retrieval: verifiedRetrieval,
    maturity: matured,
    applyMutation: () => {
      mutations += 1;
      return { supportAvailable: false, mutationNumber: mutations };
    },
  });

  assert.equal(first.status, "GATED");
  if (first.status !== "GATED") return;
  assert.equal(first.gate.duplicate, false);
  assert.equal(first.gate.mutationApplied, true);
  assert.equal(mutations, 1);

  // Simulated process/runtime recreation: the gateway and receipt engine are
  // new objects, while the action ledger remains the continuity authority.
  const recreatedGateway = new NPCConsequenceRuntimeGateway(
    new POCFOCRuntimeGate(new MemoryReceiptEngine(), sharedLedger),
  );

  const replay = await recreatedGateway.admit({
    receipt,
    evaluation: acceptedEvaluation,
    retrieval: verifiedRetrieval,
    maturity: matured,
    applyMutation: () => {
      mutations += 1;
      return { supportAvailable: false, mutationNumber: mutations };
    },
  });

  assert.equal(replay.status, "GATED");
  if (replay.status !== "GATED") return;
  assert.equal(replay.gate.duplicate, true);
  assert.equal(replay.gate.mutationApplied, true);
  assert.deepEqual(replay.gate.output, { supportAvailable: false, mutationNumber: 1 });
  assert.equal(replay.gate.memoryReceipt.id, first.gate.memoryReceipt.id);
  assert.equal(mutations, 1);
});

test("runtime HOLD evaluation preserves receipt but blocks NPC consequence mutation", async () => {
  const receipt = threateningReceipt();
  const gateway = new NPCConsequenceRuntimeGateway();
  let mutated = false;

  const held = await gateway.admit({
    receipt,
    evaluation: {
      ...acceptedEvaluation,
      decision: "HOLD",
      pocScore: 0.5,
      reasons: ["Narrative consequence requires additional validation."],
    },
    retrieval: verifiedRetrieval,
    maturity: {
      satisfied: true,
      evidenceRefs: ["telemetry:player-requested-sponsorship:2"],
    },
    applyMutation: () => {
      mutated = true;
      return { supportAvailable: false };
    },
  });

  assert.equal(held.status, "GATED");
  if (held.status !== "GATED") return;
  assert.equal(held.gate.decision, "HOLD");
  assert.equal(held.gate.mutationApplied, false);
  assert.equal(mutated, false);
  assert.ok(held.gate.memoryReceipt.validationErrors.length >= 0);
});

test("latent consequence cannot claim maturity without maturity evidence", async () => {
  const receipt = threateningReceipt();
  const gateway = new NPCConsequenceRuntimeGateway();

  await assert.rejects(
    () => gateway.admit({
      receipt,
      evaluation: acceptedEvaluation,
      retrieval: verifiedRetrieval,
      maturity: { satisfied: true, evidenceRefs: [] },
      applyMutation: () => ({ supportAvailable: false }),
    }),
    (error: unknown) =>
      error instanceof NPCConsequenceAdmissionError
      && /requires maturity evidence/.test(error.message),
  );
});
