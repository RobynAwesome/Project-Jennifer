import type { ConstitutionalRoleId, AuthorityPermission, AuthorityLevel, PermissionSource } from "../roles/RoleDefinition.js";

/**
 * Describes a resolved permission that has been granted to a role.
 */
export interface PermissionContract {
  /** The role that holds this permission. */
  readonly roleId: ConstitutionalRoleId;

  /** The permission being exercised. */
  readonly permission: AuthorityPermission;

  /** How this permission was obtained. */
  readonly source: PermissionSource;

  /** Authority level of the granting role at grant time. */
  readonly grantedByLevel: AuthorityLevel;

  /** Unix epoch ms when the permission was recorded. */
  readonly grantedAt: number;
}

/**
 * Result of a permission-check operation performed by the AuthorityGate.
 */
export interface PermissionCheckResult {
  /** Whether the permission is granted. */
  readonly granted: boolean;

  /** The evaluated permission. */
  readonly permission: AuthorityPermission;

  /** Role under which the check was performed. */
  readonly roleId: ConstitutionalRoleId;

  /** Human-readable explanation of why permission was granted or denied. */
  readonly reason: string;
}
