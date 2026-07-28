import { PolicyEngine } from "@jennifer/governance";
import type {
  PolicyDecision,
  PolicyContext,
  PolicyResult,
  PolicyRule,
} from "@jennifer/governance";

export type { PolicyDecision, PolicyContext, PolicyResult };

/**
 * GovernanceBridge – thin game-layer wrapper around the real PolicyEngine
 * from @jennifer/governance.
 *
 * Registers the Memory District claim-validation policy and exposes a single
 * `evaluate()` method consumed by ValidationBridge.
 */
export class GovernanceBridge {
  private readonly engine: PolicyEngine;

  constructor() {
    const memoryDistrictRule: PolicyRule = {
      id: "memory-district.claim-validation",
      name: "Memory District Claim Validation Policy",
      priority: 10,
      evaluate(decision: PolicyDecision, context: PolicyContext) {
        if (decision.action !== "validate-claim") return undefined;

        // Block only extreme risk (> 0.9) – untrusted / fabricated source.
        if (Number(context.riskScore ?? 0) > 0.9) return "deny";

        return "allow";
      },
      reason(
        _decision: PolicyDecision,
        context: PolicyContext,
        result: "allow" | "deny" | "defer"
      ) {
        if (result === "allow") {
          return `Claim validation allowed for actor "${context.actorId ?? "unknown"}" (risk ${context.riskScore ?? 0})`;
        }
        return `Claim rejected: extreme risk score ${context.riskScore} exceeds threshold 0.9`;
      },
    };

    this.engine = new PolicyEngine({
      defaultStatus: "defer",
      rules: [memoryDistrictRule],
    });
  }

  evaluate(
    decision: PolicyDecision,
    context: PolicyContext
  ): PolicyResult {
    return this.engine.evaluate(decision, context);
  }
}
