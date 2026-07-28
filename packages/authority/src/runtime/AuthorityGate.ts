import type { ConstitutionalRoleId, AuthorityPermission } from "../roles/RoleDefinition.js";
import type { PermissionCheckResult } from "../contracts/PermissionContract.js";
import { RoleRegistry } from "./RoleRegistry.js";

export interface AuthorityRequest {
  /** Identity of the requesting participant (actor ID or label). */
  readonly participantId: string;

  /** The constitutional role the participant claims to operate under. */
  readonly roleId: ConstitutionalRoleId;

  /** The permission the participant is requesting. */
  readonly permission: AuthorityPermission;
}

export interface AuthorityDecision {
  /** Whether execution is authorized. */
  readonly authorized: boolean;

  /** The evaluated request. */
  readonly request: AuthorityRequest;

  /** Detailed permission check result. */
  readonly permissionCheck: PermissionCheckResult;

  /** Unix epoch ms of the decision. */
  readonly decidedAt: number;
}

/**
 * First constitutional gate inside the Jennifer Runtime.
 *
 * Every request must answer:
 *   1. Who requested this?
 *   2. Which constitutional role are they operating under?
 *   3. Does that role possess authority?
 *   4. Is the requested action permitted?
 *
 * If any answer fails, execution is rejected before reaching Governance.
 *
 * Charter rules 3, 5, 6: Authority belongs to the role; contracts define
 * permissions; permissions require governance.
 */
export class AuthorityGate {
  constructor(private readonly registry: RoleRegistry) {}

  /**
   * Evaluates whether the given request is authorized.
   *
   * Returns an `AuthorityDecision` with `authorized: false` on any failure —
   * it never throws for normal denial scenarios.
   */
  evaluate(request: AuthorityRequest): AuthorityDecision {
    const now = Date.now();
    const role = this.registry.get(request.roleId);

    if (!role) {
      return {
        authorized: false,
        request,
        permissionCheck: {
          granted: false,
          permission: request.permission,
          roleId: request.roleId,
          reason: `Role "${request.roleId}" is not a registered constitutional role.`,
        },
        decidedAt: now,
      };
    }

    // Prohibitions take precedence over grants.
    if ((role.prohibitions as ReadonlyArray<string>).includes(request.permission)) {
      return {
        authorized: false,
        request,
        permissionCheck: {
          granted: false,
          permission: request.permission,
          roleId: request.roleId,
          reason: `Role "${request.roleId}" is explicitly prohibited from exercising "${request.permission}".`,
        },
        decidedAt: now,
      };
    }

    if (!(role.permissions as ReadonlyArray<string>).includes(request.permission)) {
      return {
        authorized: false,
        request,
        permissionCheck: {
          granted: false,
          permission: request.permission,
          roleId: request.roleId,
          reason: `Role "${request.roleId}" does not hold permission "${request.permission}".`,
        },
        decidedAt: now,
      };
    }

    return {
      authorized: true,
      request,
      permissionCheck: {
        granted: true,
        permission: request.permission,
        roleId: request.roleId,
        reason: `Role "${request.roleId}" holds permission "${request.permission}".`,
      },
      decidedAt: now,
    };
  }
}
