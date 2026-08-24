export type ConsequenceRevealState =
  | "LATENT"
  | "EFFECT_VISIBLE"
  | "CAUSE_PARTIAL"
  | "CAUSE_REVEALED"
  | "REVISED";

export type ConsequenceRevealDisposition = "CONVERGE" | "DIVERGE" | "HOLD";
export type ConsequenceRevealBelief =
  | "supportive"
  | "threatening"
  | "ambiguous"
  | "unknown";

/**
 * Stable causal identity for a player-safe reveal. This linkage never changes
 * when visibility advances or a later interpretation is appended.
 */
export interface ConsequenceRevealOrigin {
  epistemicReceiptId: string;
  eventId: string;
  actorId: string;
  consequenceRuleId: string;
}

export interface ConsequenceRevealRuntimeAdmission {
  memoryReceiptId: string;
  admission: "admitted";
}

/**
 * Player-safe evidence references only. Raw fact statements, runtime
 * provenance objects and internal policy text are deliberately excluded.
 */
export interface ConsequenceRevealEvidenceGroups {
  event: readonly string[];
  policy: readonly string[];
  maturity: readonly string[];
  revision: readonly string[];
}

export interface ConsequenceRevealInterpretationSnapshot {
  sourceReceiptId: string;
  disposition: ConsequenceRevealDisposition;
  belief?: ConsequenceRevealBelief;
  confidence: number;
  observedFactIds: readonly string[];
  unknownFactIds: readonly string[];
  recordedAt: number;
}

export interface ConsequenceRevealRevision {
  revisionId: string;
  sourceReceiptId: string;
  addedEvidenceRefs: readonly string[];
  interpretation: ConsequenceRevealInterpretationSnapshot;
  appendedAt: number;
}

/**
 * Player-safe projection of governed NPC consequence receipts.
 *
 * It is not the authority record and never replaces the originating actor or
 * runtime receipts. State controls what evidence is disclosed while origin
 * linkage remains stable and revisions append rather than rewrite history.
 */
export interface ConsequenceRevealReceipt {
  revealId: string;
  schemaVersion: 1;
  state: ConsequenceRevealState;
  origin: Readonly<ConsequenceRevealOrigin>;
  runtimeAdmission?: Readonly<ConsequenceRevealRuntimeAdmission>;
  effect?: string;
  disclosedEvidence: Readonly<ConsequenceRevealEvidenceGroups>;
  interpretationHistory: readonly Readonly<ConsequenceRevealInterpretationSnapshot>[];
  revisions: readonly Readonly<ConsequenceRevealRevision>[];
  proofState: "player-safe-causal-reveal";
  canonical: false;
  createdAt: number;
  updatedAt: number;
}
