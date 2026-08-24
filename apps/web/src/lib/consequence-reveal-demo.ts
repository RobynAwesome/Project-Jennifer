import type { ConsequenceRevealReceipt } from "@jennifer/shared";

/**
 * Explicitly non-authoritative fixture for the player-facing consequence journal.
 *
 * This fixture exists only to validate the UI contract while the authoritative
 * persisted reveal read-path is still a separate evidence gate. It must never
 * be presented as live Jennifer state.
 */
export const CONSEQUENCE_REVEAL_DEMO: ConsequenceRevealReceipt = {
  revealId: "demo-reveal-market-sponsorship",
  schemaVersion: 1,
  state: "REVISED",
  origin: {
    epistemicReceiptId: "demo-epistemic-origin",
    eventId: "demo-event-market-interruption",
    actorId: "demo-npc-market-witness",
    consequenceRuleId: "demo-rule-withhold-sponsorship",
  },
  runtimeAdmission: {
    memoryReceiptId: "demo-memory-receipt",
    admission: "admitted",
  },
  effect: "withhold-sponsorship",
  disclosedEvidence: {
    event: ["telemetry:event-market-interruption:interrupt"],
    policy: ["policy:npc-social:withhold-sponsorship"],
    maturity: ["telemetry:player-requested-sponsorship:later"],
    revision: ["telemetry:event-market-interruption:return-item"],
  },
  interpretationHistory: [
    {
      sourceReceiptId: "demo-epistemic-origin",
      disposition: "CONVERGE",
      belief: "threatening",
      confidence: 0.82,
      observedFactIds: ["interrupt"],
      unknownFactIds: ["return-item"],
      recordedAt: 1_777_000_000_000,
    },
    {
      sourceReceiptId: "demo-epistemic-revision",
      disposition: "CONVERGE",
      belief: "supportive",
      confidence: 0.76,
      observedFactIds: ["interrupt", "return-item"],
      unknownFactIds: [],
      recordedAt: 1_777_000_030_000,
    },
  ],
  revisions: [
    {
      revisionId: "demo-revision-return-item",
      sourceReceiptId: "demo-epistemic-revision",
      addedEvidenceRefs: ["telemetry:event-market-interruption:return-item"],
      interpretation: {
        sourceReceiptId: "demo-epistemic-revision",
        disposition: "CONVERGE",
        belief: "supportive",
        confidence: 0.76,
        observedFactIds: ["interrupt", "return-item"],
        unknownFactIds: [],
        recordedAt: 1_777_000_030_000,
      },
      appendedAt: 1_777_000_031_000,
    },
  ],
  proofState: "player-safe-causal-reveal",
  canonical: false,
  createdAt: 1_777_000_000_000,
  updatedAt: 1_777_000_031_000,
};
