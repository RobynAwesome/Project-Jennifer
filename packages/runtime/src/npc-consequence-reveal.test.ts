import assert from "node:assert/strict";
import test from "node:test";

import type { MemoryReceipt } from "@jennifer/memory";
import {
  EpistemicDivergenceEngine,
  type EpistemicDivergenceReceipt,
} from "@jennifer/npc";
import {
  InProcessEventBus,
  type JenniferEventMap,
  type POCFOCActionEvaluation,
} from "@jennifer/shared";
import { TelemetryCollector } from "@jennifer/telemetry";

import { NPCConsequenceRuntimeGateway } from "./npc-consequence-admission.js";
import {
  ConsequenceRevealError,
  NPCConsequenceRevealEngine,
} from "./npc-consequence-reveal.js";

const event = {
  eventId: "event-reveal-contract",
  facts: [
    {
      factId: "interrupted",
      statement: "PRIVATE_INTERNAL_FACT_TEXT: the player interrupted a protected exchange.",
      evidenceRefs: ["telemetry:event-reveal-contract:interrupt"],
    },
    {
      factId: "returned-item",
      statement: "PRIVATE_INTERNAL_FACT_TEXT: the player later returned the protected item.",
      evidenceRefs: ["telemetry:event-reveal-contract:return"],
    },
  ],
} as const;

const consequenceRules = [
  {
    ruleId: "withhold-sponsorship",
    priority: 10,
    when: {
      disposition: "CONVERGE" as const,
      interpretation: "threatening" as const,
      minConfidence: 0.4,
    },
    effect: "withhold-sponsorship",
    visibility: "latent" as const,
    maturesWhen: "PRIVATE_INTERNAL_POLICY_TEXT: next sponsorship request",
    evidenceRefs: ["policy:npc-social:withhold-sponsorship"],
  },
] as const;

const acceptedEvaluation: POCFOCActionEvaluation = {
  decision: "ACCEPT",
  pocScore: 0.95,
  reasons: ["Causal, policy and maturity evidence are verified."],
  matchedFOCGroups: [],
  sourceAuthority: "project-jennifer-runtime-validation",
  sourceRef: "test:npc-consequence-reveal",
};

const verifiedRetrieval = {
  evidenceVerified: true,
  answerBoundToEvidence: true,
  chronologicalEvidenceRead: true,
  retrievalRoots: [
    "telemetry:event-reveal-contract:interrupt",
    "policy:npc-social:withhold-sponsorship",
  ],
} as const;

function originReceipt(actorId = "npc-reveal-witness"): EpistemicDivergenceReceipt {
  return new EpistemicDivergenceEngine().evaluate({
    event,
    actor: {
      actorId,
      capability: "STANDARD",
      observations: [
        {
          factId: "interrupted",
          meaning: "threat-signal",
          confidence: 1,
        },
      ],
      relationship: { targetId: "player", type: "neutral", trust: 0 },
      currentGoal: {
        goalId: "protect-exchange",
        description: "Protect the exchange",
        priority: 1,
      },
    },
    consequenceRules,
  });
}

function revisedReceipt(actorId = "npc-reveal-witness"): EpistemicDivergenceReceipt {
  return new EpistemicDivergenceEngine().evaluate({
    event,
    actor: {
      actorId,
      capability: "STANDARD",
      observations: [
        {
          factId: "interrupted",
          meaning: "threat-signal",
          confidence: 0.2,
        },
        {
          factId: "returned-item",
          meaning: "trust-signal",
          confidence: 1,
        },
      ],
      relationship: { targetId: "player", type: "ally", trust: 0.9 },
    },
  });
}

function sameEvidenceRevision(actorId = "npc-reveal-witness"): EpistemicDivergenceReceipt {
  return new EpistemicDivergenceEngine().evaluate({
    event,
    actor: {
      actorId,
      capability: "STANDARD",
      observations: [
        {
          factId: "interrupted",
          meaning: "trust-signal",
          confidence: 1,
        },
      ],
      relationship: { targetId: "player", type: "ally", trust: 1 },
    },
  });
}

