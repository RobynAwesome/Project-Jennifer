import type {
  Policy,
  Permission,
  PolicyEffect,
  GovernanceDecision,
  ID,
} from "@jennifer/shared";
import { generateId, now } from "@jennifer/shared";

/**
 * Evaluates a set of policies against a request context and returns
 * the governing effect (allow / deny / escalate).
 *
 * Policies are evaluated in priority order (highest first). The first
 * matching policy wins (explicit deny-first variant can be configured
 * via `denyFirst`).
 */
export class PolicyEngine {
  private policies: Map<ID, Policy> = new Map();

  constructor(private readonly denyFirst: boolean = false) {}

  registerPolicy(policy: Policy): void {
    this.policies.set(policy.id, policy);
  }

  removePolicy(id: ID): boolean {
    return this.policies.delete(id);
  }

  getPolicies(): Policy[] {
    return Array.from(this.policies.values()).sort(
      (a, b) => b.priority - a.priority
    );
  }

  /**
   * Evaluates all registered policies against the provided context and
   * returns the first matching governance decision.
   */
  evaluate(
    requestId: ID,
    context: Record<string, unknown>
  ): GovernanceDecision {
    const sorted = this.getPolicies();

    // If denyFirst, check deny policies before allowing.
    const ordered = this.denyFirst
      ? [
          ...sorted.filter((p) => p.effect === "deny"),
          ...sorted.filter((p) => p.effect !== "deny"),
        ]
      : sorted;

    for (const policy of ordered) {
      if (this.matchesConditions(policy.conditions, context)) {
        return {
          id: generateId(),
          requestId,
          policyId: policy.id,
          effect: policy.effect,
          reasoning: `Policy "${policy.name}" matched with effect "${policy.effect}"`,
          confidence: 1.0,
          timestamp: now(),
        };
      }
    }

    // Default: deny if no policy matches (secure by default)
    return {
      id: generateId(),
      requestId,
      policyId: "default-deny",
      effect: "deny",
      reasoning: "No matching policy found – defaulting to deny",
      confidence: 1.0,
      timestamp: now(),
    };
  }

  /**
   * Checks whether all conditions are satisfied by the context.
   * Supports simple key-value equality checks.
   */
  private matchesConditions(
    conditions: Record<string, unknown>,
    context: Record<string, unknown>
  ): boolean {
    return Object.entries(conditions).every(
      ([key, value]) => context[key] === value
    );
  }
}

/**
 * Manages subject → resource permissions.
 */
export class PermissionManager {
  private permissions: Map<string, Permission> = new Map();

  private key(subject: string, action: string, resource: string): string {
    return `${subject}:${action}:${resource}`;
  }

  grant(permission: Permission): void {
    const k = this.key(permission.subject, permission.action, permission.resource);
    this.permissions.set(k, permission);
  }

  revoke(subject: string, action: string, resource: string): boolean {
    return this.permissions.delete(this.key(subject, action, resource));
  }

  check(subject: string, action: string, resource: string): PolicyEffect {
    const direct = this.permissions.get(this.key(subject, action, resource));
    if (direct) return direct.effect;

    // Wildcard resource check
    const wildcard = this.permissions.get(this.key(subject, action, "*"));
    if (wildcard) return wildcard.effect;

    return "deny";
  }

  listPermissions(subject: string): Permission[] {
    return Array.from(this.permissions.values()).filter(
      (p) => p.subject === subject
    );
  }
}
