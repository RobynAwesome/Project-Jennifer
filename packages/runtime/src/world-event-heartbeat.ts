import { createHash } from "node:crypto";

/**
 * Project Jennifer world-evaluation heartbeat.
 *
 * Canonical flow:
 * structured event -> PKA -> GLM -> CDP -> CCP -> KPGS -> execution -> receipt
 *
 * Models may interpret or propose. They never receive world authority from this module.
 */

export const WORLD_EVENT_SCHEMA_VERSION = "project-jennifer.world-event.v1" as const;
export const WORLD_EVENT_RECEIPT_VERSION = "project-jennifer.world-event-receipt.v1" as const;

export type EmojiProtocolToken = "📍" | "⏭️" | "👑" | "🔔";

export type WorldActorKind =
  | "player"
  | "npc"
  | "companion"
  | "construct"
  | "system"
  | "nature"
  | "external_device";

export type WorldEcosystem = "jennifer" | "forge" | "cairo" | "rtc" | "shared";

export interface WorldActorRef {
  id: string;
  kind: WorldActorKind;
}

export interface WorldTargetRef {
  id: string;
  kind: WorldActorKind | "location" | "economy" | "world";
}

export interface WorldTelemetryObservation {
  key: string;
  value: string | number | boolean;
  observedAt: string;
}

export interface WorldTelemetry {
  source: string;
  observations: readonly WorldTelemetryObservation[];
  consentScope?: string;
}

export interface WorldProvenanceRef {
  sourceId: string;
  uri: string;
  authorityScope: string;
  contentHash?: string;
}

/**
 * Evidence about interaction with the world, not a permanent personality claim.
 */
export interface WorldAffinityEvidence {
  ecosystem: WorldEcosystem;
  signal:
    | "bond"
    | "care"
    | "return"
    | "memory"
    | "creation"
    | "repair"
    | "stewardship"
    | "desire"
    | "resistance"
    | "choice"
    | "governance";
  strength: number;
  basis: string;
}

export interface StructuredWorldEvent {
  schemaVersion: typeof WORLD_EVENT_SCHEMA_VERSION;
  eventId: string;
  occurredAt: string;
  eventType: string;
  actor: WorldActorRef;
  target?: WorldTargetRef;
  ecosystem: WorldEcosystem;
  telemetry: WorldTelemetry;
  provenance: readonly WorldProvenanceRef[];
  affinityEvidence?: readonly WorldAffinityEvidence[];
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

export type PKAEpistemicState = "MAYBE" | "POC_CANDIDATE" | "FOC_CANDIDATE";
export type PKADisposition = "HOLD" | "PROPOSE" | "BLOCK";

export interface PKAEvaluation {
  state: PKAEpistemicState;
  disposition: PKADisposition;
  known: readonly string[];
  partial: readonly string[];
  unknown: readonly string[];
  reasons: readonly string[];
  receiptRef?: string;
}

export interface GLMInterpretation {
  summary: string;
  meanings: readonly string[];
  confidence?: number;
  modelRef?: string;
}

export interface CDPCandidate {
  id: string;
  description: string;
  effectClass: string;
  evidenceRefs: readonly string[];
}

export interface CCPSelection {
  selectedCandidateId: string | null;
  reason: string;
  receiptRef?: string;
}

export type KPGSVerdictStatus = "APPROVED" | "REJECTED" | "HITL_REQUIRED";

export interface KPGSVerdict {
  status: KPGSVerdictStatus;
  authority: string;
  reasons: readonly string[];
  receiptRef?: string;
}

export type WorldExecutionStatus = "APPLIED" | "FAILED";

export interface WorldExecutionResult {
  status: WorldExecutionStatus;
  effectType: string;
  effectSummary: string;
  externalRefs?: readonly string[];
}

export type WorldHeartbeatStatus =
  | "HELD_BY_PKA"
  | "BLOCKED_BY_PKA"
  | "NO_CONVERGENCE"
  | "REJECTED_BY_KPGS"
  | "HITL_REQUIRED"
  | "EXECUTED"
  | "EXECUTION_FAILED";

export interface WorldEventReceipt {
  schemaVersion: typeof WORLD_EVENT_RECEIPT_VERSION;
  receiptId: string;
  eventId: string;
  status: WorldHeartbeatStatus;
  epTrace: readonly EmojiProtocolToken[];
  pka: PKAEvaluation;
  glm?: GLMInterpretation;
  cdpCandidates?: readonly CDPCandidate[];
  ccp?: CCPSelection;
  kpgs?: KPGSVerdict;
  execution?: WorldExecutionResult;
  createdAt: string;
}

export interface WorldHeartbeatResult {
  event: StructuredWorldEvent;
  receipt: WorldEventReceipt;
}

export interface WorldEventHeartbeatPorts {
  evaluatePKA(event: StructuredWorldEvent): Promise<PKAEvaluation> | PKAEvaluation;
  interpretGLM(event: StructuredWorldEvent, pka: PKAEvaluation): Promise<GLMInterpretation> | GLMInterpretation;
  divergeCDP(
    event: StructuredWorldEvent,
    pka: PKAEvaluation,
    interpretation: GLMInterpretation,
  ): Promise<readonly CDPCandidate[]> | readonly CDPCandidate[];
  convergeCCP(
    event: StructuredWorldEvent,
    pka: PKAEvaluation,
    interpretation: GLMInterpretation,
    candidates: readonly CDPCandidate[],
  ): Promise<CCPSelection> | CCPSelection;
  validateKPGS(input: {
    event: StructuredWorldEvent;
    pka: PKAEvaluation;
    interpretation: GLMInterpretation;
    candidates: readonly CDPCandidate[];
    selection: CCPSelection;
  }): Promise<KPGSVerdict> | KPGSVerdict;
  execute(input: {
    event: StructuredWorldEvent;
    selectedCandidate: CDPCandidate;
    verdict: KPGSVerdict;
  }): Promise<WorldExecutionResult> | WorldExecutionResult;
  now?: () => string;
}

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function canonicalize(value: unknown): JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("WorldEventPacket rejects non-finite numbers");
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalize(entry));
  }
  if (typeof value === "object") {
    const output: Record<string, JsonValue> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const entry = (value as Record<string, unknown>)[key];
      if (entry !== undefined) {
        output[key] = canonicalize(entry);
      }
    }
    return output;
  }
  throw new Error(`WorldEventPacket does not support ${typeof value}`);
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value)), "utf8").digest("hex");
}

