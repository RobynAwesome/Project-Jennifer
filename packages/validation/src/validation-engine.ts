import { generateId, now, clamp } from "@jennifer/shared";

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
  baseConfidence?: number;
  [key: string]: unknown;
}

export interface PolicyResult {
  status: "allow" | "deny" | "defer";
  reasons: string[];
  matchedRuleIds: string[];
}

export type ValidationReportStatus = "PASSED" | "FAILED" | "DEFERRED";

export interface ValidationFailedPayload {
  stage: "policy" | "confidence" | "reality";
  reasons: string[];
  policyResult?: PolicyResult;
  confidenceScore?: number;
  confidenceThreshold?: number;
  realityMismatches?: string[];
}

export interface ValidationStageResult {
  id: string;
  stage: "policy" | "confidence" | "reality";
  status: ValidationReportStatus;
  reasons: string[];
  details: Record<string, unknown>;
  timestamp: number;
}

export interface ValidationReport {
  id: string;
  decisionId: string;
  status: ValidationReportStatus;
  confidenceScore: number;
  stages: ValidationStageResult[];
  failed?: ValidationFailedPayload;
  completedAt: number;
}

export interface ConfidenceScoringInput {
  decision: PolicyDecision;
  context: PolicyContext;
  policyResult: PolicyResult;
}

export interface RealityCheckInput {
  decision: PolicyDecision;
  context: PolicyContext;
  policyResult: PolicyResult;
  confidenceScore: number;
}

export interface RealityCheckResult {
  passed: boolean;
  reasons: string[];
  mismatches?: string[];
}

export interface ValidationPipelineDependencies {
  policyEngine: {
    evaluate(decision: PolicyDecision, context: PolicyContext): PolicyResult;
  };
  confidenceScorer: {
    score(input: ConfidenceScoringInput): number;
  };
  realityChecker: {
    crossCheck(input: RealityCheckInput): RealityCheckResult;
  };
}

export interface ValidationPipelineOptions {
  minimumConfidence?: number;
  throwOnFailed?: boolean;
}

export class ValidationFailureError extends Error {
  constructor(public readonly report: ValidationReport) {
    super(
      `Validation FAILED at stage "${report.failed?.stage ?? "unknown"}" and downstream action is blocked`
    );
    this.name = "ValidationFailureError";
  }
}

/**
 * Governance-first pipeline:
 * 1) policy check
 * 2) confidence scoring
 * 3) reality/telemetry cross-check
 */
export class ValidationPipeline {
  private readonly minimumConfidence: number;
  private readonly throwOnFailed: boolean;

  constructor(
    private readonly dependencies: ValidationPipelineDependencies,
    options: ValidationPipelineOptions = {}
  ) {
    this.minimumConfidence = options.minimumConfidence ?? 0.6;
    this.throwOnFailed = options.throwOnFailed ?? true;
  }

  async run(
    decision: PolicyDecision,
    context: PolicyContext,
    downstreamAction?: () => Promise<void> | void
  ): Promise<ValidationReport> {
    const stages: ValidationStageResult[] = [];

    const policyResult = this.dependencies.policyEngine.evaluate(decision, context);
    const policyStatus: ValidationReportStatus =
      policyResult.status === "allow"
        ? "PASSED"
        : policyResult.status === "defer"
          ? "DEFERRED"
          : "FAILED";

    stages.push({
      id: generateId(),
      stage: "policy",
      status: policyStatus,
      reasons: policyResult.reasons,
      details: { matchedRuleIds: policyResult.matchedRuleIds },
      timestamp: now(),
    });

    if (policyStatus !== "PASSED") {
      return this.finalizeBlocked(decision.id, policyStatus, stages, {
        stage: "policy",
        reasons: policyResult.reasons,
        policyResult,
      });
    }

    const confidenceScore = clamp(
      this.dependencies.confidenceScorer.score({ decision, context, policyResult }),
      0,
      1
    );

    const confidencePassed = confidenceScore >= this.minimumConfidence;
    stages.push({
      id: generateId(),
      stage: "confidence",
      status: confidencePassed ? "PASSED" : "FAILED",
      reasons: confidencePassed
        ? [`Confidence score ${confidenceScore} meets threshold ${this.minimumConfidence}`]
        : [`Confidence score ${confidenceScore} is below threshold ${this.minimumConfidence}`],
      details: {
        confidenceScore,
        minimumConfidence: this.minimumConfidence,
      },
      timestamp: now(),
    });

    if (!confidencePassed) {
      return this.finalizeBlocked(decision.id, "FAILED", stages, {
        stage: "confidence",
        reasons: ["Confidence threshold not met"],
        policyResult,
        confidenceScore,
        confidenceThreshold: this.minimumConfidence,
      });
    }

    const realityCheck = this.dependencies.realityChecker.crossCheck({
      decision,
      context,
      policyResult,
      confidenceScore,
    });

    stages.push({
      id: generateId(),
      stage: "reality",
      status: realityCheck.passed ? "PASSED" : "FAILED",
      reasons: realityCheck.reasons,
      details: {
        mismatches: realityCheck.mismatches ?? [],
      },
      timestamp: now(),
    });

    if (!realityCheck.passed) {
      return this.finalizeBlocked(decision.id, "FAILED", stages, {
        stage: "reality",
        reasons: realityCheck.reasons,
        policyResult,
        confidenceScore,
        realityMismatches: realityCheck.mismatches ?? [],
      });
    }

    if (downstreamAction) {
      await downstreamAction();
    }

    return {
      id: generateId(),
      decisionId: decision.id,
      status: "PASSED",
      confidenceScore,
      stages,
      completedAt: now(),
    };
  }

  private finalizeBlocked(
    decisionId: string,
    status: Extract<ValidationReportStatus, "FAILED" | "DEFERRED">,
    stages: ValidationStageResult[],
    failed: ValidationFailedPayload
  ): ValidationReport {
    const report: ValidationReport = {
      id: generateId(),
      decisionId,
      status,
      confidenceScore: 0,
      stages,
      failed,
      completedAt: now(),
    };

    if (status === "FAILED" && this.throwOnFailed) {
      throw new ValidationFailureError(report);
    }

    return report;
  }
}

export class ConfidenceScorer {
  score(input: ConfidenceScoringInput): number {
    const base = Number(input.context.baseConfidence ?? 0.5);
    const riskPenalty = clamp(Number(input.context.riskScore ?? 0) * 0.5, 0, 0.5);
    return clamp(base - riskPenalty, 0, 1);
  }
}

export class RealityVerifier {
  crossCheck(input: RealityCheckInput): RealityCheckResult {
    const observedTags = new Set((input.context.tags as string[] | undefined) ?? []);
    const requiredTags = (input.decision.payload?.requiredRealityTags as string[] | undefined) ?? [];
    const mismatches = requiredTags.filter((tag) => !observedTags.has(tag));

    if (mismatches.length > 0) {
      return {
        passed: false,
        reasons: ["Reality check failed: required telemetry tags were not observed"],
        mismatches,
      };
    }

    return {
      passed: true,
      reasons: ["Reality check passed"],
    };
  }
}
