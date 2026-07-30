import type { CanonicalDecision } from "../ccp/CanonicalDecision.js";

export interface CanonicalReceipt {
  receiptId: string;
  timestamp: number;
  framework: string;
  proposalId: string;
  evolutionReceiptId: string;
  decision: CanonicalDecision;
  canonical: boolean;
  rationale: string;
}
