export const PROJECT_JENNIFER_CONVERGENCE_BALANCE_POINT = 0.5 as const;

export type ConvergenceDirection = "toward-zero" | "balanced" | "toward-one";
export type ConvergenceQuestDisposition = "inactive" | "required" | "resolution-candidate";

export interface CharacterTestimonyRef {
  /** Stable reference to the testimony captured during character creation or later governed revision. */
  testimonyId: string;
  /** Exact evidence/ledger references; this contract does not embed private testimony text by default. */
  evidenceRefs: readonly string[];
  /** Source class should remain explicit rather than being inferred from content. */
  sourceClass: "current-human" | "player-declared" | "governed-revision";
}

/**
 * Projection produced by the PKA runtime authority.
 *
 * Project Jennifer consumes this state; it does not recompute or silently fork PKA mathematics.
 */
export interface PKAConvergenceProjection {
  ratio: number;
  balancePoint: typeof PROJECT_JENNIFER_CONVERGENCE_BALANCE_POINT;
  direction: ConvergenceDirection;
  questTriggered: boolean;
  pkaReceiptRef: string;
  evidenceRefs: readonly string[];
  evaluatedAt: string;
}

export interface ConvergenceQuestState {
  questId: string;
  testimony: CharacterTestimonyRef;
  disposition: ConvergenceQuestDisposition;
  /** The first receipted PKA projection that activated the quest. */
  activatedBy?: PKAConvergenceProjection;
  /** Latest receipted PKA projection observed by the game runtime. */
  latestProjection?: PKAConvergenceProjection;
  /** Explicit receipt proving resolution/admission. The shared contract never fabricates it. */
  resolutionReceiptRef?: string;
}

export class ConvergenceContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConvergenceContractError";
  }
}

function requireText(value: string, field: string): void {
  if (!value.trim()) {
    throw new ConvergenceContractError(`${field} is required.`);
  }
}

export function classifyConvergenceDirection(ratio: number): ConvergenceDirection {
  if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) {
    throw new ConvergenceContractError("Convergence ratio must be finite and within [0, 1].");
  }

  if (ratio < PROJECT_JENNIFER_CONVERGENCE_BALANCE_POINT) return "toward-zero";
  if (ratio > PROJECT_JENNIFER_CONVERGENCE_BALANCE_POINT) return "toward-one";
  return "balanced";
}

export function validatePKAConvergenceProjection(projection: PKAConvergenceProjection): void {
  const expectedDirection = classifyConvergenceDirection(projection.ratio);

  if (projection.balancePoint !== PROJECT_JENNIFER_CONVERGENCE_BALANCE_POINT) {
    throw new ConvergenceContractError("Current founder doctrine requires an exact 0.5 balancing point.");
  }
  if (projection.direction !== expectedDirection) {
    throw new ConvergenceContractError(
      `Projection direction '${projection.direction}' does not match ratio ${projection.ratio}.`,
    );
  }
  if (projection.questTriggered && projection.ratio >= PROJECT_JENNIFER_CONVERGENCE_BALANCE_POINT) {
    throw new ConvergenceContractError(
      "A Convergence Quest cannot be triggered at/above the 0.5 balancing point under current doctrine.",
    );
  }
  requireText(projection.pkaReceiptRef, "PKA receipt reference");
  requireText(projection.evaluatedAt, "Evaluation timestamp");
  if (projection.evidenceRefs.length === 0) {
    throw new ConvergenceContractError("Convergence projection requires evidence references.");
  }
}

/**
 * Apply a receipted PKA projection without pretending Project Jennifer owns PKA threshold policy.
 *
 * Once required, the quest remains required while PKA continues to report the trigger condition.
 * When PKA no longer reports the trigger, the state becomes `resolution-candidate`; an explicit
 * governed resolution receipt is still required before the runtime may mark the quest inactive.
 */
export function applyConvergenceProjection(
  current: ConvergenceQuestState,
  projection: PKAConvergenceProjection,
): ConvergenceQuestState {
  validatePKAConvergenceProjection(projection);

  requireText(current.questId, "Quest ID");
  requireText(current.testimony.testimonyId, "Testimony ID");
  if (current.testimony.evidenceRefs.length === 0) {
    throw new ConvergenceContractError("Character testimony requires evidence references.");
  }

  if (projection.questTriggered) {
    return {
      ...current,
      disposition: "required",
      activatedBy: current.activatedBy ?? projection,
      latestProjection: projection,
      resolutionReceiptRef: undefined,
    };
  }

  if (current.disposition === "required" || current.disposition === "resolution-candidate") {
    return {
      ...current,
      disposition: "resolution-candidate",
      latestProjection: projection,
    };
  }

  return {
    ...current,
    disposition: "inactive",
    latestProjection: projection,
  };
}

/**
 * Resolution is a separate governed act. A lower-risk projection alone does not erase quest history.
 */
export function admitConvergenceQuestResolution(
  current: ConvergenceQuestState,
  resolutionReceiptRef: string,
): ConvergenceQuestState {
  requireText(resolutionReceiptRef, "Resolution receipt reference");

  if (current.disposition !== "resolution-candidate") {
    throw new ConvergenceContractError("Quest resolution requires a resolution-candidate state first.");
  }

  return {
    ...current,
    disposition: "inactive",
    resolutionReceiptRef,
  };
}
