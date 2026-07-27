import type {
  ValidationResult,
  ValidationReport,
  ValidationStatus,
  ID,
} from "@jennifer/shared";
import { generateId, now, clamp } from "@jennifer/shared";

/**
 * A single validation rule. Rules are pure functions that examine
 * a payload and return a result.
 */
export interface ValidationRule<T = unknown> {
  id: string;
  name: string;
  description: string;
  validate(payload: T): Promise<ValidationResult> | ValidationResult;
}

/**
 * Orchestrates a chain of validation rules against an input payload.
 * Rules are executed in registration order. If `failFast` is true the
 * pipeline stops at the first failure.
 */
export class ValidationPipeline<T = unknown> {
  private rules: ValidationRule<T>[] = [];

  constructor(private readonly failFast: boolean = false) {}

  addRule(rule: ValidationRule<T>): this {
    this.rules.push(rule);
    return this;
  }

  removeRule(ruleId: string): this {
    this.rules = this.rules.filter((r) => r.id !== ruleId);
    return this;
  }

  async run(requestId: ID, payload: T): Promise<ValidationReport> {
    const results: ValidationResult[] = [];
    let overallStatus: ValidationStatus = "passed";

    for (const rule of this.rules) {
      const result = await rule.validate(payload);
      results.push(result);

      if (result.status === "failed") {
        overallStatus = "failed";
        if (this.failFast) break;
      } else if (result.status === "warning" && overallStatus === "passed") {
        overallStatus = "warning";
      }
    }

    const overallConfidence = this.calculateOverallConfidence(results);

    return {
      id: generateId(),
      requestId,
      status: overallStatus,
      results,
      overallConfidence,
      failedAt: overallStatus === "failed" ? now() : undefined,
      completedAt: now(),
    };
  }

  private calculateOverallConfidence(results: ValidationResult[]): number {
    if (results.length === 0) return 1.0;

    const avg =
      results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    return clamp(avg, 0, 1);
  }

  getRules(): ValidationRule<T>[] {
    return [...this.rules];
  }
}

/**
 * Scores the confidence of an AI-generated output based on multiple
 * signals: validation results, governance decisions, memory consistency.
 */
export class ConfidenceScorer {
  /**
   * Aggregates weighted confidence signals into a single score.
   *
   * @param signals - Array of [score, weight] tuples (score 0-1, weight relative)
   */
  aggregate(signals: Array<[score: number, weight: number]>): number {
    if (signals.length === 0) return 0;

    const totalWeight = signals.reduce((sum, [, w]) => sum + w, 0);
    if (totalWeight === 0) return 0;

    const weighted = signals.reduce(
      (sum, [score, weight]) => sum + clamp(score, 0, 1) * weight,
      0
    );

    return clamp(weighted / totalWeight, 0, 1);
  }

  /**
   * Computes a penalized confidence given base score and failure count.
   */
  penalize(baseScore: number, failureCount: number, penaltyPerFailure = 0.15): number {
    return clamp(baseScore - failureCount * penaltyPerFailure, 0, 1);
  }
}

/**
 * Verifies that an output is grounded in reality by comparing it
 * against known memory entries and telemetry signals. Returns a
 * reality score between 0 and 1.
 */
export class RealityVerifier {
  /**
   * Checks that all claimed facts exist in the provided evidence set.
   */
  verifyClaims(
    claims: string[],
    evidence: string[]
  ): { score: number; unverifiedClaims: string[] } {
    if (claims.length === 0) return { score: 1.0, unverifiedClaims: [] };

    const evidenceSet = new Set(evidence.map((e) => e.toLowerCase().trim()));
    const unverified = claims.filter(
      (c) => !evidenceSet.has(c.toLowerCase().trim())
    );

    const score = (claims.length - unverified.length) / claims.length;
    return { score: clamp(score, 0, 1), unverifiedClaims: unverified };
  }

  /**
   * Checks temporal consistency – whether timestamps are in valid order.
   */
  verifyTemporalConsistency(timestamps: number[]): boolean {
    for (let i = 1; i < timestamps.length; i++) {
      if ((timestamps[i] ?? 0) < (timestamps[i - 1] ?? 0)) return false;
    }
    return true;
  }
}

// ─── Built-in validation rules ────────────────────────────────────────────────

/**
 * Ensures a required field exists in the payload.
 */
export function requiredFieldRule(fieldName: string): ValidationRule<Record<string, unknown>> {
  return {
    id: `required:${fieldName}`,
    name: `Required: ${fieldName}`,
    description: `Ensures the field "${fieldName}" is present and non-null`,
    validate(payload) {
      const present = fieldName in payload && payload[fieldName] != null;
      return {
        id: generateId(),
        ruleId: `required:${fieldName}`,
        status: present ? "passed" : "failed",
        confidence: present ? 1.0 : 0.0,
        message: present
          ? `Field "${fieldName}" is present`
          : `Required field "${fieldName}" is missing or null`,
        details: { fieldName, value: payload[fieldName] },
        timestamp: now(),
      };
    },
  };
}

/**
 * Ensures a confidence score meets the minimum threshold.
 */
export function minConfidenceRule(threshold: number): ValidationRule<{ confidence: number }> {
  return {
    id: `min-confidence:${threshold}`,
    name: `Minimum confidence: ${threshold}`,
    description: `Ensures confidence ≥ ${threshold}`,
    validate(payload) {
      const passes = payload.confidence >= threshold;
      return {
        id: generateId(),
        ruleId: `min-confidence:${threshold}`,
        status: passes ? "passed" : "failed",
        confidence: clamp(payload.confidence / threshold, 0, 1),
        message: passes
          ? `Confidence ${payload.confidence} meets threshold ${threshold}`
          : `Confidence ${payload.confidence} is below threshold ${threshold}`,
        details: { threshold, actual: payload.confidence },
        timestamp: now(),
      };
    },
  };
}
