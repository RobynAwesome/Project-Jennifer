import { generateId, now } from "@jennifer/shared";

import type { CanonicalDecision } from "./CanonicalDecision.js";
import type { FrameworkEvolutionReceipt } from "../receipts/FrameworkEvolutionReceipt.js";
import type { CanonicalReceipt } from "../receipts/CanonicalReceipt.js";

export interface CCPDecisionRules {
  minimumEvidenceForAccepted?: string[];
  minimumEvidenceForExperimental?: string[];
}

export class ConceptualConvergenceProtocol {
  constructor(private readonly rules: CCPDecisionRules = {}) {}

  converge(receipt: FrameworkEvolutionReceipt): CanonicalReceipt {
    const decision = this.resolveDecision(receipt);
    const canonical = decision === "Accepted";

    return {
      receiptId: generateId(),
      timestamp: now(),
      framework: receipt.framework,
      proposalId: receipt.proposalId,
      evolutionReceiptId: receipt.receiptId,
      decision,
      canonical,
      rationale: this.buildRationale(receipt, decision),
    };
  }

  private resolveDecision(receipt: FrameworkEvolutionReceipt): CanonicalDecision {
    if (receipt.ccpDecision === "Deprecated") {
      return "Deprecated";
    }

    if (receipt.validation === "FAIL") {
      return receipt.ccpDecision === "Rejected" ? "Rejected" : "Refine";
    }

    const acceptedEvidence = this.rules.minimumEvidenceForAccepted ?? ["high"];
    if (acceptedEvidence.includes(receipt.evidenceLevel.toLowerCase())) {
      return "Accepted";
    }

    const experimentalEvidence = this.rules.minimumEvidenceForExperimental ?? ["medium", "moderate"];
    if (experimentalEvidence.includes(receipt.evidenceLevel.toLowerCase())) {
      return "Experimental";
    }

    return "Refine";
  }

  private buildRationale(receipt: FrameworkEvolutionReceipt, decision: CanonicalDecision): string {
    return `CCP decision ${decision} for ${receipt.framework} with validation ${receipt.validation} at evidence level ${receipt.evidenceLevel}.`;
  }
}
