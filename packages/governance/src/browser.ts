/**
 * Browser-safe Project Jennifer governance surface.
 *
 * Node-only canonical integrity primitives such as SoulFile SHA-256 sealing
 * stay out of client bundles. Browser consumers may evaluate policy and
 * semantic contracts, but they do not receive Soul mutation authority.
 */

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
