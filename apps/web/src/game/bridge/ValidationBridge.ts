import {
  ValidationPipeline,
  ConfidenceScorer,
  RealityVerifier,
} from "@jennifer/validation";
import type {
  ValidationReport,
  PolicyDecision,
  PolicyContext,
} from "@jennifer/validation";
import { generateId } from "@jennifer/shared";
import { GovernanceBridge } from "./GovernanceBridge";

export type { ValidationReport, PolicyDecision, PolicyContext };

/**
 * ValidationBridge – thin game-layer wrapper around the real
 * ValidationPipeline from @jennifer/validation.
 *
 * Wires together GovernanceBridge (policy), ConfidenceScorer, and
 * RealityVerifier.  The pipeline is configured with throwOnFailed: false so
 * results are always returned to the caller for display in
 * ValidationDemoScene.
 */
export class ValidationBridge {
  private readonly pipeline: ValidationPipeline;

  constructor(private readonly governance: GovernanceBridge) {
    this.pipeline = new ValidationPipeline(
      {
        policyEngine: {
          evaluate: (d: PolicyDecision, c: PolicyContext) => this.governance.evaluate(d, c),
        },
        confidenceScorer: new ConfidenceScorer(),
        realityChecker: new RealityVerifier(),
      },
      {
        minimumConfidence: 0.6,
        throwOnFailed: false,
      }
    );
  }

  /**
   * Run the three-stage validation pipeline for a game claim.
   * Always resolves (never throws) so ValidationDemoScene can display results.
   */
  async run(
    decision: PolicyDecision,
    context: PolicyContext
  ): Promise<ValidationReport> {
    return this.pipeline.run(decision, context);
  }

  /**
   * Build a POC (Proof of Concept) decision for the Memory District mission.
   * High confidence, low risk, required reality tags present in context.
   */
  static buildPocDecision(): PolicyDecision {
    return {
      id: generateId(),
      action: "validate-claim",
      resource: "memory-district.sentiment-signal",
      payload: {
        requiredRealityTags: ["sentiment-confirmed", "telemetry-verified"],
      },
    };
  }

  /**
   * Build a FOC (Failure of Concept) decision for the Memory District mission.
   * Low base confidence, high risk penalty, no reality tags present.
   */
  static buildFocDecision(): PolicyDecision {
    return {
      id: generateId(),
      action: "validate-claim",
      resource: "memory-district.sentiment-signal",
      payload: {
        requiredRealityTags: ["sentiment-confirmed", "telemetry-verified"],
      },
    };
  }

  /** POC context – all stages should pass. */
  static buildPocContext(persona: string): PolicyContext {
    return {
      actorId: persona,
      environment: "development" as const,
      baseConfidence: 0.85,
      riskScore: 0.1,
      // Required reality tags are present → reality check passes.
      tags: ["sentiment-confirmed", "telemetry-verified"],
    };
  }

  /** FOC context – fails at the confidence stage. */
  static buildFocContext(persona: string): PolicyContext {
    return {
      actorId: persona,
      environment: "development" as const,
      baseConfidence: 0.25,
      riskScore: 0.8,
      // No required reality tags → reality check would also fail, but
      // pipeline stops at confidence before reaching reality.
      tags: [],
    };
  }
}
