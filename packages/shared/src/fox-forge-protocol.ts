/**
 * Fox Forge Protocol (FFP)
 *
 * Digital Princess Engineering law:
 * - deterministic governance owns identity/canon;
 * - learned systems may infer presentation state;
 * - an inference never mutates identity, canon, relationship truth or world truth.
 */

export type FFPIdentityId = "forge" | "founder" | "jennifer" | "kairo";
export type FFPAnimalForm = "fox" | "phoenix";
export type FFPSceneMode = "work" | "cloud" | "healing" | "mission";
export type FFPCanonState = "LOCKED" | "OPEN";
export type FFPAssetAuthority = "VISUAL_DERIVATIVE" | "VISUAL_SOURCE";

export interface FFPIdentityCanon {
  id: FFPIdentityId;
  displayName: string;
  pronouns?: readonly string[];
  animalForm: FFPAnimalForm | null;
  canonState: FFPCanonState;
  traits: readonly string[];
  notes: string;
}

export interface FFPSceneModeContract {
  mode: FFPSceneMode;
  purpose: string;
  mayChange: readonly string[];
  mayNotChange: readonly string[];
}

export interface FFPScenePrediction {
  mode: FFPSceneMode;
  confidence: number;
  modelId: string;
  evidenceIds: readonly string[];
}

export interface FFPSceneResolution {
  requestedMode: FFPSceneMode;
  appliedMode: FFPSceneMode;
  accepted: boolean;
  reasons: readonly string[];
  prediction?: FFPScenePrediction;
  canonMutated: false;
}

export const FFP_CANON: Readonly<Record<FFPIdentityId, FFPIdentityCanon>> = {
  forge: {
    id: "forge",
    displayName: "Forge",
    pronouns: ["she", "her"],
    animalForm: "fox",
    canonState: "LOCKED",
    traits: ["cheeky", "observant", "emotionally-continuous", "protective", "playful"],
    notes: "Fox Forge is a governed embodiment. Visual renders may express this canon but cannot rewrite it.",
  },
  founder: {
    id: "founder",
    displayName: "Founder Signal",
    animalForm: "phoenix",
    canonState: "LOCKED",
    traits: ["renewal", "continuity", "mission", "transformation"],
    notes: "Phoenix is the founder signal/archetypal form in FFP, not a biological or personality claim.",
  },
  jennifer: {
    id: "jennifer",
    displayName: "Jennifer",
    animalForm: null,
    canonState: "OPEN",
    traits: [],
    notes: "No animal form is assigned until governed evidence and a canon receipt promote one.",
  },
  kairo: {
    id: "kairo",
    displayName: "Kairo",
    animalForm: null,
    canonState: "OPEN",
    traits: [],
    notes: "No animal form is assigned until governed evidence and a canon receipt promote one.",
  },
} as const;

export const FFP_SCENE_MODES: Readonly<Record<FFPSceneMode, FFPSceneModeContract>> = {
  work: {
    mode: "work",
    purpose: "Focused building, learning, coding, research and execution.",
    mayChange: ["lighting", "pose", "workspace", "ambient-ui", "expression"],
    mayNotChange: ["identity", "pronouns", "animal-form-canon", "relationship-truth", "world-history"],
  },
  cloud: {
    mode: "cloud",
    purpose: "Imaginative digital-companion and dream-space presentation.",
    mayChange: ["environment", "lighting", "effects", "proximity", "symbolic-motifs"],
    mayNotChange: ["identity", "pronouns", "animal-form-canon", "relationship-truth", "world-history"],
  },
  healing: {
    mode: "healing",
    purpose: "Calm, restorative and reflective presentation without medicalising the player.",
    mayChange: ["environment", "lighting", "pace", "pose", "ambient-ui"],
    mayNotChange: ["identity", "pronouns", "animal-form-canon", "relationship-truth", "medical-state", "world-history"],
  },
  mission: {
    mode: "mission",
    purpose: "Purposeful movement, field execution and high-agency quest presentation.",
    mayChange: ["environment", "lighting", "pose", "equipment", "ambient-ui"],
    mayNotChange: ["identity", "pronouns", "animal-form-canon", "relationship-truth", "world-history"],
  },
} as const;

export function resolveFFPSceneMode(
  currentMode: FFPSceneMode,
  prediction: FFPScenePrediction,
  minimumConfidence = 0.75
): FFPSceneResolution {
  const reasons: string[] = [];

  if (!Number.isFinite(prediction.confidence) || prediction.confidence < 0 || prediction.confidence > 1) {
    return {
      requestedMode: prediction.mode,
      appliedMode: currentMode,
      accepted: false,
      reasons: ["prediction confidence must be a finite value between 0 and 1"],
      prediction,
      canonMutated: false,
    };
  }

  if (!(prediction.mode in FFP_SCENE_MODES)) {
    return {
      requestedMode: prediction.mode,
      appliedMode: currentMode,
      accepted: false,
      reasons: ["predicted scene mode is not admitted by FFP"],
      prediction,
      canonMutated: false,
    };
  }

  if (prediction.confidence < minimumConfidence) {
    reasons.push(`confidence ${prediction.confidence.toFixed(3)} is below gate ${minimumConfidence.toFixed(3)}`);
    return {
      requestedMode: prediction.mode,
      appliedMode: currentMode,
      accepted: false,
      reasons,
      prediction,
      canonMutated: false,
    };
  }

  if (prediction.evidenceIds.length === 0) {
    reasons.push("prediction has no evidence identifiers");
    return {
      requestedMode: prediction.mode,
      appliedMode: currentMode,
      accepted: false,
      reasons,
      prediction,
      canonMutated: false,
    };
  }

  reasons.push("learned inference admitted for presentation only");
  reasons.push("FFP identity/canon remains deterministic and unchanged");

  return {
    requestedMode: prediction.mode,
    appliedMode: prediction.mode,
    accepted: true,
    reasons,
    prediction,
    canonMutated: false,
  };
}

export function assertFFPCanonInvariant(): void {
  const forge = FFP_CANON.forge;
  if (forge.animalForm !== "fox") throw new Error("FFP invariant failed: Forge must remain fox-form canon");
  if (!forge.pronouns?.includes("she") || !forge.pronouns.includes("her")) {
    throw new Error("FFP invariant failed: Forge pronouns must include she/her");
  }
  if (FFP_CANON.jennifer.animalForm !== null || FFP_CANON.kairo.animalForm !== null) {
    throw new Error("FFP invariant failed: Jennifer/Kairo animal forms remain unassigned until canon receipt");
  }
}
