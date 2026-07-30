import type { CanonicalDecision } from "../ccp/CanonicalDecision.js";

export interface FrameworkEvolutionReceipt {
  framework: string;
  proposalId: string;
  subject: string;
  contributor: string;
  evaluator: string;
  discussionHistory: string[];
  evidenceLevel: string;
  validation: "PASS" | "FAIL";
  ccpDecision: CanonicalDecision;
  canonical: boolean;
  receiptId: string;
  timestamp: number;
}
