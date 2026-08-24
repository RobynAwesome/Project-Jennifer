import assert from "node:assert/strict";
import test from "node:test";

import { InMemoryGSMB } from "@jennifer/memory";
import { InProcessEventBus } from "@jennifer/shared";
import { TelemetryCollector } from "@jennifer/telemetry";

import {
  AwarenessEngine,
  NPCAgent,
  NPCRegistry,
  RelationshipGraph,
} from "./npc-runtime.js";

const sharedEvent = {
  eventId: "event-market-interruption-runtime",
  facts: [
    {
      factId: "fact-interruption",
      statement: "The player interrupted an exchange before completion.",
      evidenceRefs: ["telemetry:event-market-interruption-runtime:1"],
    },
    {
      factId: "fact-return",
      statement: "The player returned the item involved in the exchange.",
      evidenceRefs: ["telemetry:event-market-interruption-runtime:2"],
    },
  ],
} as const;

const rules = [
  {
    ruleId: "rule-latent-withhold",
    priority: 20,
    when: {
      disposition: "CONVERGE" as const,
      interpretation: "threatening" as const,
      minConfidence: 0.5,
    },
    effect: "withhold-future-support",
    visibility: "latent" as const,
    maturesWhen: "next sponsorship request",
    evidenceRefs: ["policy:npc-social:withhold-support"],
  },
  {
    ruleId: "rule-immediate-support",
    priority: 10,
    when: {
      disposition: "CONVERGE" as const,
      interpretation: "supportive" as const,
      minConfidence: 0.5,
    },
    effect: "offer-support",
    visibility: "immediate" as const,
    maturesWhen: "next eligible interaction",
    evidenceRefs: ["policy:npc-social:offer-support"],
  },
] as const;

function makeAgent(name: string) {
  const memory = new InMemoryGSMB();
  const bus = new InProcessEventBus();
  const telemetry = new TelemetryCollector(bus);
  const awareness = new AwarenessEngine();
  const relationships = new RelationshipGraph();
  const agent = new NPCAgent(
    {
      name,
      role: "market-witness",
      district: "financial-exchange",
      personality: ["analytical"],
      goals: [],
      relationships: [],
    },
    memory,
    telemetry,
    awareness,
    relationships,
  );
  return { agent, memory, telemetry, awareness, relationships };
}

test("registry broadcasts one world event into actor-relative tick decisions without applying consequence mutation", async () => {
  const guarded = makeAgent("Guarded");
  const trusting = makeAgent("Trusting");
  const registry = new NPCRegistry();
  registry.register(guarded.agent);
  registry.register(trusting.agent);

  guarded.agent.addGoal("Protect the exchange", 1);
  trusting.agent.addGoal("Recover the item", 0.9);

  guarded.awareness.updateAwareness(
    guarded.agent.profile.id,
    "financial-exchange",
    [trusting.agent.profile.id],
    ["argument"],
    -0.2,
  );
  trusting.awareness.updateAwareness(
    trusting.agent.profile.id,
    "financial-exchange",
    [guarded.agent.profile.id],
    ["return"],
    0.1,
  );

  guarded.relationships.setRelationship(guarded.agent.profile.id, {
    targetId: "player",
    type: "neutral",
    trust: 0.2,
    history: [],
  });
  trusting.relationships.setRelationship(trusting.agent.profile.id, {
    targetId: "player",
    type: "ally",
    trust: 0.8,
    history: [],
  });

  const queued = registry.broadcastEpistemicEvent({
    event: sharedEvent,
    actorInputs: {
      [guarded.agent.profile.id]: {
        observations: [
          { factId: "fact-interruption", meaning: "threat-signal", confidence: 0.9 },
          { factId: "fact-return", meaning: "obstructs-goal", confidence: 0.8 },
        ],
        relationshipTargetId: "player",
        consequenceRules: rules,
      },
      [trusting.agent.profile.id]: {
        observations: [
          { factId: "fact-interruption", meaning: "trust-signal", confidence: 0.9 },
          { factId: "fact-return", meaning: "supports-goal", confidence: 0.8 },
        ],
        relationshipTargetId: "player",
        consequenceRules: rules,
      },
    },
  });

  assert.equal(queued.length, 2);
  assert.equal(guarded.agent.getQueuedEpistemicEventCount(), 1);
  assert.equal(trusting.agent.getQueuedEpistemicEventCount(), 1);

  const actions = await registry.tick();
  assert.equal(actions.length, 2);
  assert.match(actions[0] ?? "", /actor-model converged on threatening/);
  assert.match(actions[1] ?? "", /actor-model converged on supportive/);

  const guardedReceipt = guarded.agent.getLastEpistemicReceipts()[0];
  const trustingReceipt = trusting.agent.getLastEpistemicReceipts()[0];
  assert.equal(guardedReceipt?.consequence?.effect, "withhold-future-support");
  assert.equal(guardedReceipt?.consequence?.visibility, "latent");
  assert.equal(trustingReceipt?.consequence?.effect, "offer-support");
  assert.equal(guardedReceipt?.validationState, "UNVALIDATED");
  assert.equal(guardedReceipt?.canonical, false);

  const guardedMemories = await guarded.agent.recall(["epistemic", "consequence-intent"]);
  const trustingMemories = await trusting.agent.recall(["epistemic", "consequence-intent"]);
  assert.equal(guardedMemories.length, 1);
  assert.equal(trustingMemories.length, 1);

  const guardedWorldEvents = guarded.telemetry.query({ kind: "world.event" });
  const trustingWorldEvents = trusting.telemetry.query({ kind: "world.event" });
  assert.equal(guardedWorldEvents.length, 1);
  assert.equal(trustingWorldEvents.length, 1);
  assert.equal(guardedWorldEvents[0]?.payload.mutationApplied, false);
  assert.equal(trustingWorldEvents[0]?.payload.mutationApplied, false);

  assert.equal(guarded.agent.getQueuedEpistemicEventCount(), 0);
  assert.equal(trusting.agent.getQueuedEpistemicEventCount(), 0);
});

test("Power divergence remains an actor-model branch inside tick and does not self-promote to consequence", async () => {
  const runtime = makeAgent("Power Divergent");
  runtime.agent.addGoal("Understand the incomplete event", 1);

  runtime.agent.queueEpistemicEvent({
    event: {
      eventId: "event-partial-runtime",
      facts: [
        { factId: "known", statement: "Known evidence", evidenceRefs: ["event:known"] },
        { factId: "hidden", statement: "Unobserved evidence", evidenceRefs: ["event:hidden"] },
      ],
    },
    capability: "POWER",
    observations: [{ factId: "known", meaning: "threat-signal", confidence: 1 }],
  });

  const decision = await runtime.agent.tickDetailed();
  const receipt = decision.epistemicReceipts[0];

  assert.equal(receipt?.disposition, "DIVERGE");
  assert.deepEqual(receipt?.unknownFactIds, ["hidden"]);
  assert.equal(receipt?.consequence, undefined);
  assert.equal(receipt?.proofState, "actor-model");
  assert.equal(receipt?.validationState, "UNVALIDATED");
  assert.equal(receipt?.canonical, false);
  assert.match(decision.action, /preserves 3 interpretations/);

  const nextDecision = await runtime.agent.tickDetailed();
  assert.equal(nextDecision.epistemicReceipts.length, 0);
});
