/**
 * Reality Quest Runtime contract.
 *
 * Pattern-only reference: DARER's real-world action loop.
 * DARER is not a dependency, authority, canon, or clinical proof for Jennifer.
 *
 * Composes with ConvergenceQuestState; does not replace it.
 */

export const REALITY_QUEST_SCHEMA_VERSION = 1 as const;

export const REALITY_QUEST_DOMAINS = [
  "education",
  "employment",
  "entrepreneurship",
  "aya",
  "kpgs",
] as const;

export type RealityQuestDomain = (typeof REALITY_QUEST_DOMAINS)[number];

export type RealityQuestStatus =
  | "proposed"
  | "accepted"
  | "active"
  | "evidence-submitted"
  | "evaluating"
  | "completed"
  | "revise"
  | "hold"
  | "abandoned";

export type RealityQuestVerdict = "ACCEPT" | "REVISE" | "HOLD";

export interface RealityQuestAction {
  description: string;
  bounded: boolean;
  estimatedEffort?: string;
  allowedAssistance: readonly string[];
}

export interface RealityQuestEvidencePolicy {
  required: boolean;
  acceptedEvidenceTypes: readonly string[];
  privacyClass: string;
  humanWitnessAllowed: boolean;
}

export interface RealityQuestContract {
  schemaVersion: typeof REALITY_QUEST_SCHEMA_VERSION;
  questId: string;
  domain: RealityQuestDomain;
  objectiveRef: string;
  sourceAuthorityRefs: readonly string[];
  currentStateEvidenceRefs: readonly string[];
  frictionClassification?: string;
  action: RealityQuestAction;
  evidencePolicy: RealityQuestEvidencePolicy;
  safetyPolicyRefs: readonly string[];
  /** Optional bind to PKA ConvergenceQuestState.questId — never a parallel ontology. */
  convergenceQuestId?: string;
  userAcceptedAt?: string;
  status: RealityQuestStatus;
  evaluationReceiptRef?: string;
  memoryReceiptRef?: string;
}

export interface RealityQuestEvidenceSubmission {
  questId: string;
  evidenceRefs: readonly string[];
  evidenceType: string;
  claimedComplete: boolean;
  praiseOnly?: boolean;
  clinicalClaimFromDarer?: boolean;
}

export class RealityQuestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RealityQuestError";
  }
}

export function assertRealityQuestContract(
  quest: RealityQuestContract,
): void {
  if (quest.schemaVersion !== REALITY_QUEST_SCHEMA_VERSION) {
    throw new RealityQuestError("schemaVersion 1 is required");
  }
  if (!quest.questId.trim()) throw new RealityQuestError("questId is required");
  if (!quest.objectiveRef.trim()) {
    throw new RealityQuestError("objectiveRef is required");
  }
  if (!quest.action.bounded) {
    throw new RealityQuestError("Reality quests must be bounded");
  }
  if (quest.sourceAuthorityRefs.length === 0) {
    throw new RealityQuestError("sourceAuthorityRefs are required");
  }
}
