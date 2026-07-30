import type { FOCRiskProfile } from "../pocvsfoc/FOCRiskProfile.js";

export interface EvaluationReceipt {
  receiptId: string;
  timestamp: number;
  framework: string;
  subject: string;
  evaluator: string;
  validation: "PASS" | "FAIL";
  pocScore: number;
  strengths: string[];
  focRisks: FOCRiskProfile[];
  recommendations: string[];
  supportingReceipts: string[];
  rulesApplied: string[];
}
