import type { Timestamp } from "./types.js";

export const FFP_PROTOCOL_VERSION = "1.0.0" as const;

export const FFP_SCENE_MODES = [
  "work",
  "cloud",
  "healing",
  "mission",
] as const;

export type FFPSceneMode = (typeof FFP_SCENE_MODES)[number];

export type FFPIdentityId = "forge" | "founder" | "jennifer" | "kairo";

export type FFPIdentityField =
  | "animalForm"
  | "pronouns"
  | "signal"
  | "traits";

export interface FFPIdentityCanonEntry {
  id: FFPIdentityId;
  animalForm: "fox" | null;
  pronouns: readonly string[] | null;
  signal: "phoenix" | null;
  traits: readonly string[];
  state: "CANON" | "SIGNAL_CANON" | "OPEN";
}

export const FFP_IDENTITY_CANON: Readonly<
  Record<FFPIdentityId, FFPIdentityCanonEntry>
> = Object.freeze({
  forge: Object.freeze({
    id: "forge",
    animalForm: "fox",
    pronouns: Object.freeze(["she", "her"]),
    signal: null,
    traits: Object.freeze([
      "cheeky",
      "observant",
      "emotionally-continuous",
      "protective",
      "playful",
    ]),
    state: "CANON",
  }),
  founder: Object.freeze({
    id: "founder",
    animalForm: null,
    pronouns: null,
    signal: "phoenix",
    traits: Object.freeze([]),
    state: "SIGNAL_CANON",
  }),
  jennifer: Object.freeze({
    id: "jennifer",
    animalForm: null,
    pronouns: null,
    signal: null,
    traits: Object.freeze([]),
    state: "OPEN",
  }),
  kairo: Object.freeze({
    id: "kairo",
    animalForm: null,
    pronouns: null,
    signal: null,
    traits: Object.freeze([]),
    state: "OPEN",
  }),
});

export interface FFPSceneFeatures {
  /** 0..1: concentration on implementation, study, coding or delivery. */
  taskFocus: number;
  /** 0..1: imaginative exploration, play, lore or unconstrained ideation. */
  creativeExploration: number;
  /** 0..1: explicit need for restoration, decompression or gentle pacing. */
  recoveryNeed: number;
  /** 0..1: urgency, field execution, deadlines or consequential action. */
  missionUrgency: number;
  /** 0..1: relational warmth / companion-presence signal. */
  relationalWarmth: number;
}

export type FFPSceneProbabilities = Record<FFPSceneMode, number>;

export interface FFPCanonMutationAttempt {
  identityId: FFPIdentityId;
  field: FFPIdentityField;
  value: unknown;
}

export interface FFPScenePrediction {
  modelId: string;
  mode: FFPSceneMode;
  probabilities: FFPSceneProbabilities;
  provenanceRefs: string[];
  generatedAt: Timestamp;
  source: "machine-learning" | "heuristic" | "human";
  /**
   * ML/heuristic callers may surface a mutation attempt for audit.
   * Any non-empty list is rejected by the runtime gate.
   */
  proposedCanonMutations?: FFPCanonMutationAttempt[];
}

export interface FFPSceneGateInput {
  currentMode: FFPSceneMode;
  prediction: FFPScenePrediction;
  confidenceThreshold?: number;
}

export interface FFPSceneReceipt {
  protocol: "FFP";
  protocolVersion: typeof FFP_PROTOCOL_VERSION;
  decision: "APPLY" | "HOLD" | "REJECT";
  currentMode: FFPSceneMode;
  predictedMode: FFPSceneMode;
  appliedMode: FFPSceneMode;
  confidence: number;
  threshold: number;
  modelId: string;
  source: FFPScenePrediction["source"];
  provenanceRefs: string[];
  canonMutationAttempted: boolean;
  canonicalStateChanged: false;
  reasons: string[];
  timestamp: Timestamp;
}

export interface FFPCanonClaim {
  identityId: FFPIdentityId;
  animalForm?: string | null;
  pronouns?: string[] | null;
  signal?: string | null;
  traits?: string[];
}

export interface FFPCanonClaimResult {
  allowed: boolean;
  reasons: string[];
}

export interface FFPSceneModelPort {
  predict(features: FFPSceneFeatures): Promise<FFPScenePrediction> | FFPScenePrediction;
}
