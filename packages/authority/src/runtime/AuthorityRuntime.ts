import { generateId, now } from "@jennifer/shared";
import type { ConstitutionalRoleId, AuthorityPermission } from "../roles/RoleDefinition.js";
import type { AuthoritySemanticContract } from "../contracts/SemanticContract.js";
import type { AuthorityReceiptMetadata } from "../contracts/SemanticContract.js";
import { RoleRegistry } from "./RoleRegistry.js";
import { AuthorityGate } from "./AuthorityGate.js";
import type { AuthorityRequest, AuthorityDecision } from "./AuthorityGate.js";
import { ElevationFirewall } from "../enforcement/ElevationFirewall.js";
import type { ElevationCheckRequest } from "../enforcement/ElevationFirewall.js";

export interface AuthorityRuntimeOptions {
  /** Pre-configured registry; defaults to one seeded with SYSTEM_ROLES. */
  registry?: RoleRegistry;
}

/**
 * Orchestrates the full authority evaluation for a runtime request.
 *
 * Pipeline position: Intent → **Authority** → Governance → …
 *
 * Responsibilities:
 *  - Manage semantic contracts for participants.
 *  - Delegate gate checks to AuthorityGate.
 *  - Enforce elevation rules via ElevationFirewall.
 *  - Produce AuthorityReceiptMetadata attached to validation receipts.
 */
export class AuthorityRuntime {
  private readonly registry: RoleRegistry;
  private readonly gate: AuthorityGate;
  private readonly firewall: ElevationFirewall;

  /** Active semantic contracts keyed by participantId. */
  private readonly contracts: Map<string, AuthoritySemanticContract> = new Map();

  constructor(options: AuthorityRuntimeOptions = {}) {
    this.registry = options.registry ?? new RoleRegistry();
    this.gate = new AuthorityGate(this.registry);
    this.firewall = new ElevationFirewall(this.registry);
  }

  /**
   * Issues a semantic contract binding a participant to a constitutional role.
   *
   * Charter rule 11: Delegation may only be performed by an authorized authority.
   * Self-delegation is invalid and will be rejected.
   *
   * @param delegatorId  The participant performing the delegation (must hold `delegate:roles`).
   * @param participantId The participant receiving the role.
   * @param roleId        The constitutional role to assign.
   * @param expiresAt     Optional expiry timestamp.
   */
  issueContract(
    delegatorId: string,
    participantId: string,
    roleId: ConstitutionalRoleId,
    expiresAt?: number
  ): AuthoritySemanticContract {
    // Prevent self-delegation.
    const elevationCheck: ElevationCheckRequest = {
      requesterId: delegatorId,
      targetParticipantId: participantId,
      targetRoleId: roleId,
      currentContracts: Array.from(this.contracts.values()),
    };
    const elevationResult = this.firewall.check(elevationCheck);
    if (!elevationResult.permitted) {
      throw new Error(
        `Authority delegation denied: ${elevationResult.reason}`
      );
    }

    const contract: AuthoritySemanticContract = {
      id: generateId(),
      participantId,
      roleId,
      issuedAt: now(),
      expiresAt,
    };

    this.contracts.set(participantId, contract);
    return contract;
  }

  /**
   * Returns the active semantic contract for a participant, or undefined if
   * none exists or the contract has expired.
   */
  getContract(participantId: string): AuthoritySemanticContract | undefined {
    const contract = this.contracts.get(participantId);
    if (!contract) return undefined;
    if (contract.expiresAt !== undefined && now() > contract.expiresAt) {
      this.contracts.delete(participantId);
      return undefined;
    }
    return contract;
  }

  /**
   * Evaluates whether a participant may exercise a permission.
   *
   * The participant must have an active semantic contract.  The check is then
   * delegated to AuthorityGate.
   */
  authorize(
    participantId: string,
    permission: AuthorityPermission
  ): AuthorityDecision {
    const contract = this.getContract(participantId);
    if (!contract) {
      return {
        authorized: false,
        request: {
          participantId,
          roleId: "GovernanceArchitect", // role is irrelevant — contract absence is the rejection reason
          permission,
        },
        permissionCheck: {
          granted: false,
          permission,
          roleId: "GovernanceArchitect",
          reason: `Participant "${participantId}" has no active semantic contract. Authority denied.`,
        },
        decidedAt: Date.now(),
      };
    }

    const request: AuthorityRequest = {
      participantId,
      roleId: contract.roleId,
      permission,
    };

    return this.gate.evaluate(request);
  }

  /**
   * Builds the AuthorityReceiptMetadata to be embedded in a validation receipt.
   *
   * Charter rules 8–9: Validation produces receipts; receipts authorize execution.
   */
  buildReceiptMetadata(decision: AuthorityDecision): AuthorityReceiptMetadata {
    const role = this.registry.get(decision.request.roleId);
    return {
      authorizedRole: decision.request.roleId,
      authorityLevel: role?.authorityLevel ?? "standard",
      permissionGranted: decision.authorized,
      permissionSource: "role",
    };
  }
}
