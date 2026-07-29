import type { ConstitutionalRoleId, AuthorityLevel } from "../roles/RoleDefinition.js";
import type { AuthoritySemanticContract } from "../contracts/SemanticContract.js";
import type { RoleRegistry } from "../runtime/RoleRegistry.js";

export interface ElevationCheckRequest {
  /** The participant requesting to delegate or elevate. */
  readonly requesterId: string;

  /** The participant whose role is being assigned. */
  readonly targetParticipantId: string;

  /** The role to be assigned to the target. */
  readonly targetRoleId: ConstitutionalRoleId;

  /** All currently active contracts — used to resolve the requester's role. */
  readonly currentContracts: ReadonlyArray<AuthoritySemanticContract>;
}

export interface ElevationCheckResult {
  /** Whether the elevation / delegation is permitted. */
  readonly permitted: boolean;

  /** Human-readable explanation. */
  readonly reason: string;

  /** Classification of the denial type, if denied. */
  readonly denialType?: "self-delegation" | "privilege-escalation" | "unauthorized-delegation";
}

/**
 * Constitutional firewall that prevents any participant from increasing or
 * granting its own authority.
 *
 * Charter rule 11: Authority may only be delegated by an authorized authority.
 *                  Self-delegation is invalid.
 *
 * Detects and rejects:
 *  - Self role promotion (requester === target).
 *  - Privilege escalation (delegating a role at or above the requester's level).
 *  - Unauthorized delegation (requester does not hold `delegate:roles`).
 */
export class ElevationFirewall {
  private static readonly AUTHORITY_ORDER: ReadonlyMap<AuthorityLevel, number> = new Map([
    ["standard", 0],
    ["elevated", 1],
    ["sovereign", 2],
  ]);

  constructor(private readonly registry: RoleRegistry) {}

  check(request: ElevationCheckRequest): ElevationCheckResult {
    // Rule 1: Self-delegation is unconditionally invalid.
    if (request.requesterId === request.targetParticipantId) {
      return {
        permitted: false,
        reason: `Participant "${request.requesterId}" cannot delegate a role to itself. Self-delegation is invalid.`,
        denialType: "self-delegation",
      };
    }

    // Resolve the requester's current role from active contracts.
    const requesterContract = request.currentContracts.find(
      (c) => c.participantId === request.requesterId
    );

    if (!requesterContract) {
      return {
        permitted: false,
        reason: `Participant "${request.requesterId}" has no active semantic contract and cannot perform delegation.`,
        denialType: "unauthorized-delegation",
      };
    }

    const requesterRole = this.registry.get(requesterContract.roleId);
    if (!requesterRole) {
      return {
        permitted: false,
        reason: `Requester role "${requesterContract.roleId}" is not registered. Delegation denied.`,
        denialType: "unauthorized-delegation",
      };
    }

    // Rule 2: Requester must hold the `delegate:roles` permission.
    if (!(requesterRole.permissions as ReadonlyArray<string>).includes("delegate:roles")) {
      return {
        permitted: false,
        reason: `Role "${requesterRole.id}" does not hold the "delegate:roles" permission. Delegation denied.`,
        denialType: "unauthorized-delegation",
      };
    }

    // Rule 3: A participant may not escalate another to a level equal or higher
    //         than their own (only sovereign may grant sovereign).
    const targetRole = this.registry.get(request.targetRoleId);
    if (!targetRole) {
      return {
        permitted: false,
        reason: `Target role "${request.targetRoleId}" is not a registered constitutional role.`,
        denialType: "unauthorized-delegation",
      };
    }

    const requesterLevel = ElevationFirewall.AUTHORITY_ORDER.get(requesterRole.authorityLevel) ?? 0;
    const targetLevel = ElevationFirewall.AUTHORITY_ORDER.get(targetRole.authorityLevel) ?? 0;

    if (targetLevel >= requesterLevel && requesterRole.authorityLevel !== "sovereign") {
      return {
        permitted: false,
        reason: `Role "${requesterRole.id}" (level: ${requesterRole.authorityLevel}) cannot delegate role "${targetRole.id}" (level: ${targetRole.authorityLevel}). Privilege escalation denied.`,
        denialType: "privilege-escalation",
      };
    }

    return {
      permitted: true,
      reason: `Role "${requesterRole.id}" is authorized to delegate role "${targetRole.id}".`,
    };
  }
}
