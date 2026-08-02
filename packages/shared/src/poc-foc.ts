import type { Timestamp } from "./types.js";

/**
 * Canonical Project Jennifer Proof-of-Concept and FOC terminology.
 *
 * FOC categories are conceptual conditions, not automatic moral alignments.
 * A category may become destructive, developmental, protective, institutional,
 * or a feedback route back toward Proof of Concept.
 */
export const FOC_CATEGORIES = [
  "fake-of-concept",
  "freedom-of-concept",
  "fabrication-of-concept",
  "failure-of-concept",
  "framework-of-concept",
  "fraction-of-concept",
  "fallacy-of-concept",
  "fallity-of-concept",
  "fringement-of-concept",
  "friction-of-concept",
  "fragmentation-of-concept",
  "financial-of-concept",
  "fragility-of-concept",
  "fandom-of-concept",
] as const;

export type FOCGroup = (typeof FOC_CATEGORIES)[number];
export type ConceptAlignment = "proof-of-concept" | FOCGroup;

export type FailureFeedbackOutcome =
  | "learning"
  | "systemic-delusion"
  | "unresolved-failure";

/**
 * Failure + Recognition = Learning
 * Failure + Fabrication = Systemic Delusion
 */
export function resolveFailureFeedback(input: {
  failureOccurred: boolean;
  recognitionOccurred: boolean;
  fabricationOccurred: boolean;
}): FailureFeedbackOutcome | null {
  if (!input.failureOccurred) return null;
  if (input.fabricationOccurred) return "systemic-delusion";
  if (input.recognitionOccurred) return "learning";
  return "unresolved-failure";
}

export type FreedomFeedbackOutcome = "governed-agency" | "recklessness";

/**
 * Freedom − Consequence = Recklessness
 * Freedom + Consequence = Governed Agency
 */
export function resolveFreedomFeedback(input: {
  freedomExercised: boolean;
  consequenceVisible: boolean;
}): FreedomFeedbackOutcome | null {
  if (!input.freedomExercised) return null;
  return input.consequenceVisible ? "governed-agency" : "recklessness";
}

export const FOC_CONSTRUCTION_STAGES = [
  "fabrication",
  "fallacy",
  "framework",
  "authority",
] as const;

export type FOCConstructionStage = (typeof FOC_CONSTRUCTION_STAGES)[number];

export interface FOCConstructionSignals {
  unsupportedPremise: boolean;
  invalidReasoningProtectsPremise: boolean;
  premiseBecameProcedure: boolean;
  procedureBecameMandatory: boolean;
}

/**
 * Fabrication creates the false premise.
 * Fallacy makes the false premise appear logical.
 * Framework turns it into a repeatable system.
 * Authority imposes the system upon others.
 *
 * Returns the deepest stage supported by the supplied evidence.
 */
export function detectFOCConstructionStage(
  signals: FOCConstructionSignals,
): FOCConstructionStage | null {
  if (signals.procedureBecameMandatory) return "authority";
  if (signals.premiseBecameProcedure) return "framework";
  if (signals.invalidReasoningProtectsPremise) return "fallacy";
  if (signals.unsupportedPremise) return "fabrication";
  return null;
}

export const FABRICATION_NESTING_TIERS = {
  0: {
    name: "thought",
    description: "The fabrication exists privately.",
  },
  1: {
    name: "identity",
    description:
      "The person integrates the fabrication into who they believe they are.",
  },
  2: {
    name: "relationship",
    description:
      "Other people are required to recognize and interact with the fabrication.",
  },
  3: {
    name: "community",
    description: "A group repeats, protects, and validates the fabrication.",
  },
  4: {
    name: "framework",
    description: "Rules and procedures are built around the fabrication.",
  },
  5: {
    name: "institution",
    description:
      "Authority enforces the framework and participation is no longer voluntary.",
  },
  6: {
    name: "civilization",
    description:
      "Records, culture, education, and historical interpretation reorganize around the fabrication.",
  },
} as const;

export type FabricationNestingTier = keyof typeof FABRICATION_NESTING_TIERS;

export interface ValidationReceipt {
  id: string;
  status: "PASSED" | "FAILED" | "DEFERRED";
  evidence: string[];
  consequence?: string;
  createdAt: Timestamp;
}

/**
 * Mini Lite Version Protocol (MLVP)
 *
 * The smallest transferable protocol packet that seeds persistency,
 * consistency, and context across Project Jennifer runtimes.
 */
export interface MLVPSeed<TInput = unknown, TOutput = unknown> {
  protocolId: string;
  version: string;
  coreEquation: string;
  definition: string;
  trigger: string;
  input: TInput;
  executionLoop: readonly string[];
  pocCondition: string;
  focRisk: string;
  memoryWriteRule: string;
  output?: TOutput;
  validationReceipt?: ValidationReceipt;
}

export interface GovernanceMembranePacket<TPayload = unknown> {
  id: string;
  lane: string;
  payload: TPayload;
  evidence: string[];
  protocolId: string;
  permittedMemoryWrites: string[];
  predictedConsequences: string[];
  createdAt: Timestamp;
}

export function validateGovernanceMembranePacket(
  packet: GovernanceMembranePacket,
): string[] {
  const errors: string[] = [];

  if (!packet.id.trim()) errors.push("Packet ID is required.");
  if (!packet.lane.trim()) errors.push("A classified lane is required.");
  if (!packet.protocolId.trim()) errors.push("A protocol ID is required.");
  if (packet.evidence.length === 0) {
    errors.push("At least one evidence reference is required.");
  }
  if (packet.predictedConsequences.length === 0) {
    errors.push("At least one predicted consequence is required.");
  }

  return errors;
}

export const FAILURE_RECOGNITION_MLVP: MLVPSeed = {
  protocolId: "PP1.FAILURE_RECOGNITION",
  version: "1.0.0",
  coreEquation: "Failure + Recognition = Learning",
  definition:
    "Recognize failed validation, reject fabrication, extract the cause, and produce a corrected action.",
  trigger: "Expected and actual results diverge.",
  input: {
    required: ["attempt", "expectedResult", "actualResult", "evidence"],
  },
  executionLoop: [
    "recognize-failure",
    "reject-fabrication",
    "inspect-cause",
    "extract-lesson",
    "update-memory",
    "generate-revised-action",
  ],
  pocCondition: "The revised attempt survives validation.",
  focRisk: "Failure + Fabrication = Systemic Delusion",
  memoryWriteRule:
    "Write the failure, evidence, extracted lesson, and correction without cosmetically renaming the failure.",
};