function assertNonEmpty(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${field} must be non-empty`);
  }
}

function assertFiniteUnitInterval(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${field} must be finite and between 0 and 1`);
  }
}

export function validateStructuredWorldEvent(event: StructuredWorldEvent): readonly string[] {
  const errors: string[] = [];

  if (event.schemaVersion !== WORLD_EVENT_SCHEMA_VERSION) errors.push("unsupported schemaVersion");
  if (!event.eventId.trim()) errors.push("eventId is required");
  if (!event.eventType.trim()) errors.push("eventType is required");
  if (!event.actor.id.trim()) errors.push("actor.id is required");
  if (!event.telemetry.source.trim()) errors.push("telemetry.source is required");
  if (event.provenance.length === 0) errors.push("at least one provenance ref is required");
  if (Number.isNaN(Date.parse(event.occurredAt))) errors.push("occurredAt must be an ISO-compatible timestamp");

  for (const observation of event.telemetry.observations) {
    if (!observation.key.trim()) errors.push("telemetry observation key is required");
    if (Number.isNaN(Date.parse(observation.observedAt))) {
      errors.push(`telemetry observation ${observation.key || "<unknown>"} has invalid observedAt`);
    }
    if (typeof observation.value === "number" && !Number.isFinite(observation.value)) {
      errors.push(`telemetry observation ${observation.key || "<unknown>"} must be finite`);
    }
  }

  for (const provenance of event.provenance) {
    if (!provenance.sourceId.trim() || !provenance.uri.trim() || !provenance.authorityScope.trim()) {
      errors.push("provenance refs require sourceId, uri and authorityScope");
    }
  }

  for (const evidence of event.affinityEvidence ?? []) {
    if (!Number.isFinite(evidence.strength) || evidence.strength < 0 || evidence.strength > 1) {
      errors.push(`affinity evidence ${evidence.signal} strength must be between 0 and 1`);
    }
    if (!evidence.basis.trim()) errors.push(`affinity evidence ${evidence.signal} basis is required`);
  }

  return errors;
}

function validatePKA(pka: PKAEvaluation): void {
  if (
    (pka.state === "MAYBE" && pka.disposition !== "HOLD") ||
    (pka.state === "POC_CANDIDATE" && pka.disposition !== "PROPOSE") ||
    (pka.state === "FOC_CANDIDATE" && pka.disposition !== "BLOCK")
  ) {
    throw new Error(`PKA state/disposition mismatch: ${pka.state}/${pka.disposition}`);
  }
}

