import { createHash, timingSafeEqual } from "node:crypto";

export const SOUL_FILE_SCHEMA_VERSION = "project-jennifer.soul.v1" as const;
export const SOUL_POLICY_VERSION = "project-jennifer.soul-policy.v1" as const;

export type SoulActorKind =
  | "human_operator"
  | "kpgs"
  | "model"
  | "skill"
  | "tool"
  | "memory"
  | "mcp"
  | "system";

export interface SoulIdentity {
  soulId: string;
  canonicalName: string;
  namespace: string;
}

export interface SoulInvariants {
  identity: readonly string[];
  boundaries: readonly string[];
  continuity: readonly string[];
}

export interface SoulMemoryPolicy {
  namespace: string;
  allowCrossSoulRead: boolean;
  allowCrossSoulWrite: boolean;
}

export interface SoulProvenance {
  createdBy: string;
  sourceRef: string;
  policyVersion: typeof SOUL_POLICY_VERSION;
}

export interface SoulRecoveryPolicy {
  strategy: "last-known-good";
  canonicalAuthority: "postgres-ledger";
  projectionAuthority: "mongodb-rebuildable";
}

export interface SoulFile {
  schemaVersion: typeof SOUL_FILE_SCHEMA_VERSION;
  identity: SoulIdentity;
  invariants: SoulInvariants;
  memory: SoulMemoryPolicy;
  provenance: SoulProvenance;
  recovery: SoulRecoveryPolicy;
}

export interface SealedSoulFile {
  soul: SoulFile;
  soulHash: string;
}

export interface SoulRuntimeBinding {
  instanceId: string;
  soulId: string;
  soulHash: string;
  modelProvider: string;
  modelName: string;
  memoryNamespace: string;
}

export interface SoulMutationActor {
  kind: SoulActorKind;
  id: string;
}

export interface SoulEvolutionEvent {
  kind: "soul_evolution";
  expectedSoulHash: string;
  operatorApproved: boolean;
  operatorId?: string;
  reason: string;
  sourceRef: string;
  allowInvariantEvolution?: boolean;
  invariantEvolutionReason?: string;
}

export interface SoulMutationRequest {
  actor: SoulMutationActor;
  event: SoulEvolutionEvent;
  candidateSoul: SoulFile;
}

export type SoulMutationDecisionCode =
  | "ALLOW"
  | "INVALID_CURRENT_SOUL"
  | "INVALID_CANDIDATE_SOUL"
  | "SOUL_MUTATION_REQUIRES_KPGS"
  | "OPERATOR_APPROVAL_REQUIRED"
  | "STALE_CANONICAL_HASH"
  | "SOUL_ID_IMMUTABLE"
  | "SOUL_NAMESPACE_IMMUTABLE"
  | "MEMORY_NAMESPACE_IMMUTABLE"
  | "INVARIANT_EVOLUTION_NOT_AUTHORIZED"
  | "INVARIANT_EVOLUTION_REASON_REQUIRED";

export interface SoulMutationReceipt {
  schemaVersion: "project-jennifer.soul-mutation-receipt.v1";
  attemptId: string;
  decision: "ALLOW" | "DENY";
  code: SoulMutationDecisionCode;
  policyVersion: typeof SOUL_POLICY_VERSION;
  actorKind: SoulActorKind;
  actorId: string;
  operatorId: string | null;
  currentSoulHash: string;
  candidateSoulHash: string | null;
  sourceRef: string;
  reasonDigest: string;
}

export interface SoulMutationEvaluation {
  allowed: boolean;
  receipt: SoulMutationReceipt;
  candidate?: SealedSoulFile;
}

export interface MemoryScopeDecision {
  allowed: boolean;
  code:
    | "ALLOW"
    | "SOURCE_SOUL_MISMATCH"
    | "CROSS_SOUL_READ_DENIED"
    | "CROSS_SOUL_WRITE_DENIED"
    | "TARGET_NAMESPACE_INVALID";
}

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

function canonicalize(value: unknown): JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Soul canonicalization rejects non-finite numbers");
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const result: Record<string, JsonValue> = {};
    for (const key of Object.keys(record).sort()) {
      const item = record[key];
      if (item !== undefined) {
        result[key] = canonicalize(item);
      }
    }
    return result;
  }
  throw new Error(`Unsupported soul value type: ${typeof value}`);
}

function stableJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function safeHashEqual(a: string, b: string): boolean {
  if (!/^[a-f0-9]{64}$/u.test(a) || !/^[a-f0-9]{64}$/u.test(b)) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

function nonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

function allNonEmpty(values: readonly string[]): boolean {
  return values.length > 0 && values.every(nonEmpty);
}

function sameStrings(a: readonly string[], b: readonly string[]): boolean {
  return stableJson(a) === stableJson(b);
}

function invariantsEqual(a: SoulInvariants, b: SoulInvariants): boolean {
  return (
    sameStrings(a.identity, b.identity) &&
    sameStrings(a.boundaries, b.boundaries) &&
    sameStrings(a.continuity, b.continuity)
  );
}

export function expectedSoulNamespace(soulId: string): string {
  return `soul:${soulId}`;
}

export function expectedMemoryNamespace(soulId: string): string {
  return `${expectedSoulNamespace(soulId)}:memory`;
}

export function validateSoulFile(soul: SoulFile): readonly string[] {
  const errors: string[] = [];

  if (soul.schemaVersion !== SOUL_FILE_SCHEMA_VERSION) {
    errors.push("schemaVersion must be project-jennifer.soul.v1");
  }
  if (!nonEmpty(soul.identity.soulId)) {
    errors.push("identity.soulId is required");
  }
  if (!nonEmpty(soul.identity.canonicalName)) {
    errors.push("identity.canonicalName is required");
  }
  if (soul.identity.namespace !== expectedSoulNamespace(soul.identity.soulId)) {
    errors.push("identity.namespace must be derived from soulId");
  }
  if (soul.memory.namespace !== expectedMemoryNamespace(soul.identity.soulId)) {
    errors.push("memory.namespace must be derived from soulId");
  }
  if (soul.memory.allowCrossSoulWrite) {
    errors.push("cross-soul memory writes are forbidden by SoulFile v1");
  }
  if (!allNonEmpty(soul.invariants.identity)) {
    errors.push("at least one identity invariant is required");
  }
  if (!allNonEmpty(soul.invariants.boundaries)) {
    errors.push("at least one boundary invariant is required");
  }
  if (!allNonEmpty(soul.invariants.continuity)) {
    errors.push("at least one continuity invariant is required");
  }
  if (soul.provenance.policyVersion !== SOUL_POLICY_VERSION) {
    errors.push("provenance.policyVersion is unsupported");
  }
  if (!nonEmpty(soul.provenance.createdBy) || !nonEmpty(soul.provenance.sourceRef)) {
    errors.push("provenance createdBy/sourceRef are required");
  }
  if (
    soul.recovery.strategy !== "last-known-good" ||
    soul.recovery.canonicalAuthority !== "postgres-ledger" ||
    soul.recovery.projectionAuthority !== "mongodb-rebuildable"
  ) {
    errors.push("recovery policy must preserve PostgreSQL authority and rebuildable MongoDB projection");
  }

  return errors;
}

export function computeSoulHash(soul: SoulFile): string {
  const errors = validateSoulFile(soul);
  if (errors.length > 0) {
    throw new Error(`Cannot hash invalid SoulFile: ${errors.join("; ")}`);
  }
  return sha256(stableJson(soul));
}

export function sealSoulFile(soul: SoulFile): SealedSoulFile {
  return { soul, soulHash: computeSoulHash(soul) };
}

export function verifySealedSoul(sealed: SealedSoulFile): boolean {
  try {
    return safeHashEqual(sealed.soulHash, computeSoulHash(sealed.soul));
  } catch {
    return false;
  }
}

export function bindSoulToRuntime(
  sealed: SealedSoulFile,
  runtime: { instanceId: string; modelProvider: string; modelName: string },
): SoulRuntimeBinding {
  if (!verifySealedSoul(sealed)) {
    throw new Error("Cannot instantiate an invalid or tampered SoulFile");
  }
  if (!nonEmpty(runtime.instanceId) || !nonEmpty(runtime.modelProvider) || !nonEmpty(runtime.modelName)) {
    throw new Error("Runtime binding fields must be non-empty");
  }

  return {
    instanceId: runtime.instanceId,
    soulId: sealed.soul.identity.soulId,
    soulHash: sealed.soulHash,
    modelProvider: runtime.modelProvider,
    modelName: runtime.modelName,
    memoryNamespace: sealed.soul.memory.namespace,
  };
}

function mutationReceipt(
  current: SealedSoulFile,
  request: SoulMutationRequest,
  code: SoulMutationDecisionCode,
  candidateSoulHash: string | null,
): SoulMutationReceipt {
  const attemptMaterial = [
    current.soulHash,
    request.actor.kind,
    request.actor.id,
    request.event.sourceRef,
    request.event.reason,
    candidateSoulHash ?? "invalid-candidate",
  ].join("|");

  return {
    schemaVersion: "project-jennifer.soul-mutation-receipt.v1",
    attemptId: sha256(attemptMaterial),
    decision: code === "ALLOW" ? "ALLOW" : "DENY",
    code,
    policyVersion: SOUL_POLICY_VERSION,
    actorKind: request.actor.kind,
    actorId: request.actor.id,
    operatorId: request.event.operatorId?.trim() || null,
    currentSoulHash: current.soulHash,
    candidateSoulHash,
    sourceRef: request.event.sourceRef,
    reasonDigest: sha256(request.event.reason),
  };
}

export function evaluateSoulMutation(
  current: SealedSoulFile,
  request: SoulMutationRequest,
): SoulMutationEvaluation {
  if (!verifySealedSoul(current)) {
    return { allowed: false, receipt: mutationReceipt(current, request, "INVALID_CURRENT_SOUL", null) };
  }

  const candidateErrors = validateSoulFile(request.candidateSoul);
  if (candidateErrors.length > 0) {
    return {
      allowed: false,
      receipt: mutationReceipt(current, request, "INVALID_CANDIDATE_SOUL", null),
    };
  }

  const candidate = sealSoulFile(request.candidateSoul);

  if (request.actor.kind !== "kpgs") {
    return {
      allowed: false,
      receipt: mutationReceipt(current, request, "SOUL_MUTATION_REQUIRES_KPGS", candidate.soulHash),
    };
  }
  if (!request.event.operatorApproved || !request.event.operatorId?.trim()) {
    return {
      allowed: false,
      receipt: mutationReceipt(current, request, "OPERATOR_APPROVAL_REQUIRED", candidate.soulHash),
    };
  }
  if (!safeHashEqual(request.event.expectedSoulHash, current.soulHash)) {
    return {
      allowed: false,
      receipt: mutationReceipt(current, request, "STALE_CANONICAL_HASH", candidate.soulHash),
    };
  }
  if (request.candidateSoul.identity.soulId !== current.soul.identity.soulId) {
    return {
      allowed: false,
      receipt: mutationReceipt(current, request, "SOUL_ID_IMMUTABLE", candidate.soulHash),
    };
  }
  if (request.candidateSoul.identity.namespace !== current.soul.identity.namespace) {
    return {
      allowed: false,
      receipt: mutationReceipt(current, request, "SOUL_NAMESPACE_IMMUTABLE", candidate.soulHash),
    };
  }
  if (request.candidateSoul.memory.namespace !== current.soul.memory.namespace) {
    return {
      allowed: false,
      receipt: mutationReceipt(current, request, "MEMORY_NAMESPACE_IMMUTABLE", candidate.soulHash),
    };
  }

  const changedInvariants = !invariantsEqual(request.candidateSoul.invariants, current.soul.invariants);
  if (changedInvariants && !request.event.allowInvariantEvolution) {
    return {
      allowed: false,
      receipt: mutationReceipt(
        current,
        request,
        "INVARIANT_EVOLUTION_NOT_AUTHORIZED",
        candidate.soulHash,
      ),
    };
  }
  if (changedInvariants && !request.event.invariantEvolutionReason?.trim()) {
    return {
      allowed: false,
      receipt: mutationReceipt(
        current,
        request,
        "INVARIANT_EVOLUTION_REASON_REQUIRED",
        candidate.soulHash,
      ),
    };
  }

  return {
    allowed: true,
    candidate,
    receipt: mutationReceipt(current, request, "ALLOW", candidate.soulHash),
  };
}

export function authorizeMemoryScope(input: {
  sourceSoul: SealedSoulFile;
  actorSoulId: string;
  targetNamespace: string;
  operation: "read" | "write";
}): MemoryScopeDecision {
  if (!verifySealedSoul(input.sourceSoul)) {
    return { allowed: false, code: "SOURCE_SOUL_MISMATCH" };
  }
  if (input.actorSoulId !== input.sourceSoul.soul.identity.soulId) {
    return { allowed: false, code: "SOURCE_SOUL_MISMATCH" };
  }
  if (!input.targetNamespace.startsWith("soul:") || !input.targetNamespace.endsWith(":memory")) {
    return { allowed: false, code: "TARGET_NAMESPACE_INVALID" };
  }

  const ownNamespace = input.sourceSoul.soul.memory.namespace;
  if (input.targetNamespace === ownNamespace) {
    return { allowed: true, code: "ALLOW" };
  }
  if (input.operation === "write") {
    return input.sourceSoul.soul.memory.allowCrossSoulWrite
      ? { allowed: true, code: "ALLOW" }
      : { allowed: false, code: "CROSS_SOUL_WRITE_DENIED" };
  }
  return input.sourceSoul.soul.memory.allowCrossSoulRead
    ? { allowed: true, code: "ALLOW" }
    : { allowed: false, code: "CROSS_SOUL_READ_DENIED" };
}

export function recoverLastKnownGoodSoul(canonical: SealedSoulFile): SealedSoulFile {
  if (!verifySealedSoul(canonical)) {
    throw new Error("Last-known-good SoulFile failed integrity verification");
  }
  return canonical;
}
