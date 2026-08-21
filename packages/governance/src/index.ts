export { PolicyEngine, PermissionManager } from "./policy-engine.js";
export type {
  PolicyDecision,
  PolicyContext,
  PolicyRule,
  PolicyResult,
  PolicyDecisionStatus,
  PolicyEngineConfig,
} from "./policy-engine.js";

export {
  SemanticContractRegistry,
  assertObjectiveWeightVector,
} from "./semantic-contracts.js";
export type {
  ContractValidationError,
  SemanticContract,
  ObjectiveWeightVector,
  JsonSchemaField,
} from "./semantic-contracts.js";

export {
  SOUL_FILE_SCHEMA_VERSION,
  SOUL_POLICY_VERSION,
  authorizeMemoryScope,
  bindSoulToRuntime,
  computeSoulHash,
  evaluateSoulMutation,
  expectedMemoryNamespace,
  expectedSoulNamespace,
  recoverLastKnownGoodSoul,
  sealSoulFile,
  validateSoulFile,
  verifySealedSoul,
} from "./soul-file.js";
export type {
  MemoryScopeDecision,
  SealedSoulFile,
  SoulActorKind,
  SoulEvolutionEvent,
  SoulFile,
  SoulIdentity,
  SoulInvariants,
  SoulMemoryPolicy,
  SoulMutationActor,
  SoulMutationDecisionCode,
  SoulMutationEvaluation,
  SoulMutationReceipt,
  SoulMutationRequest,
  SoulProvenance,
  SoulRecoveryPolicy,
  SoulRuntimeBinding,
} from "./soul-file.js";
