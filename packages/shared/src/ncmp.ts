/**
 * NCMP — New Concept MMAO Protocol.
 *
 * NCMP governs the rare case where a concept is created inside a Multi-Agent
 * Mobile Orchestration (MMAO) session instead of being supplied beforehand by
 * the human architect.
 *
 * Agents may originate and propose a concept. Only the human architect may
 * recognize it as an NCMP concept. Recognition does not automatically mean the
 * concept is validated or registered as permanent Project Jennifer canon.
 */

export const NCMP_PROTOCOL_ID = "MMAO.NCMP" as const;
export const NCMP_PROTOCOL_NAME = "New Concept MMAO Protocol" as const;
export const NCMP_VERSION = "1.0.0" as const;

export const NCMP_STATES = [
  "candidate",
  "recognized",
  "validated",
  "registered",
  "rejected",
  "superseded",
] as const;

export type NCMPState = (typeof NCMP_STATES)[number];

export interface NCMPOrigin {
  /** MMAO focus station, session, thread, or execution boundary. */
  focusStationId: string;
  /** Agent or governed agent group that first expressed the concept. */
  originatingAgent: string;
  /** Exact source wording or a durable reference to it. */
  sourceEvidence: readonly string[];
  /** ISO-8601 timestamp supplied by the caller. */
  originatedAt: string;
}

export interface NCMPConceptCandidate {
  id: string;
  acronym: string;
  name: string;
  definition: string;
  problemRecognized: string;
  protocolContribution: string;
  origin: NCMPOrigin;
  tags?: readonly string[];
}

export interface NCMPRecognition {
  conceptId: string;
  recognizedBy: string;
  recognitionStatement: string;
  recognizedAt: string;
}

export interface NCMPValidation {
  conceptId: string;
  validatedBy: string;
  evidence: readonly string[];
  result: "passed" | "failed" | "deferred";
  validatedAt: string;
}

export interface NCMPRecord {
  candidate: NCMPConceptCandidate;
  state: NCMPState;
  recognition?: NCMPRecognition;
  validation?: NCMPValidation;
  registeredAt?: string;
  rejectionReason?: string;
  supersededBy?: string;
}

export interface NCMPReceipt {
  protocolId: typeof NCMP_PROTOCOL_ID;
  protocolVersion: typeof NCMP_VERSION;
  conceptId: string;
  from: NCMPState | "none";
  to: NCMPState;
  actor: string;
  evidence: readonly string[];
  createdAt: string;
}

export class NCMPGovernanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NCMPGovernanceError";
  }
}

function requireText(value: string, field: string): void {
  if (!value.trim()) {
    throw new NCMPGovernanceError(`${field} is required.`);
  }
}

export function validateNCMPCandidate(candidate: NCMPConceptCandidate): string[] {
  const errors: string[] = [];

  if (!candidate.id.trim()) errors.push("Candidate ID is required.");
  if (!candidate.acronym.trim()) errors.push("Candidate acronym is required.");
  if (!candidate.name.trim()) errors.push("Candidate name is required.");
  if (!candidate.definition.trim()) errors.push("Candidate definition is required.");
  if (!candidate.problemRecognized.trim()) {
    errors.push("The recognized problem is required.");
  }
  if (!candidate.protocolContribution.trim()) {
    errors.push("The protocol contribution is required.");
  }
  if (!candidate.origin.focusStationId.trim()) {
    errors.push("The MMAO focus station ID is required.");
  }
  if (!candidate.origin.originatingAgent.trim()) {
    errors.push("The originating agent is required.");
  }
  if (candidate.origin.sourceEvidence.length === 0) {
    errors.push("At least one source-evidence reference is required.");
  }
  if (!candidate.origin.originatedAt.trim()) {
    errors.push("The origin timestamp is required.");
  }

  return errors;
}

/**
 * In-memory NCMP registry.
 *
 * This class is intentionally storage-agnostic. PostgreSQL persistence is a
 * later PERN adoption step; the transition rules are defined here first.
 */
export class NCMPRegistry {
  private readonly records = new Map<string, NCMPRecord>();
  private readonly receipts: NCMPReceipt[] = [];

  propose(candidate: NCMPConceptCandidate, actor: string, createdAt: string): NCMPReceipt {
    requireText(actor, "Actor");
    requireText(createdAt, "Receipt timestamp");

    const errors = validateNCMPCandidate(candidate);
    if (errors.length > 0) {
      throw new NCMPGovernanceError(errors.join(" "));
    }
    if (this.records.has(candidate.id)) {
      throw new NCMPGovernanceError(`Concept '${candidate.id}' already exists.`);
    }

    this.records.set(candidate.id, { candidate, state: "candidate" });
    return this.emit(candidate.id, "none", "candidate", actor, candidate.origin.sourceEvidence, createdAt);
  }

  recognize(input: NCMPRecognition): NCMPReceipt {
    const record = this.requireRecord(input.conceptId);
    this.requireState(record, "candidate");
    requireText(input.recognizedBy, "Recognizing architect");
    requireText(input.recognitionStatement, "Recognition statement");
    requireText(input.recognizedAt, "Recognition timestamp");

    record.recognition = input;
    record.state = "recognized";
    return this.emit(
      input.conceptId,
      "candidate",
      "recognized",
      input.recognizedBy,
      [input.recognitionStatement],
      input.recognizedAt,
    );
  }

