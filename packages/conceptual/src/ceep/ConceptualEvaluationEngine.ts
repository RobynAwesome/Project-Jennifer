import { generateId, now } from "@jennifer/shared";

import type { EvaluationReceipt } from "./EvaluationReceipt.js";
import type { SubjectEvaluator } from "./SubjectEvaluator.js";
import type { FrameworkDefinition } from "../registry/FrameworkDefinition.js";
import type { FrameworkEvolutionReceipt } from "../receipts/FrameworkEvolutionReceipt.js";

export interface ConceptualEvaluationInput {
  subject: string;
  framework: FrameworkDefinition;
  supportingReceipts: string[];
  evaluationRules: string[];
  contributor: string;
  proposalId?: string;
  evidenceLevel?: string;
  discussionHistory?: string[];
}

export interface ConceptualEvaluationResult {
  evaluationReceipt: EvaluationReceipt;
  frameworkEvolutionReceipt: FrameworkEvolutionReceipt;
}

export class ConceptualEvaluationEngine {
  constructor(private readonly evaluators: SubjectEvaluator[]) {
    if (evaluators.length === 0) {
      throw new Error("ConceptualEvaluationEngine requires at least one evaluator");
    }
  }

  evaluate(input: ConceptualEvaluationInput): ConceptualEvaluationResult {
    const evaluator = this.evaluators[0];
    if (!evaluator) {
      throw new Error("ConceptualEvaluationEngine requires at least one evaluator");
    }
    const result = evaluator.evaluate({
      subject: input.subject,
      framework: input.framework,
      supportingReceipts: input.supportingReceipts,
      evaluationRules: input.evaluationRules,
    });

    const evaluationReceipt: EvaluationReceipt = {
      receiptId: generateId(),
      timestamp: now(),
      framework: input.framework.frameworkName,
      subject: input.subject,
      evaluator: evaluator.name,
      validation: result.pocScore >= 0.6 ? "PASS" : "FAIL",
      pocScore: result.pocScore,
      strengths: result.strengths,
      focRisks: result.focRisks,
      recommendations: result.recommendations,
      supportingReceipts: input.supportingReceipts,
      rulesApplied: input.evaluationRules,
    };

    const frameworkEvolutionReceipt: FrameworkEvolutionReceipt = {
      framework: input.framework.frameworkName,
      proposalId: input.proposalId ?? generateId(),
      subject: input.subject,
      contributor: input.contributor,
      evaluator: evaluator.name,
      discussionHistory: input.discussionHistory ?? [],
      evidenceLevel: input.evidenceLevel ?? "medium",
      validation: evaluationReceipt.validation,
      ccpDecision: evaluationReceipt.validation === "PASS" ? "Refine" : "Rejected",
      canonical: false,
      receiptId: generateId(),
      timestamp: now(),
    };

    return {
      evaluationReceipt,
      frameworkEvolutionReceipt,
    };
  }
}
