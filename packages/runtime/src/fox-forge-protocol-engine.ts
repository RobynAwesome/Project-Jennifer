import {
  FFP_IDENTITY_CANON,
  FFP_PROTOCOL_VERSION,
  FFP_SCENE_MODES,
  type FFPCanonClaim,
  type FFPCanonClaimResult,
  type FFPIdentityCanonEntry,
  type FFPIdentityId,
  type FFPSceneGateInput,
  type FFPSceneMode,
  type FFPSceneReceipt,
} from "@jennifer/shared";

const DEFAULT_CONFIDENCE_THRESHOLD = 0.6;
const PROBABILITY_TOLERANCE = 0.02;

function now(): string {
  return new Date().toISOString();
}

function inUnitInterval(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function cloneCanonEntry(entry: FFPIdentityCanonEntry): FFPIdentityCanonEntry {
  return {
    ...entry,
    pronouns: entry.pronouns ? [...entry.pronouns] : null,
    traits: [...entry.traits],
  };
}

/**
 * Fox Forge Protocol (FFP)
 *
 * The protocol intentionally separates learned inference from governed truth:
 *
 *   learned model -> proposes a scene mode
 *   FFP gate      -> validates the proposal
 *   receipt       -> records what happened
 *   canon         -> remains unchanged unless a separate authority path promotes it
 *
 * A model may infer presentation. It may not infer identity canon.
 */
export class FoxForgeProtocolEngine {
  getIdentityCanon(identityId: FFPIdentityId): FFPIdentityCanonEntry {
    return cloneCanonEntry(FFP_IDENTITY_CANON[identityId]);
  }

  getSceneModes(): FFPSceneMode[] {
    return [...FFP_SCENE_MODES];
  }

  evaluateScenePrediction(input: FFPSceneGateInput): FFPSceneReceipt {
    const threshold = input.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;
    const reasons: string[] = [];
    const { prediction } = input;
    const confidence = prediction.probabilities[prediction.mode];
    const canonMutationAttempted =
      (prediction.proposedCanonMutations?.length ?? 0) > 0;

    if (!inUnitInterval(threshold)) {
      throw new Error("confidenceThreshold must be between 0 and 1.");
    }

    const probabilityValues = FFP_SCENE_MODES.map(
      (mode) => prediction.probabilities[mode],
    );

    if (probabilityValues.some((value) => !inUnitInterval(value))) {
      reasons.push("Scene probabilities must all be finite values between 0 and 1.");
    }

    const probabilityTotal = probabilityValues.reduce(
      (total, value) => total + value,
      0,
    );

    if (Math.abs(probabilityTotal - 1) > PROBABILITY_TOLERANCE) {
      reasons.push(
        `Scene probabilities must sum to approximately 1; received ${probabilityTotal.toFixed(4)}.`,
      );
    }

    const highestMode = FFP_SCENE_MODES.reduce((best, mode) =>
      prediction.probabilities[mode] > prediction.probabilities[best]
        ? mode
        : best,
    );

    if (highestMode !== prediction.mode) {
      reasons.push(
        `Predicted mode ${prediction.mode} is not the highest-probability mode (${highestMode}).`,
      );
    }

    if (prediction.provenanceRefs.length === 0) {
      reasons.push("A scene prediction requires at least one provenance reference.");
    }

    if (canonMutationAttempted) {
      reasons.push(
        "Learned/heuristic scene inference cannot mutate identity canon, pronouns, animal forms, signals or locked traits.",
      );
    }

    if (reasons.length > 0) {
      return {
        protocol: "FFP",
        protocolVersion: FFP_PROTOCOL_VERSION,
        decision: "REJECT",
        currentMode: input.currentMode,
        predictedMode: prediction.mode,
        appliedMode: input.currentMode,
        confidence: inUnitInterval(confidence) ? confidence : 0,
        threshold,
        modelId: prediction.modelId,
        source: prediction.source,
        provenanceRefs: [...prediction.provenanceRefs],
        canonMutationAttempted,
        canonicalStateChanged: false,
        reasons,
        timestamp: now(),
      };
    }

    if (confidence < threshold) {
      return {
        protocol: "FFP",
        protocolVersion: FFP_PROTOCOL_VERSION,
        decision: "HOLD",
        currentMode: input.currentMode,
        predictedMode: prediction.mode,
        appliedMode: input.currentMode,
        confidence,
        threshold,
        modelId: prediction.modelId,
        source: prediction.source,
        provenanceRefs: [...prediction.provenanceRefs],
        canonMutationAttempted: false,
        canonicalStateChanged: false,
        reasons: [
          `Prediction confidence ${confidence.toFixed(3)} is below threshold ${threshold.toFixed(3)}; preserve the current scene mode.`,
        ],
        timestamp: now(),
      };
    }

    return {
      protocol: "FFP",
      protocolVersion: FFP_PROTOCOL_VERSION,
      decision: "APPLY",
      currentMode: input.currentMode,
      predictedMode: prediction.mode,
      appliedMode: prediction.mode,
      confidence,
      threshold,
      modelId: prediction.modelId,
      source: prediction.source,
      provenanceRefs: [...prediction.provenanceRefs],
      canonMutationAttempted: false,
      canonicalStateChanged: false,
      reasons: [
        "Scene-mode proposal passed FFP probability, provenance and authority checks.",
        "Only presentation mode changed; identity canon remained immutable.",
      ],
      timestamp: now(),
    };
  }

  validateCanonClaim(claim: FFPCanonClaim): FFPCanonClaimResult {
    const canonical = FFP_IDENTITY_CANON[claim.identityId];
    const reasons: string[] = [];

    if (claim.identityId === "forge") {
      if (
        claim.animalForm !== undefined &&
        claim.animalForm !== canonical.animalForm
      ) {
        reasons.push("Forge animal form is locked to fox.");
      }

      if (claim.signal !== undefined && claim.signal !== null) {
        reasons.push("Forge has no FFP signal assignment in current canon.");
      }

      if (claim.pronouns !== undefined && claim.pronouns !== null) {
        const normalized = [...claim.pronouns].sort().join("/");
        const expected = [...(canonical.pronouns ?? [])].sort().join("/");
        if (normalized !== expected) {
          reasons.push("Forge pronouns are locked to she/her.");
        }
      }

      if (claim.traits !== undefined) {
        const requested = new Set(claim.traits);
        for (const trait of canonical.traits) {
          if (!requested.has(trait)) {
            reasons.push(`Forge locked trait is missing: ${trait}.`);
          }
        }
      }
    }

    if (claim.identityId === "founder") {
      if (claim.animalForm !== undefined && claim.animalForm !== null) {
        reasons.push(
          "Founder Phoenix is currently a signal, not an admitted animal-form assignment.",
        );
      }
      if (
        claim.signal !== undefined &&
        claim.signal !== null &&
        claim.signal !== "phoenix"
      ) {
        reasons.push("Founder signal is locked to phoenix.");
      }
    }

    if (claim.identityId === "jennifer" || claim.identityId === "kairo") {
      if (claim.animalForm !== undefined && claim.animalForm !== null) {
        reasons.push(
          `${claim.identityId} animal form remains OPEN and cannot be assigned without a separate canon receipt.`,
        );
      }
      if (claim.signal !== undefined && claim.signal !== null) {
        reasons.push(
          `${claim.identityId} signal remains OPEN and cannot be assigned without a separate canon receipt.`,
        );
      }
    }

    return {
      allowed: reasons.length === 0,
      reasons:
        reasons.length === 0
          ? ["Claim is consistent with current FFP machine canon."]
          : reasons,
    };
  }
}