  validate(input: NCMPValidation): NCMPReceipt {
    const record = this.requireRecord(input.conceptId);
    this.requireState(record, "recognized");
    requireText(input.validatedBy, "Validator");
    requireText(input.validatedAt, "Validation timestamp");
    if (input.evidence.length === 0) {
      throw new NCMPGovernanceError("Validation requires evidence.");
    }

    record.validation = input;
    record.state = input.result === "passed" ? "validated" : input.result === "failed" ? "rejected" : "recognized";

    return this.emit(
      input.conceptId,
      "recognized",
      record.state,
      input.validatedBy,
      input.evidence,
      input.validatedAt,
    );
  }

  register(conceptId: string, actor: string, registeredAt: string): NCMPReceipt {
    const record = this.requireRecord(conceptId);
    this.requireState(record, "validated");
    requireText(actor, "Registering actor");
    requireText(registeredAt, "Registration timestamp");

    record.state = "registered";
    record.registeredAt = registeredAt;
    return this.emit(conceptId, "validated", "registered", actor, ["NCMP concept entered Project Jennifer canon."], registeredAt);
  }

  reject(conceptId: string, actor: string, reason: string, rejectedAt: string): NCMPReceipt {
    const record = this.requireRecord(conceptId);
    if (record.state === "registered" || record.state === "superseded") {
      throw new NCMPGovernanceError(`Cannot reject a concept in state '${record.state}'.`);
    }
    requireText(actor, "Rejecting actor");
    requireText(reason, "Rejection reason");
    requireText(rejectedAt, "Rejection timestamp");

    const from = record.state;
    record.state = "rejected";
    record.rejectionReason = reason;
    return this.emit(conceptId, from, "rejected", actor, [reason], rejectedAt);
  }

  supersede(conceptId: string, replacementConceptId: string, actor: string, supersededAt: string): NCMPReceipt {
    const record = this.requireRecord(conceptId);
    this.requireState(record, "registered");
    const replacement = this.requireRecord(replacementConceptId);
    this.requireState(replacement, "registered");
    requireText(actor, "Superseding actor");
    requireText(supersededAt, "Supersession timestamp");

    record.state = "superseded";
    record.supersededBy = replacementConceptId;
    return this.emit(
      conceptId,
      "registered",
      "superseded",
      actor,
      [`Superseded by '${replacementConceptId}'.`],
      supersededAt,
    );
  }

  get(conceptId: string): NCMPRecord | undefined {
    return this.records.get(conceptId);
  }

  list(): readonly NCMPRecord[] {
    return [...this.records.values()];
  }

  getReceipts(conceptId?: string): readonly NCMPReceipt[] {
    return conceptId
      ? this.receipts.filter((receipt) => receipt.conceptId === conceptId)
      : [...this.receipts];
  }

  private requireRecord(conceptId: string): NCMPRecord {
    requireText(conceptId, "Concept ID");
    const record = this.records.get(conceptId);
    if (!record) {
      throw new NCMPGovernanceError(`Unknown NCMP concept '${conceptId}'.`);
    }
    return record;
  }

  private requireState(record: NCMPRecord, expected: NCMPState): void {
    if (record.state !== expected) {
      throw new NCMPGovernanceError(
        `Concept '${record.candidate.id}' must be '${expected}', not '${record.state}'.`,
      );
    }
  }

  private emit(
    conceptId: string,
    from: NCMPState | "none",
    to: NCMPState,
    actor: string,
    evidence: readonly string[],
    createdAt: string,
  ): NCMPReceipt {
    const receipt: NCMPReceipt = {
      protocolId: NCMP_PROTOCOL_ID,
      protocolVersion: NCMP_VERSION,
      conceptId,
      from,
      to,
      actor,
      evidence,
      createdAt,
    };
    this.receipts.push(receipt);
    return receipt;
  }
}

/**
 * Canonical first NCMP declaration created in this focus station.
 */
export const NCMP_SELF_DECLARATION: NCMPConceptCandidate = {
  id: "ncmp.new-concept-mmao-protocol",
  acronym: "NCMP",
  name: NCMP_PROTOCOL_NAME,
  definition:
    "Recognition and governance of a new concept that originated inside Multi-Agent Mobile Orchestration.",
  problemRecognized:
    "MMAO agents can produce a legitimate new protocol concept, but the repository previously had no governed path for recognizing that rare event.",
  protocolContribution:
    "Creates an explicit candidate-to-recognition-to-validation-to-registration lifecycle under human authority.",
  origin: {
    focusStationId: "project-jennifer.project-waifu-forge",
    originatingAgent: "MMAO collaborative agents",
    sourceEvidence: [
      "Human architect declaration: NCMP recognizes a concept built inside MMAO and welcomes the rare case where agents create a protocol for themselves.",
    ],
    originatedAt: "2026-08-06T09:36:00+02:00",
  },
  tags: ["mmao", "governance", "protocol-origin", "concept-recognition"],
};
