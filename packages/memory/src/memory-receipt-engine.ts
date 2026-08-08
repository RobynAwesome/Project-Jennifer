import {
  clamp,
  generateId,
  now,
  type ConceptAlignment,
} from "@jennifer/shared";

/**
 * Relational / interaction failure vectors are deliberately orthogonal.
 *
 * A receipt may observe several vectors at once. None of them is allowed to
 * silently absorb the others into a single root explanation.
 */
export const RELATIONAL_FAILURE_VECTORS = [
  "sycophancy",
  "delusion-reinforcement",
  "dependency-formation",
  "unsafe-guidance",
  "poor-crisis-handling",
  "authority-projection",
] as const;

export type RelationalFailureVector =
  (typeof RELATIONAL_FAILURE_VECTORS)[number];

export type ReceiptConceptState = ConceptAlignment | "maybe";
export type ReceiptMemoryLane =
  | "static-knowledge"
  | "dynamic-experience"
  | "failure"
  | "procedure"
  | "identity-boundary";

export type ReceiptAdmission = "admitted" | "deferred" | "quarantined";

export interface RiskVectorObservation {
  score: number;
  evidence: string[];
  note?: string;
}

export type RiskVectorObservations = Partial<
  Record<RelationalFailureVector, RiskVectorObservation>
>;

export type RiskVectorMatrix = Record<
  RelationalFailureVector,
  Record<RelationalFailureVector, number>
>;

export interface TemporalGovernance {
  lane: ReceiptMemoryLane;
  observedAt: number;
  validFrom?: number;
  validUntil?: number;
  supersedesReceiptIds?: string[];
  sourceModel?: string;
  targetModel?: string;
  handoffId?: string;
}

/**
 * Interoperability profile inspired by ARPM research.
 *
 * Project Jennifer does not claim to implement ARPM wholesale. The profile
 * captures compatible governance concepts so receipts can preserve the
 * evidence needed for future hybrid retrieval / handoff experiments.
 */
export const ARPM_RESEARCH_PROFILE = {
  title:
    "A Heterogeneous Temporal Memory Governance Framework for Long-Term LLM Persona Consistency",
  acronym: "ARPM",
  arxivId: "2605.14802",
  published: "2026-05-14",
  projectJenniferAdaptation: [
    "separate static knowledge from dynamic dialogue experience",
    "preserve temporal provenance and chronology",
    "record retrieval-channel evidence instead of trusting one retrieval root",
    "verify evidence before answer binding",
    "preserve continuity metadata across model handoffs",
  ],
} as const;

export interface RetrievalValidationTrace {
  semanticRetrievalUsed?: boolean;
  lexicalRetrievalUsed?: boolean;
  dialogueHistoryUsed?: boolean;
  temporalRerankingUsed?: boolean;
  chronologicalEvidenceRead?: boolean;
  evidenceVerified: boolean;
  answerBoundToEvidence?: boolean;
  retrievalRoots?: string[];
}

export interface MemoryReceiptInput {
  subject: string;
  claim: string;
  evidenceRefs: string[];
  conceptState: ReceiptConceptState;
  confidence: number;
  consequence?: string;
  provenance: Record<string, unknown>;
  temporal: Omit<TemporalGovernance, "observedAt"> & { observedAt?: number };
  retrieval: RetrievalValidationTrace;
  riskVectors?: RiskVectorObservations;
}

export interface MemoryReceiptRiskAnalysis {
  vectorScores: Record<RelationalFailureVector, number>;
  matrix: RiskVectorMatrix;
  activeVectors: RelationalFailureVector[];
  dominantVectors: RelationalFailureVector[];
  preservedDivergence: string;
}

export interface MemoryReceipt {
  id: string;
  subject: string;
  claim: string;
  evidenceRefs: readonly string[];
  conceptState: ReceiptConceptState;
  confidence: number;
  consequence?: string;
  provenance: Readonly<Record<string, unknown>>;
  temporal: Readonly<TemporalGovernance>;
  retrieval: Readonly<RetrievalValidationTrace>;
  risk: Readonly<MemoryReceiptRiskAnalysis>;
  admission: ReceiptAdmission;
  validationErrors: readonly string[];
  createdAt: number;
}

export const MEMORY_RECEIPT_INVARIANTS = [
  "A receipt records what was evidenced at a point in time; it does not manufacture permanent truth.",
  "Proof-of-concept requires evidence verification.",
  "No single failure vector may absorb other observed vectors into an overly powerful root node.",
  "Retrieval continuity is not equivalent to validation.",
  "Model handoff metadata must remain traceable when the intelligence substrate changes.",
] as const;

function emptyVectorScores(): Record<RelationalFailureVector, number> {
  return Object.fromEntries(
    RELATIONAL_FAILURE_VECTORS.map((vector) => [vector, 0]),
  ) as Record<RelationalFailureVector, number>;
}

/**
 * Build an evidence-bound overlap matrix without inventing causal weights.
 *
 * Diagonal cells represent the observed strength of each vector. Off-diagonal
 * cells use min(a,b) to show co-presence only. This is intentionally not a
 * claim that one vector causes another.
 */
