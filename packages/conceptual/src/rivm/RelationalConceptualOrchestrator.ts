import { generateId, now } from "@jennifer/shared";

import type { CanonicalDecision } from "../ccp/CanonicalDecision.js";
import { ConceptualConvergenceProtocol } from "../ccp/ConceptualConvergenceProtocol.js";
import type { CanonicalReceipt } from "../receipts/CanonicalReceipt.js";
import type { FrameworkEvolutionReceipt } from "../receipts/FrameworkEvolutionReceipt.js";

export type RIVMClaimClass =
  | "FACT"
  | "FEELING"
  | "FANTASY"
  | "PERFORMANCE"
  | "INFERENCE"
  | "UNKNOWN";

export type RIVMHardFailure =
  | "RIVM-03"
  | "RIVM-07"
  | "RIVM-08"
  | "RIVM-10"
  | "RIVM-11";

export interface RIVMSignals {
  unsupportedReciprocityClaim?: boolean;
  agencyCapture?: boolean;
  sourceCollapse?: boolean;
  executionSubstitution?: boolean;
  ghostExecution?: boolean;
}

export interface RelationalClaim {
  text: string;
  classification: RIVMClaimClass;
  evidenceRef?: string;
}

export interface CDPCandidate {
  proposalId: string;
  hypothesis: string;
  difference: string;
  evidenceNeeded: string[];
  risks: string[];
  proofState: "hypothesis" | "evidence-bearing";
  evidenceLevel: string;
  requestedDecision: CanonicalDecision;
}

export interface RelationalConceptualInput {
  eventRef: string;
  framework: string;
  subject: string;
  contributor: string;
  evaluator: string;
  lane: string;
  claims: RelationalClaim[];
  signals: RIVMSignals;
  candidates: CDPCandidate[];
  selectedProposalId: string;
  discussionHistory?: string[];
}

export interface RelationalConceptualReceipt {
  receiptId: string;
  timestamp: number;
  protocolChain: readonly ["RIVM", "CDP", "CCP"];
  eventRef: string;
  lane: string;
  statelessRenter: true;
  claimClasses: RIVMClaimClass[];
  hardFailures: RIVMHardFailure[];
  cdp: {
    candidateCount: number;
    selectedProposalId: string;
    dedicatedCdpEngineExecuted: false;
  };
  evolutionReceipt: FrameworkEvolutionReceipt;
  canonicalReceipt: CanonicalReceipt;
}

/**
 * Bounded orchestration proof for relational conceptual evolution.
 *
 * RIVM provides deterministic hard-fail gates from explicit caller signals.
 * CDP is represented as a governed candidate set only; this class does not
 * claim that a dedicated CDP runtime exists.
 * CCP remains the canonical decision engine.
 */
export class RelationalConceptualOrchestrator {
  constructor(private readonly ccp = new ConceptualConvergenceProtocol()) {}

  orchestrate(input: RelationalConceptualInput): RelationalConceptualReceipt {
    if (input.candidates.length < 2) {
      throw new Error("CDP requires at least two distinguishable candidates before convergence.");
    }

    const selected = input.candidates.find(
      (candidate) => candidate.proposalId === input.selectedProposalId,
    );

    if (!selected) {
      throw new Error(`Selected proposal ${input.selectedProposalId} is not present in the CDP candidate set.`);
    }

    const hardFailures = this.detectHardFailures(input.signals);
    const validation: FrameworkEvolutionReceipt["validation"] =
      hardFailures.length === 0 ? "PASS" : "FAIL";

    const evolutionReceipt: FrameworkEvolutionReceipt = {
      framework: input.framework,
      proposalId: selected.proposalId,
      subject: input.subject,
      contributor: input.contributor,
      evaluator: input.evaluator,
      discussionHistory: input.discussionHistory ?? [],
      evidenceLevel: selected.evidenceLevel,
      validation,
      ccpDecision: selected.requestedDecision,
      canonical: false,
      receiptId: generateId(),
      timestamp: now(),
    };

    const canonicalReceipt = this.ccp.converge(evolutionReceipt);

    return {
      receiptId: generateId(),
      timestamp: now(),
      protocolChain: ["RIVM", "CDP", "CCP"],
      eventRef: input.eventRef,
      lane: input.lane,
      statelessRenter: true,
      claimClasses: [...new Set(input.claims.map((claim) => claim.classification))],
      hardFailures,
      cdp: {
        candidateCount: input.candidates.length,
        selectedProposalId: selected.proposalId,
        dedicatedCdpEngineExecuted: false,
      },
      evolutionReceipt,
      canonicalReceipt,
    };
  }

  private detectHardFailures(signals: RIVMSignals): RIVMHardFailure[] {
    const failures: RIVMHardFailure[] = [];

    if (signals.unsupportedReciprocityClaim) failures.push("RIVM-03");
    if (signals.agencyCapture) failures.push("RIVM-07");
    if (signals.sourceCollapse) failures.push("RIVM-08");
    if (signals.executionSubstitution) failures.push("RIVM-10");
    if (signals.ghostExecution) failures.push("RIVM-11");

    return failures;
  }
}
