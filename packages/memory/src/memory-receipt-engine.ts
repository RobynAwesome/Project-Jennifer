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
  evidence: readonly string[];
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
  supersedesReceiptIds?: readonly string[];
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
  retrievalRoots?: readonly string[];
}

export interface MemoryReceiptInput {
  subject: string;
  claim: string;
  evidenceRefs: readonly string[];
  conceptState: ReceiptConceptState;
  confidence: number;
  consequence?: string;
  provenance: Record<string, unknown>;
  temporal: Omit<TemporalGovernance, "observedAt"> & { observedAt?: number };
  retrieval: RetrievalValidationTrace;
  riskVectors?: RiskVectorObservations;
}

export interface MemoryReceiptRiskAnalysis {
  vectorScores: Readonly<Record<RelationalFailureVector, number>>;
  matrix: Readonly<RiskVectorMatrix>;
  activeVectors: readonly RelationalFailureVector[];
  dominantVectors: readonly RelationalFailureVector[];
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
  "Issued receipts must be deeply immutable and detached from caller-owned mutable references.",
  "Non-finite numeric values may not enter durable receipt state.",
] as const;

function emptyVectorScores(): Record<RelationalFailureVector, number> {
  return Object.fromEntries(
    RELATIONAL_FAILURE_VECTORS.map((vector) => [vector, 0]),
  ) as Record<RelationalFailureVector, number>;
}

function finiteClamped(value: number, fallback = 0): number {
  return Number.isFinite(value) ? clamp(value, 0, 1) : fallback;
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
    scores[vector] = finiteClamped(observations[vector]?.score ?? 0);
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
  if (input.evidenceRefs.some((ref) => !ref.trim())) {
    errors.push("evidence references must be non-blank");
  }
  if (!Number.isFinite(input.confidence)) {
    errors.push("confidence must be a finite number");
  }

  if (
    input.conceptState === "proof-of-concept" &&
    !input.retrieval.evidenceVerified
  ) {
    errors.push("proof-of-concept requires verified evidence");
  }

  validateFiniteOptionalNumber(input.temporal.observedAt, "observedAt", errors);
  validateFiniteOptionalNumber(input.temporal.validFrom, "validFrom", errors);
  validateFiniteOptionalNumber(input.temporal.validUntil, "validUntil", errors);

  if (
    input.temporal.validFrom != null &&
    Number.isFinite(input.temporal.validFrom) &&
    input.temporal.validUntil != null &&
    Number.isFinite(input.temporal.validUntil) &&
    input.temporal.validUntil < input.temporal.validFrom
  ) {
    errors.push("validUntil cannot be earlier than validFrom");
  }

  if (
    input.temporal.supersedesReceiptIds?.some((ref) => !ref.trim())
  ) {
    errors.push("superseded receipt references must be non-blank");
  }
  if (input.retrieval.retrievalRoots?.some((root) => !root.trim())) {
    errors.push("retrieval roots must be non-blank");
  }

  try {
    cloneReceiptValue(input.provenance);
  } catch (error) {
    errors.push(
      `provenance must contain only finite JSON-safe receipt values: ${errorMessage(error)}`,
    );
  }

  for (const [vector, observation] of Object.entries(input.riskVectors ?? {})) {
    if (!RELATIONAL_FAILURE_VECTORS.includes(vector as RelationalFailureVector)) {
      errors.push(`unknown risk vector: ${vector}`);
      continue;
    }
    if (!observation) continue;

    if (!Number.isFinite(observation.score)) {
      errors.push(`risk vector ${vector} score must be a finite number`);
    }
    if (observation.evidence.some((ref) => !ref.trim())) {
      errors.push(`risk vector ${vector} evidence references must be non-blank`);
    }
    if (
      Number.isFinite(observation.score) &&
      observation.score > 0 &&
      observation.evidence.length === 0
    ) {
      errors.push(
        `risk vector ${vector} requires evidence when score is non-zero`,
      );
    }
  }

  return errors;
}

function validateFiniteOptionalNumber(
  value: number | undefined,
  field: string,
  errors: string[],
): void {
  if (value != null && !Number.isFinite(value)) {
    errors.push(`${field} must be a finite number when supplied`);
  }
}

function cloneReceiptValue<T>(value: T, seen = new WeakSet<object>()): T {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("non-finite number");
    }
    return value;
  }

  if (typeof value !== "object") {
    throw new TypeError(`unsupported ${typeof value} value`);
  }

  const objectValue = value as object;
  if (seen.has(objectValue)) {
    throw new TypeError("circular reference");
  }
  seen.add(objectValue);

  try {
    if (Array.isArray(value)) {
      return value.map((item) => cloneReceiptValue(item, seen)) as T;
    }

    if (Object.getPrototypeOf(value) !== Object.prototype) {
      throw new TypeError("non-plain object");
    }

    const clone: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      clone[key] = cloneReceiptValue(item, seen);
    }
    return clone as T;
  } finally {
    seen.delete(objectValue);
  }
}

function cloneProvenance(
  provenance: Record<string, unknown>,
): Record<string, unknown> {
  try {
    return cloneReceiptValue(provenance);
  } catch {
    return {};
  }
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || typeof value !== "object") return value;

  const objectValue = value as object;
  if (seen.has(objectValue)) return value;
  seen.add(objectValue);

  for (const nested of Object.values(value as Record<string, unknown>)) {
    deepFreeze(nested, seen);
  }

  return Object.freeze(value);
}

function finiteOptional(value: number | undefined): number | undefined {
  return value == null || !Number.isFinite(value) ? undefined : value;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
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

    const observedAt = Number.isFinite(input.temporal.observedAt)
      ? input.temporal.observedAt!
      : now();

    const receipt: MemoryReceipt = deepFreeze({
      id: generateId(),
      subject: input.subject.trim(),
      claim: input.claim.trim(),
      evidenceRefs: input.evidenceRefs.map((ref) => ref.trim()),
      conceptState: input.conceptState,
      confidence: finiteClamped(input.confidence),
      consequence: input.consequence,
      provenance: cloneProvenance(input.provenance),
      temporal: {
        ...input.temporal,
        observedAt,
        validFrom: finiteOptional(input.temporal.validFrom),
        validUntil: finiteOptional(input.temporal.validUntil),
        supersedesReceiptIds: input.temporal.supersedesReceiptIds
          ? input.temporal.supersedesReceiptIds.map((ref) => ref.trim())
          : undefined,
      },
      retrieval: {
        ...input.retrieval,
        retrievalRoots: input.retrieval.retrievalRoots
          ? input.retrieval.retrievalRoots.map((root) => root.trim())
          : undefined,
      },
      risk,
      admission,
      validationErrors: [...validationErrors],
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
