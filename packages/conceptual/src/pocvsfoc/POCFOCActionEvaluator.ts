import type { POCFOCActionEvaluation } from "@jennifer/shared";

import type { SubjectEvaluationInput } from "../ceep/SubjectEvaluator.js";
import { POCvsFOCEvaluator } from "./POCvsFOCEvaluator.js";
import type { VOCRegistry } from "./VOCRegistry.js";
import { VOCRegistryParser } from "./VOCRegistryParser.js";

export interface POCFOCActionEvaluatorPolicy {
  minimumPOCScore: number;
  rejectOnOperationalFOCMatch: boolean;
}

export interface POCFOCActionEvaluationInput extends SubjectEvaluationInput {
  observedFOCSignals?: string[];
}

const DEFAULT_POLICY: POCFOCActionEvaluatorPolicy = {
  minimumPOCScore: 0.5,
  rejectOnOperationalFOCMatch: true,
};

/**
 * Converts Project Jennifer conceptual risk scoring plus the parsed KPGS VOC
 * immune registry into a runtime-facing decision contract.
 *
 * The evaluator does not mutate runtime state and does not issue memory
 * receipts. It only classifies the proposed action. Runtime execution remains
 * a separate governed boundary.
 */
export class POCFOCActionEvaluator {
  private readonly parser = new VOCRegistryParser();
  private readonly evaluator = new POCvsFOCEvaluator();
  private readonly policy: POCFOCActionEvaluatorPolicy;

  constructor(
    private readonly registry: VOCRegistry,
    policy: Partial<POCFOCActionEvaluatorPolicy> = {},
  ) {
    this.policy = { ...DEFAULT_POLICY, ...policy };
  }

  evaluate(input: POCFOCActionEvaluationInput): POCFOCActionEvaluation {
    const pocProfile = this.evaluator.evaluate(input);
    const matched = new Map<string, (typeof this.registry.foc.groups)[number]>();

    for (const signal of input.observedFOCSignals ?? []) {
      for (const group of this.parser.matchFOCGroups(signal, this.registry)) {
        matched.set(group.groupId, group);
      }
    }

    const matchedFOCGroups = [...matched.values()].map((group) => ({ ...group }));
    const reasons: string[] = [];
    let decision: POCFOCActionEvaluation["decision"] = "ACCEPT";

    if (
      this.policy.rejectOnOperationalFOCMatch &&
      matchedFOCGroups.length > 0
    ) {
      decision = "REJECT";
      reasons.push(
        `Operational FOC match: ${matchedFOCGroups
          .map((group) => `${group.groupId} ${group.designation}`)
          .join(", ")}`,
      );
    } else if (pocProfile.pocScore < this.policy.minimumPOCScore) {
      decision = "HOLD";
      reasons.push(
        `POC score ${pocProfile.pocScore.toFixed(2)} is below runtime threshold ${this.policy.minimumPOCScore.toFixed(2)}.`,
      );
    } else {
      reasons.push("Conceptual POC/FOC checks passed.");
    }

    return {
      decision,
      pocScore: pocProfile.pocScore,
      reasons,
      matchedFOCGroups,
      sourceAuthority: this.registry.source.authorityOrigin,
      sourceRef: this.registry.source.sourceRef,
    };
  }
}