function validateGLM(interpretation: GLMInterpretation): void {
  assertNonEmpty(interpretation.summary, "glm.summary");
  if (interpretation.meanings.length === 0) throw new Error("glm.meanings must not be empty");
  if (interpretation.confidence !== undefined) {
    assertFiniteUnitInterval(interpretation.confidence, "glm.confidence");
  }
}

function validateCandidates(candidates: readonly CDPCandidate[]): void {
  const ids = new Set<string>();
  for (const candidate of candidates) {
    assertNonEmpty(candidate.id, "cdp.candidate.id");
    assertNonEmpty(candidate.description, "cdp.candidate.description");
    assertNonEmpty(candidate.effectClass, "cdp.candidate.effectClass");
    if (ids.has(candidate.id)) throw new Error(`duplicate CDP candidate id: ${candidate.id}`);
    ids.add(candidate.id);
  }
}

function makeReceipt(input: Omit<WorldEventReceipt, "schemaVersion" | "receiptId">): WorldEventReceipt {
  const material = {
    schemaVersion: WORLD_EVENT_RECEIPT_VERSION,
    ...input,
  };
  return {
    ...material,
    receiptId: digest(material),
  };
}

/**
 * Executes one governed world heartbeat.
 *
 * PKA non-closure is terminal for this heartbeat. KPGS rejection/HITL also prevents execution.
 * Emoji Protocol tokens communicate stage state; they never substitute for receipts or authority.
 */
export async function runWorldEventHeartbeat(
  event: StructuredWorldEvent,
  ports: WorldEventHeartbeatPorts,
): Promise<WorldHeartbeatResult> {
  const validationErrors = validateStructuredWorldEvent(event);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid StructuredWorldEvent: ${validationErrors.join("; ")}`);
  }

  const epTrace: EmojiProtocolToken[] = ["📍"];
  const createdAt = ports.now?.() ?? new Date().toISOString();

  const pka = await ports.evaluatePKA(event);
  validatePKA(pka);

  if (pka.disposition === "HOLD") {
    epTrace.push("🔔");
    return {
      event,
      receipt: makeReceipt({ eventId: event.eventId, status: "HELD_BY_PKA", epTrace, pka, createdAt }),
    };
  }

  if (pka.disposition === "BLOCK") {
    epTrace.push("🔔");
    return {
      event,
      receipt: makeReceipt({ eventId: event.eventId, status: "BLOCKED_BY_PKA", epTrace, pka, createdAt }),
    };
  }

  epTrace.push("⏭️");

  const glm = await ports.interpretGLM(event, pka);
  validateGLM(glm);

  const cdpCandidates = await ports.divergeCDP(event, pka, glm);
  validateCandidates(cdpCandidates);

  const ccp = await ports.convergeCCP(event, pka, glm, cdpCandidates);
  if (ccp.selectedCandidateId === null) {
    epTrace.push("🔔");
    return {
      event,
      receipt: makeReceipt({
        eventId: event.eventId,
        status: "NO_CONVERGENCE",
        epTrace,
        pka,
        glm,
        cdpCandidates,
        ccp,
        createdAt,
      }),
    };
  }

  const selectedCandidate = cdpCandidates.find((candidate) => candidate.id === ccp.selectedCandidateId);
  if (!selectedCandidate) {
    throw new Error(`CCP selected unknown CDP candidate: ${ccp.selectedCandidateId}`);
  }

  epTrace.push("👑");
  const kpgs = await ports.validateKPGS({ event, pka, interpretation: glm, candidates: cdpCandidates, selection: ccp });

  if (kpgs.status === "REJECTED") {
    epTrace.push("🔔");
    return {
      event,
      receipt: makeReceipt({
        eventId: event.eventId,
        status: "REJECTED_BY_KPGS",
        epTrace,
        pka,
        glm,
        cdpCandidates,
        ccp,
        kpgs,
        createdAt,
      }),
    };
  }

  if (kpgs.status === "HITL_REQUIRED") {
    epTrace.push("🔔");
    return {
      event,
      receipt: makeReceipt({
        eventId: event.eventId,
        status: "HITL_REQUIRED",
        epTrace,
        pka,
        glm,
        cdpCandidates,
        ccp,
        kpgs,
        createdAt,
      }),
    };
  }

  const execution = await ports.execute({ event, selectedCandidate, verdict: kpgs });
  epTrace.push("🔔");

  return {
    event,
    receipt: makeReceipt({
      eventId: event.eventId,
      status: execution.status === "APPLIED" ? "EXECUTED" : "EXECUTION_FAILED",
      epTrace,
      pka,
      glm,
      cdpCandidates,
      ccp,
      kpgs,
      execution,
      createdAt,
    }),
  };
}
