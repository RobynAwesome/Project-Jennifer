import type { Permission, PolicyEffect } from "@jennifer/shared";

export type PolicyDecisionStatus = "allow" | "deny" | "defer";

export interface PolicyDecision {
  id: string;
  action: string;
  resource?: string;
  payload?: Record<string, unknown>;
}

export interface PolicyContext {
  actorId?: string;
  environment?: "production" | "staging" | "development";
  riskScore?: number;
  tags?: string[];
  [key: string]: unknown;
}

export interface PolicyRule {
  id: string;
  name: string;
  priority: number;
  evaluate(decision: PolicyDecision, context: PolicyContext): PolicyDecisionStatus | undefined;
  reason:
    | string
    | ((decision: PolicyDecision, context: PolicyContext, result: PolicyDecisionStatus) => string);
}

export interface PolicyEngineConfig {
  rules?: PolicyRule[];
  defaultStatus?: PolicyDecisionStatus;
}

export interface PolicyResult {
  status: PolicyDecisionStatus;
  reasons: string[];
  matchedRuleIds: string[];
}

/**
 * Evaluates typed runtime policy rules from injected config.
 * No model calls; deterministic and testable.
 */
export class PolicyEngine {
  private rules = new Map<string, PolicyRule>();
  private readonly defaultStatus: PolicyDecisionStatus;

  constructor(config: PolicyEngineConfig | boolean = {}) {
    const normalizedConfig: PolicyEngineConfig =
      typeof config === "boolean"
        ? { defaultStatus: config ? "deny" : "defer" }
        : config;

    this.defaultStatus = normalizedConfig.defaultStatus ?? "defer";

    for (const rule of normalizedConfig.rules ?? []) {
      this.rules.set(rule.id, rule);
    }
  }

  registerPolicy(rule: PolicyRule): void {
    this.rules.set(rule.id, rule);
  }

  removePolicy(id: string): boolean {
    return this.rules.delete(id);
  }

  getPolicies(): PolicyRule[] {
    return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
  }

  evaluate(decision: PolicyDecision, context: PolicyContext): PolicyResult {
    const reasons: string[] = [];
    const matchedRuleIds: string[] = [];

    for (const rule of this.getPolicies()) {
      const status = rule.evaluate(decision, context);
      if (!status) continue;

      matchedRuleIds.push(rule.id);
      const reason =
        typeof rule.reason === "function"
          ? rule.reason(decision, context, status)
          : rule.reason;
      reasons.push(reason);

      return {
        status,
        reasons,
        matchedRuleIds,
      };
    }

    reasons.push(`No policy rule matched. Defaulting to ${this.defaultStatus}`);
    return {
      status: this.defaultStatus,
      reasons,
      matchedRuleIds,
    };
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

    const wildcard = this.permissions.get(this.key(subject, action, "*"));
    if (wildcard) return wildcard.effect;

    return "deny";
  }

  listPermissions(subject: string): Permission[] {
    return Array.from(this.permissions.values()).filter((p) => p.subject === subject);
  }
}
