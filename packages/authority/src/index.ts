// ─── Roles ────────────────────────────────────────────────────────────────────
export type {
  ConstitutionalRoleId,
  AuthorityPermission,
  AuthorityLevel,
  PermissionSource,
  RoleDefinition,
} from "./roles/RoleDefinition.js";

export { SYSTEM_ROLES } from "./roles/SystemRoles.js";

// ─── Contracts ────────────────────────────────────────────────────────────────
export type {
  PermissionContract,
  PermissionCheckResult,
} from "./contracts/PermissionContract.js";

export type {
  AuthorityReceiptMetadata,
  AuthoritySemanticContract,
} from "./contracts/SemanticContract.js";

// ─── Runtime ──────────────────────────────────────────────────────────────────
export { RoleRegistry } from "./runtime/RoleRegistry.js";

export { AuthorityGate } from "./runtime/AuthorityGate.js";
export type { AuthorityRequest, AuthorityDecision } from "./runtime/AuthorityGate.js";

export { AuthorityRuntime } from "./runtime/AuthorityRuntime.js";
export type { AuthorityRuntimeOptions } from "./runtime/AuthorityRuntime.js";

// ─── Enforcement ──────────────────────────────────────────────────────────────
export { ElevationFirewall } from "./enforcement/ElevationFirewall.js";
export type {
  ElevationCheckRequest,
  ElevationCheckResult,
} from "./enforcement/ElevationFirewall.js";