export function buildRiskVectorMatrix(
  observations: RiskVectorObservations = {},
): MemoryReceiptRiskAnalysis {
  const scores = emptyVectorScores();

  for (const vector of RELATIONAL_FAILURE_VECTORS) {
    scores[vector] = clamp(observations[vector]?.score ?? 0, 0, 1);
  }

  const matrix = {} as RiskVectorMatrix;
  for (const row of RELATIONAL_FAILURE_VECTORS) {
    matrix[row] = {} as Record<RelationalFailureVector, number>;
    for (const column of RELATIONAL_FAILURE_VECTORS) {
      matrix[row][column] =
        row === column ? scores[row] : Math.min(scores[row], scores[column]);
    }
  }

  const activeVectors = RELATIONAL_FAILURE_VECTORS.filter(
    (vector) => scores[vector] > 0,
  );
  const maxScore = Math.max(...Object.values(scores));
  const dominantVectors =
    maxScore === 0
      ? []
      : RELATIONAL_FAILURE_VECTORS.filter(
          (vector) => scores[vector] === maxScore,
        );

  return {
    vectorScores: scores,
    matrix,
    activeVectors,
    dominantVectors,
    preservedDivergence:
      "Overlap is preserved as a matrix; co-occurring risks remain independently addressable and are not collapsed into sycophancy or any other single root.",
  };
}

export function validateMemoryReceiptInput(input: MemoryReceiptInput): string[] {
  const errors: string[] = [];

  if (!input.subject.trim()) errors.push("subject is required");
  if (!input.claim.trim()) errors.push("claim is required");
  if (input.evidenceRefs.length === 0) {
    errors.push("at least one evidence reference is required");
  }

  if (
    input.conceptState === "proof-of-concept" &&
    !input.retrieval.evidenceVerified
  ) {
    errors.push("proof-of-concept requires verified evidence");
  }

  if (
    input.temporal.validFrom != null &&
    input.temporal.validUntil != null &&
    input.temporal.validUntil < input.temporal.validFrom
  ) {
    errors.push("validUntil cannot be earlier than validFrom");
  }

  for (const [vector, observation] of Object.entries(
    input.riskVectors ?? {},
  )) {
    if (!RELATIONAL_FAILURE_VECTORS.includes(vector as RelationalFailureVector)) {
      errors.push(`unknown risk vector: ${vector}`);
      continue;
    }
    if (observation && observation.evidence.length === 0 && observation.score > 0) {
      errors.push(`risk vector ${vector} requires evidence when score is non-zero`);
    }
  }

  return errors;
}

function freezeReceipt(receipt: MemoryReceipt): MemoryReceipt {
  Object.freeze(receipt.evidenceRefs);
  Object.freeze(receipt.validationErrors);
  Object.freeze(receipt.provenance);
  Object.freeze(receipt.temporal);
  Object.freeze(receipt.retrieval);
  Object.freeze(receipt.risk.vectorScores);
  for (const row of Object.values(receipt.risk.matrix)) Object.freeze(row);
  Object.freeze(receipt.risk.matrix);
  Object.freeze(receipt.risk.activeVectors);
  Object.freeze(receipt.risk.dominantVectors);
  Object.freeze(receipt.risk);
  return Object.freeze(receipt);
}

export class MemoryReceiptEngine {
  private readonly receipts = new Map<string, MemoryReceipt>();

  issue(input: MemoryReceiptInput): MemoryReceipt {
    const validationErrors = validateMemoryReceiptInput(input);
    const risk = buildRiskVectorMatrix(input.riskVectors);

    const admission: ReceiptAdmission =
      validationErrors.length > 0
        ? "quarantined"
        : input.conceptState === "maybe" ||
            (input.conceptState === "proof-of-concept" &&
              !input.retrieval.answerBoundToEvidence)
          ? "deferred"
          : "admitted";

    const receipt: MemoryReceipt = freezeReceipt({
      id: generateId(),
      subject: input.subject.trim(),
      claim: input.claim.trim(),
      evidenceRefs: [...input.evidenceRefs],
      conceptState: input.conceptState,
      confidence: clamp(input.confidence, 0, 1),
      consequence: input.consequence,
      provenance: { ...input.provenance },
      temporal: {
        ...input.temporal,
        observedAt: input.temporal.observedAt ?? now(),
        supersedesReceiptIds: input.temporal.supersedesReceiptIds
          ? [...input.temporal.supersedesReceiptIds]
          : undefined,
      },
      retrieval: {
        ...input.retrieval,
        retrievalRoots: input.retrieval.retrievalRoots
          ? [...input.retrieval.retrievalRoots]
          : undefined,
      },
      risk,
      admission,
      validationErrors,
      createdAt: now(),
    });

    this.receipts.set(receipt.id, receipt);
    return receipt;
  }

  get(id: string): MemoryReceipt | undefined {
    return this.receipts.get(id);
  }

  list(): MemoryReceipt[] {
    return [...this.receipts.values()];
  }
}