async function admittedMemoryReceipt(
  receipt: EpistemicDivergenceReceipt,
  maturityRef = "telemetry:player-requested-sponsorship:reveal",
): Promise<MemoryReceipt> {
  const gateway = new NPCConsequenceRuntimeGateway();
  const result = await gateway.admit({
    receipt,
    evaluation: acceptedEvaluation,
    retrieval: verifiedRetrieval,
    maturity: {
      satisfied: true,
      evidenceRefs: [maturityRef],
      note: "Sponsorship request observed after origin event.",
    },
    applyMutation: () => ({ supportAvailable: false }),
  });

  assert.equal(result.status, "GATED");
  if (result.status !== "GATED") throw new Error("Expected gated admission");
  assert.equal(result.gate.decision, "ACCEPT");
  assert.equal(result.gate.mutationApplied, true);
  return result.gate.memoryReceipt;
}

function revealHarness() {
  const telemetry = new TelemetryCollector(
    new InProcessEventBus<JenniferEventMap>(),
  );
  return {
    telemetry,
    reveal: new NPCConsequenceRevealEngine(telemetry),
  };
}

test("latent reveal preserves immutable origin linkage while redacting effect, cause and internal text", () => {
  const receipt = originReceipt();
  const { reveal } = revealHarness();
  const latent = reveal.create({ epistemicReceipt: receipt });

  assert.equal(latent.state, "LATENT");
  assert.equal(latent.effect, undefined);
  assert.equal(latent.origin.epistemicReceiptId, receipt.receiptId);
  assert.equal(latent.origin.eventId, receipt.eventId);
  assert.equal(latent.origin.actorId, receipt.actorId);
  assert.equal(latent.runtimeAdmission, undefined);
  assert.deepEqual(latent.disclosedEvidence, {
    event: [],
    policy: [],
    maturity: [],
    revision: [],
  });
  assert.deepEqual(latent.interpretationHistory, []);
  assert.equal(latent.canonical, false);
  assert.equal(latent.proofState, "player-safe-causal-reveal");

  const serialized = JSON.stringify(latent);
  assert.doesNotMatch(serialized, /PRIVATE_INTERNAL_FACT_TEXT/);
  assert.doesNotMatch(serialized, /PRIVATE_INTERNAL_POLICY_TEXT/);
  assert.doesNotMatch(serialized, /provenance/);

  assert.equal(Object.isFrozen(latent), true);
  assert.equal(Object.isFrozen(latent.origin), true);
  assert.equal(Object.isFrozen(latent.disclosedEvidence), true);
  assert.equal(Object.isFrozen(latent.disclosedEvidence.event), true);
});

test("reveal advances monotonically from effect to partial cause to full cause and emits maturity/inspection telemetry", async () => {
  const receipt = originReceipt();
  const memoryReceipt = await admittedMemoryReceipt(receipt);
  const source = { epistemicReceipt: receipt, runtimeMemoryReceipt: memoryReceipt };
  const { reveal, telemetry } = revealHarness();
  const latent = reveal.create({ epistemicReceipt: receipt });

  await assert.rejects(
    () => reveal.advance(latent, source, "CAUSE_REVEALED"),
    (error: unknown) =>
      error instanceof ConsequenceRevealError
      && /cannot advance/.test(error.message),
  );

  const effectVisible = await reveal.advance(latent, source, "EFFECT_VISIBLE");
  assert.equal(effectVisible.effect, "withhold-sponsorship");
  assert.deepEqual(effectVisible.disclosedEvidence.event, []);
  assert.equal(effectVisible.runtimeAdmission?.memoryReceiptId, memoryReceipt.id);
  assert.equal(telemetry.query({ kind: "consequence.reveal.matured" }).length, 1);

  const partial = await reveal.advance(effectVisible, source, "CAUSE_PARTIAL");
  assert.deepEqual(partial.disclosedEvidence.event, [
    "telemetry:event-reveal-contract:interrupt",
  ]);
  assert.deepEqual(partial.disclosedEvidence.policy, []);
  assert.deepEqual(partial.disclosedEvidence.maturity, []);
  assert.deepEqual(partial.interpretationHistory, []);

  const revealed = await reveal.advance(partial, source, "CAUSE_REVEALED");
  assert.deepEqual(revealed.disclosedEvidence.event, [
    "telemetry:event-reveal-contract:interrupt",
  ]);
  assert.deepEqual(revealed.disclosedEvidence.policy, [
    "policy:npc-social:withhold-sponsorship",
  ]);
  assert.deepEqual(revealed.disclosedEvidence.maturity, [
    "telemetry:player-requested-sponsorship:reveal",
  ]);
  assert.equal(revealed.interpretationHistory.length, 1);
  assert.equal(revealed.interpretationHistory[0]?.belief, "threatening");
  assert.deepEqual(revealed.interpretationHistory[0]?.observedFactIds, ["interrupted"]);
  assert.deepEqual(revealed.interpretationHistory[0]?.unknownFactIds, ["returned-item"]);

  const inspected = await reveal.inspect(revealed);
  assert.equal(inspected, revealed);
  assert.equal(telemetry.query({ kind: "consequence.reveal.inspected" }).length, 1);
});

