import { clamp } from "@jennifer/shared";

import type { FOCRiskProfile } from "./FOCRiskProfile.js";
import type { POCProfile } from "./POCProfile.js";
import type { SubjectEvaluator, SubjectEvaluationInput } from "../ceep/SubjectEvaluator.js";

export class POCvsFOCEvaluator implements SubjectEvaluator {
  readonly name = "POCvsFOC";

  evaluate(input: SubjectEvaluationInput): POCProfile {
    const risks = this.buildFOCRisks(input);
    const riskPenalty = risks.reduce((total, risk) => total + risk.riskScore, 0) / (risks.length * 10);

    const baseScore = clamp(1 - riskPenalty, 0, 1);
    const pocScore = Number(baseScore.toFixed(2));

    const strengths = [
      `Purpose alignment: ${input.framework.purpose}`,
      `Contract coverage: ${input.framework.contracts.length} contracts declared`,
      `Receipt interoperability: consumes ${input.framework.receiptsConsumed.length} and produces ${input.framework.receiptsProduced.length}`,
    ];

    const highRisks = risks.filter((risk) => risk.riskScore >= 7).map((risk) => risk.category);
    const recommendations =
      highRisks.length === 0
        ? ["Continue structured validation while retaining conceptual safeguards."]
        : [
            `Mitigate high-risk FOC categories first: ${highRisks.join(", ")}`,
            "Increase evidence quality and cross-framework validation before canonicalization.",
          ];

    return {
      pocScore,
      strengths,
      focRisks: risks,
      recommendations,
    };
  }

  private buildFOCRisks(input: SubjectEvaluationInput): FOCRiskProfile[] {
    const signals = [
      input.framework.dependencies.length,
      input.framework.implementations.length,
      input.evaluationRules.length,
      input.supportingReceipts.length,
    ];

    const saturation = Math.max(...signals, 1);

    const categories: Array<{ category: FOCRiskProfile["category"]; weight: number; rationale: string }> = [
      { category: "FakeOfConcept", weight: 4, rationale: "Claims are not sufficiently tied to verifiable evidence." },
      { category: "FreedomOfConcept", weight: 5, rationale: "Concept drifts without constitutional constraint." },
      { category: "FabricationOfConcept", weight: 3, rationale: "Abstractions may overstate implementation readiness." },
      { category: "FailureOfConcept", weight: 4, rationale: "Concept may fail when operationalized." },
      { category: "FrameworkOfConcept", weight: 2, rationale: "Framework boundaries are still maturing." },
      { category: "FractionOfConcept", weight: 3, rationale: "Only partial conceptual coverage is evidenced." },
      { category: "FallacyOfConcept", weight: 4, rationale: "Reasoning assumptions need stronger challenge." },
      { category: "FringementOfConcept", weight: 2, rationale: "Concept edges may overlap neighboring frameworks." },
      { category: "FrictionOfConcept", weight: 4, rationale: "Adoption complexity can slow constitutional convergence." },
      { category: "FragmentationOfConcept", weight: 5, rationale: "Inconsistent implementations can fragment intent." },
      { category: "FinancialOfConcept", weight: 3, rationale: "Cost signals may not be captured in conceptual framing." },
      { category: "FragilityOfConcept", weight: 4, rationale: "Concept may be brittle under stress conditions." },
      { category: "FandomOfConcept", weight: 3, rationale: "Bias toward novelty can overtake evidence discipline." },
    ];

    return categories.map((item, index) => {
      const signal = (signals[index % signals.length] ?? 0) / saturation;
      const score = clamp(Math.round(item.weight + signal * 5), 1, 10);
      return {
        category: item.category,
        riskScore: score,
        rationale: item.rationale,
      };
    });
  }
}
