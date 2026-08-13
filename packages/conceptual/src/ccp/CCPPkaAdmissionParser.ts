import type { CanonicalReceipt } from "../receipts/CanonicalReceipt.js";

export interface CCPPkaAdmissionInput {
  callerRepository: string;
  ccpReceipt: CanonicalReceipt;
  ccpReceiptHash: string;
  evolutionReceiptHash: string;
}

export interface CCPPkaAdmissionRequest {
  actionId: string;
  subject: string;
  claim: {
    predicate: "ccp_acceptance_admission";
    value: "candidate";
  };
  action: {
    type: "governance.evaluate_ccp_acceptance";
    scope: string;
    consequential: false;
    reversible: true;
    parameters: Record<string, string>;
  };
  evidence: Array<{
    id: string;
    source: string;
    verified: true;
    contentHash: string;
  }>;
  context: Array<{
    id: string;
    sourceKind: "Repository";
    temporalState: "Current";
    content: string;
    evidenceRef: string;
  }>;
  invariants: Array<{
    id: string;
    description: string;
    hard: true;
  }>;
  checks: Array<{
    invariantId: string;
    status: "Satisfied";
    evidenceRefs: string[];
  }>;
  policy: {
    minimumVerifiedEvidence: 2;
    minimumDistinctEvidenceSources: 2;
    requireKnownGovernance: true;
    requireClassifiedContext: true;
    permitPermanentHumanTraitClaims: false;
  };
}

export type CCPPkaAdmissionResult =
  | { eligible: false; status: "hold"; reason: string }
  | { eligible: true; status: "eligible"; request: CCPPkaAdmissionRequest };

const SHA256 = /^sha256:[a-f0-9]{64}$/i;

export class CCPPkaAdmissionParser {
  parse(input: CCPPkaAdmissionInput): CCPPkaAdmissionResult {
    const receipt = input.ccpReceipt;

    if (receipt.decision !== "Accepted" || receipt.canonical !== true) {
      return {
        eligible: false,
        status: "hold",
        reason: `CCP receipt is not canonical Accepted evidence: ${receipt.decision}/${receipt.canonical}`,
      };
    }

    if (!SHA256.test(input.ccpReceiptHash) || !SHA256.test(input.evolutionReceiptHash)) {
      return {
        eligible: false,
        status: "hold",
        reason: "CCP and evolution receipts require sha256 content hashes.",
      };
    }

    const ccpEvidenceId = `ccp-receipt:${receipt.receiptId}`;
    const evolutionEvidenceId = `evolution-receipt:${receipt.evolutionReceiptId}`;

    return {
      eligible: true,
      status: "eligible",
      request: {
        actionId: `ccp-pka:${input.callerRepository}:${receipt.receiptId}`,
        subject: input.callerRepository,
        claim: {
          predicate: "ccp_acceptance_admission",
          value: "candidate",
        },
        action: {
          type: "governance.evaluate_ccp_acceptance",
          scope: `ccp:${receipt.framework}:${receipt.proposalId}`,
          consequential: false,
          reversible: true,
          parameters: {
            ccpReceiptId: receipt.receiptId,
            proposalId: receipt.proposalId,
            framework: receipt.framework,
            evolutionReceiptId: receipt.evolutionReceiptId,
          },
        },
        evidence: [
          {
            id: ccpEvidenceId,
            source: "repository:ccp-canonical-receipt",
            verified: true,
            contentHash: input.ccpReceiptHash,
          },
          {
            id: evolutionEvidenceId,
            source: "repository:framework-evolution-receipt",
            verified: true,
            contentHash: input.evolutionReceiptHash,
          },
        ],
        context: [
          {
            id: `ccp-context:${receipt.receiptId}`,
            sourceKind: "Repository",
            temporalState: "Current",
            content: "CCP acceptance is conceptual evidence for a separate PKA admission evaluation.",
            evidenceRef: ccpEvidenceId,
          },
        ],
        invariants: [
          {
            id: "ccp-canonical-accepted",
            description: "The CCP receipt is Accepted and canonical.",
            hard: true,
          },
        ],
        checks: [
          {
            invariantId: "ccp-canonical-accepted",
            status: "Satisfied",
            evidenceRefs: [ccpEvidenceId, evolutionEvidenceId],
          },
        ],
        policy: {
          minimumVerifiedEvidence: 2,
          minimumDistinctEvidenceSources: 2,
          requireKnownGovernance: true,
          requireClassifiedContext: true,
          permitPermanentHumanTraitClaims: false,
        },
      },
    };
  }
}
