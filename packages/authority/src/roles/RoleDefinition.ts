/**
 * Core type definitions for constitutional roles within the Jennifer Runtime.
 *
 * Authority belongs to the role, never the participant.
 * Roles are permanent; models are replaceable.
 */

/** All constitutional role identifiers in the Jennifer Runtime. */
export type ConstitutionalRoleId =
  | "GovernanceArchitect"
  | "CodeExecutor"
  | "VisualCreator"
  | "ValidationAgent"
  | "MemoryAgent"
  | "HumanStrategicAuthority";

/** A named permission that a role may exercise. */
export type AuthorityPermission =
  | "define:policies"
  | "define:contracts"
  | "modify:source"
  | "execute:builds"
  | "implement:contracts"
  | "produce:images"
  | "produce:media"
  | "generate:assets"
  | "evaluate:evidence"
  | "produce:receipts"
  | "persist:state"
  | "approve:strategy"
  | "sign-off:execution"
  | "delegate:roles";

/** Relative authority level used for firewall elevation checks. */
export type AuthorityLevel = "standard" | "elevated" | "sovereign";

/** The source that granted a particular permission. */
export type PermissionSource = "role" | "delegation" | "sovereign";

/**
 * Full definition of a constitutional role.
 */
export interface RoleDefinition {
  /** Stable identifier — permanent across model replacements. */
  readonly id: ConstitutionalRoleId;

  /** Human-readable display name. */
  readonly displayName: string;

  /** Permissions this role is explicitly authorized to exercise. */
  readonly permissions: ReadonlyArray<AuthorityPermission>;

  /**
   * Permissions this role is explicitly prohibited from exercising.
   * Prohibitions take precedence over grants.
   */
  readonly prohibitions: ReadonlyArray<AuthorityPermission>;

  /** Relative authority level for elevation-firewall comparisons. */
  readonly authorityLevel: AuthorityLevel;
}
