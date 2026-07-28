import type { ConstitutionalRoleId, AuthorityLevel, PermissionSource } from "../roles/RoleDefinition.js";

/**
 * Authority metadata attached to a validation receipt (ValidationReport).
 *
 * Charter rule 8: Validation produces receipts.
 * Charter rule 9: Receipts authorize execution.
 */
export interface AuthorityReceiptMetadata {
  /** The constitutional role that authorized this execution. */
  readonly authorizedRole: ConstitutionalRoleId;

  /** Relative authority level of the authorizing role. */
  readonly authorityLevel: AuthorityLevel;

  /** Whether the requested permission was granted. */
  readonly permissionGranted: boolean;

  /** How the permission was obtained. */
  readonly permissionSource: PermissionSource;
}

/**
 * A semantic contract binding a participant to a constitutional role for the
 * duration of a single authority evaluation.
 *
 * Charter rule 4: Roles operate through semantic contracts.
 */
export interface AuthoritySemanticContract {
  /** Unique identifier for this contract instance. */
  readonly id: string;

  /** The participant (actor) bound by this contract. */
  readonly participantId: string;

  /** The constitutional role the participant is operating under. */
  readonly roleId: ConstitutionalRoleId;

  /** Unix epoch ms when this contract was issued. */
  readonly issuedAt: number;

  /** Optional expiry — undefined means the contract never expires. */
  readonly expiresAt?: number;
}
