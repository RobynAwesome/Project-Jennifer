import assert from "node:assert/strict";
import test from "node:test";

import {
  BehavioralAdapter,
  HumanStateAbstractor,
  SymbolicProfileStore,
} from "@jennifer/hue";
import { CompanionManager } from "./companion-engine.js";
import {
  HUMAN_CONTEXT_PRIORITY,
  HumanContextPacketEngine,
  HumanContextPacketError,
} from "./human-context-packet-engine.js";
import { ZodiacContextEngine } from "./zodiac-context-engine.js";

const USER_ID = "player-zodiac-001";

function buildProfiles() {
  const humanStates = new HumanStateAbstractor();
  const behavior = new BehavioralAdapter();
  const symbolic = new SymbolicProfileStore();

  humanStates.updateState(USER_ID, {
    emotionalState: "engaged",
    engagementScore: 0.84,
    stressLevel: 0.12,
  });
  behavior.setPreference(
    USER_ID,
    "homeMeaning",
    "Home is continuity with people and work I deliberately choose."
  );
  behavior.addAdaptation(USER_ID, {
    trigger: "technical-explanation",
    response: "show receipts and evidence before interpretation",
    weight: 0.95,
  });

  return { humanStates, behavior, symbolic };
}

test("composes HUE, explicit player profile, zodiac symbolism and companion state without promoting zodiac to fact", () => {
  const { humanStates, behavior, symbolic } = buildProfiles();
  const zodiac = new ZodiacContextEngine().build({
    selfDeclaredSign: "cancer",
  });

  assert.equal(zodiac.status, "ACTIVE");
  assert.ok(zodiac.context);

  symbolic.admitZodiacSignal(USER_ID, {
    sign: zodiac.context.sign,
    source: zodiac.context.source,
    authority: zodiac.context.authority,
    epistemicStatus: zodiac.context.archetype.epistemicStatus,
    admittedAt: zodiac.receipt.timestamp,
  });

  const companions = new CompanionManager();
  const selected = companions.select({
    userId: USER_ID,
    companionId: "aura",
    relationshipLane: "romantic",
  });
  assert.equal(selected.receipt.result, "PASSED");

  const packet = new HumanContextPacketEngine().build({
    userId: USER_ID,
    humanState: humanStates.getState(USER_ID),
    behavioralProfile: behavior.getProfile(USER_ID),
    symbolicProfile: symbolic.getProfile(USER_ID),
    companionSelection: selected.selection,
    companion: selected.companion,
  });

  assert.equal(packet.hue.emotionalState, "engaged");
  assert.equal(
    packet.playerProfile.preferences.homeMeaning,
    "Home is continuity with people and work I deliberately choose."
  );
  assert.equal(packet.playerProfile.zodiac?.sign, "cancer");
  assert.equal(packet.playerProfile.zodiac?.authority, "LOW_SYMBOLIC_CONTEXT");
  assert.equal(packet.companion?.id, "aura");
  assert.equal(packet.companion?.relationshipLane, "romantic");
  assert.deepEqual(packet.governance.priorityOrder, HUMAN_CONTEXT_PRIORITY);
  assert.equal(
    packet.governance.priorityOrder[0],
    "explicit-player-preference"
  );
  assert.equal(packet.governance.zodiac.mayOverrideExplicitPreference, false);
  assert.equal(packet.governance.zodiac.mayOverrideObservedBehavior, false);
  assert.equal(packet.governance.zodiac.mayBecomePersonalityFact, false);
  assert.equal(packet.governance.zodiac.mayPredictRelationshipOutcome, false);
  assert.equal(packet.governance.zodiac.mayColourCompanionFlavour, true);
  assert.equal(packet.receipt.zodiacAuthorityPreserved, true);
  assert.equal(packet.receipt.rivmBoundaryEnforced, true);
});

test("withheld zodiac input never enters the player symbolic profile or context packet", () => {
  const { humanStates, behavior, symbolic } = buildProfiles();
  const zodiac = new ZodiacContextEngine().build({
    birthDate: { month: 6, day: 30 },
  });

  assert.equal(zodiac.status, "WITHHELD");

  const packet = new HumanContextPacketEngine().build({
    userId: USER_ID,
    humanState: humanStates.getState(USER_ID),
    behavioralProfile: behavior.getProfile(USER_ID),
    symbolicProfile: symbolic.getProfile(USER_ID),
  });

  assert.equal(packet.playerProfile.zodiac, undefined);
  assert.equal(packet.governance.zodiac.mayColourCompanionFlavour, false);
  assert.equal(packet.receipt.zodiacAdmitted, false);
  assert.equal(packet.receipt.companionBound, false);
});

test("rejects cross-user context binding before a packet can be composed", () => {
  const { humanStates, behavior, symbolic } = buildProfiles();

  assert.throws(
    () =>
      new HumanContextPacketEngine().build({
        userId: USER_ID,
        humanState: humanStates.getState(USER_ID),
        behavioralProfile: behavior.getProfile(USER_ID),
        symbolicProfile: symbolic.getProfile("different-player"),
      }),
    (error: unknown) =>
      error instanceof HumanContextPacketError &&
      error.code === "HCP-USER-BINDING"
  );
});
