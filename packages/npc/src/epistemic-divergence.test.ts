import assert from "node:assert/strict";
import test from "node:test";

import { EpistemicDivergenceEngine } from "./epistemic-divergence.js";

const event = {
  eventId: "event-market-interruption",
  facts: [
    {
      factId: "fact-player-interrupted",
      statement: "The player interrupted an NPC exchange before it completed.",
      evidenceRefs: ["telemetry:event-market-interruption:1"],
    },
    {
      factId: "fact-player-returned-item",
      statement: "The player returned an item that belonged to the exchange.",
      evidenceRefs: ["telemetry:event-market-interruption:2"],
    },
  ],
} as const;

const consequenceRules = [
  {
    ruleId: "rule-withhold-future-support",
    priority: 20,
    when: {
      disposition: "CONVERGE" as const,
      interpretation: "threatening" as const,
      minConfidence: 0.5,
    },
    effect: "withhold-future-support",
    visibility: "latent" as const,
    maturesWhen: "actor is next asked to sponsor or recommend the player",
    evidenceRefs: ["policy:npc-social-consequence:withhold-support"],
  },
  {
    ruleId: "rule-offer-support",
    priority: 10,
    when: {
      disposition: "CONVERGE" as const,
      interpretation: "supportive" as const,
      minConfidence: 0.5,
    },
    effect: "offer-support",
    visibility: "immediate" as const,
    maturesWhen: "next eligible social interaction",
    evidenceRefs: ["policy:npc-social-consequence:offer-support"],
  },
] as const;

test("same objective event can yield different actor beliefs and consequences", () => {
  const engine = new EpistemicDivergenceEngine();

  const guarded = engine.evaluate({
    event,
    actor: {
      actorId: "npc-guarded",
      capability: "STANDARD",
      observations: [
        { factId: "fact-player-interrupted", meaning: "threat-signal", confidence: 0.9 },
        { factId: "fact-player-returned-item", meaning: "obstructs-goal", confidence: 0.8 },
      ],
      relationship: { targetId: "player", type: "neutral", trust: 0.2 },
      currentGoal: { goalId: "protect-exchange", description: "Protect the exchange", priority: 1 },
      awareness: { nearbyNpcIds: ["npc-witness"], recentEvents: ["argument"], environmentalTone: -0.2 },
    },
    consequenceRules,
  });

  const trusting = engine.evaluate({
    event,
    actor: {
      actorId: "npc-trusting",
      capability: "STANDARD",
      observations: [
        { factId: "fact-player-interrupted", meaning: "trust-signal", confidence: 0.9 },
        { factId: "fact-player-returned-item", meaning: "supports-goal", confidence: 0.8 },
      ],
      relationship: { targetId: "player", type: "ally", trust: 0.8 },
      currentGoal: { goalId: "recover-item", description: "Recover the item", priority: 0.9 },
      awareness: { nearbyNpcIds: ["npc-witness"], recentEvents: ["return"], environmentalTone: 0.1 },
    },
    consequenceRules,
  });

  assert.equal(guarded.disposition, "CONVERGE");
  assert.equal(guarded.actorBelief, "threatening");
  assert.equal(guarded.consequence?.effect, "withhold-future-support");
  assert.equal(guarded.consequence?.visibility, "latent");
  assert.ok(guarded.consequence?.causalEvidenceRefs.includes("telemetry:event-market-interruption:1"));
  assert.ok(guarded.consequence?.causalEvidenceRefs.includes("policy:npc-social-consequence:withhold-support"));

  assert.equal(trusting.disposition, "CONVERGE");
  assert.equal(trusting.actorBelief, "supportive");
  assert.equal(trusting.consequence?.effect, "offer-support");
  assert.notEqual(guarded.interpretationScore, trusting.interpretationScore);

  assert.equal(guarded.validationState, "UNVALIDATED");
  assert.equal(trusting.validationState, "UNVALIDATED");
  assert.equal(guarded.canonical, false);
  assert.equal(trusting.canonical, false);
});

test("Power of Divergence preserves alternatives longer than standard inference", () => {
  const engine = new EpistemicDivergenceEngine();
  const partialEvent = {
    eventId: "event-partial",
    facts: [
      { factId: "known", statement: "Known fact", evidenceRefs: ["event:known"] },
      { factId: "hidden", statement: "Unobserved fact", evidenceRefs: ["event:hidden"] },
    ],
  } as const;

  const standard = engine.evaluate({
    event: partialEvent,
    actor: {
      actorId: "npc-standard",
      capability: "STANDARD",
      observations: [{ factId: "known", meaning: "threat-signal", confidence: 1 }],
      relationship: { targetId: "player", type: "rival", trust: 0 },
    },
  });

  const divergent = engine.evaluate({
    event: partialEvent,
    actor: {
      actorId: "npc-divergent",
      capability: "POWER",
      observations: [{ factId: "known", meaning: "threat-signal", confidence: 1 }],
      relationship: { targetId: "player", type: "rival", trust: 0 },
    },
  });

  assert.equal(standard.coverage, 0.5);
  assert.equal(standard.disposition, "CONVERGE");
  assert.equal(standard.actorBelief, "threatening");

  assert.equal(divergent.coverage, 0.5);
  assert.equal(divergent.disposition, "DIVERGE");
  assert.equal(divergent.actorBelief, undefined);
  assert.deepEqual(divergent.unknownFactIds, ["hidden"]);
  assert.deepEqual(
    divergent.alternatives.map((candidate) => candidate.label),
    ["supportive", "threatening", "unknown"],
  );
});

test("unknown evidence remains unknown and does not manufacture punishment", () => {
  const engine = new EpistemicDivergenceEngine();
  const receipt = engine.evaluate({
    event: {
      eventId: "event-ambiguous",
      facts: [
        { factId: "a", statement: "A happened", evidenceRefs: ["e:a"] },
        { factId: "b", statement: "B happened", evidenceRefs: ["e:b"] },
        { factId: "c", statement: "C happened", evidenceRefs: ["e:c"] },
      ],
    },
    actor: {
      actorId: "npc-observer",
      capability: "POWER",
      observations: [{ factId: "a", meaning: "ambiguous", confidence: 0.7 }],
    },
  });

  assert.equal(receipt.disposition, "DIVERGE");
  assert.deepEqual(receipt.knownFactIds, ["a"]);
  assert.deepEqual(receipt.unknownFactIds, ["b", "c"]);
  assert.deepEqual(receipt.evidenceRefs, ["e:a"]);
  assert.equal(receipt.consequence, undefined);
  assert.equal(receipt.proofState, "actor-model");
});

test("engine rejects unsupported observations and unreceipted consequence policy", () => {
  const engine = new EpistemicDivergenceEngine();

  assert.throws(
    () => engine.evaluate({
      event,
      actor: {
        actorId: "npc-invalid",
        capability: "STANDARD",
        observations: [{ factId: "invented-fact", meaning: "threat-signal", confidence: 1 }],
      },
    }),
    /cannot observe unknown fact/,
  );

  assert.throws(
    () => engine.evaluate({
      event,
      actor: {
        actorId: "npc-invalid-policy",
        capability: "STANDARD",
        observations: [{ factId: "fact-player-interrupted", meaning: "threat-signal", confidence: 1 }],
      },
      consequenceRules: [{
        ruleId: "unreceipted-punishment",
        priority: 99,
        when: { disposition: "CONVERGE" },
        effect: "punish-player",
        visibility: "latent",
        maturesWhen: "later",
        evidenceRefs: [],
      }],
    }),
    /requires policy evidence references/,
  );
});