test("player-visible reveal rejects a runtime Memory Receipt from a different causal origin", async () => {
  const receipt = originReceipt();
  const other = originReceipt("npc-other-witness");
  const otherMemoryReceipt = await admittedMemoryReceipt(
    other,
    "telemetry:player-requested-sponsorship:other",
  );
  const { reveal } = revealHarness();
  const latent = reveal.create({ epistemicReceipt: receipt });

  await assert.rejects(
    () => reveal.advance(
      latent,
      { epistemicReceipt: receipt, runtimeMemoryReceipt: otherMemoryReceipt },
      "EFFECT_VISIBLE",
    ),
    (error: unknown) =>
      error instanceof ConsequenceRevealError
      && /does not belong/.test(error.message),
  );
});

test("revision appends new evidence and interpretation without erasing the original receipt history", async () => {
  const receipt = originReceipt();
  const memoryReceipt = await admittedMemoryReceipt(receipt);
  const source = { epistemicReceipt: receipt, runtimeMemoryReceipt: memoryReceipt };
  const { reveal, telemetry } = revealHarness();

  const latent = reveal.create({ epistemicReceipt: receipt });
  const effectVisible = await reveal.advance(latent, source, "EFFECT_VISIBLE");
  const revealed = await reveal.advance(effectVisible, source, "CAUSE_REVEALED");
  const revisionReceipt = revisedReceipt();
  const revised = await reveal.revise(revealed, source, revisionReceipt);

  assert.equal(revised.state, "REVISED");
  assert.equal(revised.revisions.length, 1);
  assert.deepEqual(revised.revisions[0]?.addedEvidenceRefs, [
    "telemetry:event-reveal-contract:return",
  ]);
  assert.deepEqual(revised.disclosedEvidence.revision, [
    "telemetry:event-reveal-contract:return",
  ]);
  assert.equal(revised.interpretationHistory.length, 2);
  assert.equal(revised.interpretationHistory[0]?.sourceReceiptId, receipt.receiptId);
  assert.equal(revised.interpretationHistory[0]?.belief, "threatening");
  assert.equal(
    revised.interpretationHistory[1]?.sourceReceiptId,
    revisionReceipt.receiptId,
  );
  assert.equal(revised.interpretationHistory[1]?.belief, "supportive");

  assert.equal(revealed.state, "CAUSE_REVEALED");
  assert.equal(revealed.revisions.length, 0);
  assert.equal(revealed.interpretationHistory.length, 1);
  assert.equal(telemetry.query({ kind: "consequence.reveal.revised" }).length, 1);

  await assert.rejects(
    () => reveal.revise(revised, source, sameEvidenceRevision()),
    (error: unknown) =>
      error instanceof ConsequenceRevealError
      && /requires new actor-observed causal evidence/.test(error.message),
  );
});
