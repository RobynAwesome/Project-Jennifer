import { generateId, now } from "@jennifer/shared";

import type { CanonicalDecision } from "../ccp/CanonicalDecision.js";
import { ConceptualConvergenceProtocol } from "../ccp/ConceptualConvergenceProtocol.js";
import type { CDPContextParseResult } from "../cdp/CDPContextParser.js";
import {
  ConceptualDivergenceRuntime,
  type CDPRuntimeReceipt,
} from "../cdp/ConceptualDivergenceRuntime.js";
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

/**
 * Candidate metadata used after CDP widening when the human/runtime requests
 * evaluation of one proposal. CDP itself still emits hypothesis-only output.
 */
export interface CDPCandidate {
  proposalId: string;
  hypothesis: string;
  difference: string;
  evidenceNeeded: string[];
  risks: string[];
  proofState: "hypothesis" | "evidence-bearing";
  evidenceLevel: string;
  requestedDecision: CanonicalDecision;
  supportingSignalIds?: string[];
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
  currentState: string;
  humanGoal: string;
  hardConstraints: string[];
  forbiddenPaths?: string[];
  context: CDPContextParseResult;
  candidates: CDPCandidate[];
  includeUnknownBranch?: boolean;
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
    dedicatedCdpEngineExecuted: true;
    runtimeReceipt: CDPRuntimeReceipt;
  };
  evolutionReceipt: FrameworkEvolutionReceipt;
  canonicalReceipt: CanonicalReceipt;
}

/**
 * Bounded orchestration proof for relational conceptual evolution.
 *
 * RIVM provides deterministic hard-fail gates from explicit caller signals.
 * CDP now executes the dedicated widening runtime against provenance-bound
 * parsed context and remains hypothesis-only/non-canonical.
 * CCP remains the canonical decision engine.
 */
export class RelationalConceptualOrchestrator {
  constructor(
    private readonly ccp = new ConceptualConvergenceProtocol(),
    private readonly cdp = new ConceptualDivergenceRuntime(),
  ) {}

  orchestrate(input: RelationalConceptualInput): RelationalConceptualReceipt {
    const hardFailures = this.detectHardFailures(input.signals);

    const cdpReceipt = this.cdp.diverge({
      currentState: input.currentState,
      humanGoal: input.humanGoal,
      hardConstraints: input.hardConstraints,
      forbiddenPaths: input.forbiddenPaths,
      context: input.context,
      candidates: input.candidates.map((candidate) => ({
        candidateId: candidate.proposalId,
        hypothesis: candidate.hypothesis,
        difference: candidate.difference,
        evidenceNeeded: candidate.evidenceNeeded,
        risks: candidate.risks,
        supportingSignalIds: candidate.supportingSignalIds,
      })),
      includeUnknownBranch: input.includeUnknownBranch,
    });

    const selectedRuntimeCandidate = cdpReceipt.candidates.find(
      (candidate) => candidate.candidateId === input.selectedProposalId,
    );
    const selected = input.candidates.find(
      (candidate) => candidate.proposalId === input.selectedProposalId,
    );

    if (!selectedRuntimeCandidate || !selected) {
      throw new Error(
        `Selected proposal ${input.selectedProposalId} is not present in the governed CDP candidate set.`,
      );
    }

    const validation: FrameworkEvolutionReceipt["validation"] =
      hardFailures.length === 0 ? "PASS" : "FAIL";

    const evolutionReceipt: FrameworkEvolutionReceipt = {
      framework: input.framework,
      proposalId: selectedRuntimeCandidate.candidateId,
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
        candidateCount: cdpReceipt.candidates.length,
        selectedProposalId: selectedRuntimeCandidate.candidateId,
        dedicatedCdpEngineExecuted: cdpReceipt.dedicatedCdpEngineExecuted,
        runtimeReceipt: cdpReceipt,
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
