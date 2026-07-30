import type { FrameworkDefinition } from "../registry/FrameworkDefinition.js";
import type { POCProfile } from "../pocvsfoc/POCProfile.js";

export interface SubjectEvaluationInput {
  subject: string;
  framework: FrameworkDefinition;
  supportingReceipts: string[];
  evaluationRules: string[];
}

export interface SubjectEvaluator {
  readonly name: string;
  evaluate(input: SubjectEvaluationInput): POCProfile;
}
