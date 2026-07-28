import type { ConstitutionalRoleId, RoleDefinition } from "../roles/RoleDefinition.js";
import { SYSTEM_ROLES } from "../roles/SystemRoles.js";

/**
 * Immutable registry of constitutional roles.
 *
 * The runtime queries the registry rather than hardcoding permissions.
 * Charter rule 1: Roles are permanent — registrations cannot be removed.
 */
export class RoleRegistry {
  private readonly roles: ReadonlyMap<ConstitutionalRoleId, RoleDefinition>;

  constructor() {
    const map = new Map<ConstitutionalRoleId, RoleDefinition>();
    for (const role of SYSTEM_ROLES) {
      map.set(role.id, role);
    }
    this.roles = map;
  }

  /**
   * Returns the definition for the given role ID, or undefined if the role is
   * not registered.
   */
  get(id: ConstitutionalRoleId): RoleDefinition | undefined {
    return this.roles.get(id);
  }

  /**
   * Returns all registered role definitions.
   */
  list(): ReadonlyArray<RoleDefinition> {
    return Array.from(this.roles.values());
  }

  /**
   * Returns true when the given role ID is registered.
   */
  has(id: ConstitutionalRoleId): boolean {
    return this.roles.has(id);
  }
}
