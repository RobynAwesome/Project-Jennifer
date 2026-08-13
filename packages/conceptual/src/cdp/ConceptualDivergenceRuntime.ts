import { generateId, now } from "@jennifer/shared";

import type { CDPContextParseResult, CDPContextSignal } from "./CDPContextParser.js";

export interface CDPCandidateSeed {
  candidateId: string;
  hypothesis: string;
  difference: string;
  evidenceNeeded: string[];
  risks: string[];
  supportingSignalIds?: string[];
}

export interface CDPRuntimeInput {
  currentState: string;
  humanGoal: string;
  hardConstraints: string[];
  forbiddenPaths?: string[];
  context: CDPContextParseResult;
  candidates: CDPCandidateSeed[];
  includeUnknownBranch?: boolean;
}

export interface CDPRuntimeCandidate extends CDPCandidateSeed {
  proofState: "hypothesis";
  supportingSignals: CDPContextSignal[];
  canonical: false;
}

export interface CDPRuntimeReceipt {
  receiptId: string;
  timestamp: number;
  protocol: "CDP";
  statelessRenter: true;
  dedicatedCdpEngineExecuted: true;
  currentState: string;
  humanGoal: string;
  hardConstraints: string[];
  forbiddenPaths: string[];
  parserPromotionStatus: "evidence-only";
  candidates: CDPRuntimeCandidate[];
  unknowns: string[];
  recommendedNextProtocol: "CEEP";
  canonicalized: false;
}

/** Dedicated CDP widening runtime. It produces hypotheses, never canon. */
export class ConceptualDivergenceRuntime {
  diverge(input: CDPRuntimeInput): CDPRuntimeReceipt {
    if (!input.currentState.trim()) throw new Error("CDP currentState is required.");
    if (!input.humanGoal.trim()) throw new Error("CDP humanGoal is required.");
    if (input.candidates.length < 2) throw new Error("CDP runtime requires at least two distinguishable candidate families.");

    const candidateIds = new Set<string>();
    const differences = new Set<string>();
    for (const candidate of input.candidates) {
      const id = candidate.candidateId.trim();
      const difference = this.normalize(candidate.difference);
      if (!id) throw new Error("Every CDP candidate requires a candidateId.");
      if (candidateIds.has(id)) throw new Error(`Duplicate CDP candidateId: ${id}`);
      if (!difference || differences.has(difference)) throw new Error("CDP candidates must be structurally distinguishable, not cosmetic duplicates.");
      candidateIds.add(id);
      differences.add(difference);
    }

    const signalById = new Map(input.context.signals.map((signal) => [signal.signalId, signal]));
    const candidates = input.candidates.map((candidate): CDPRuntimeCandidate => {
      const supportingSignals = (candidate.supportingSignalIds ?? []).map((signalId) => {
        const signal = signalById.get(signalId);
        if (!signal) throw new Error(`CDP candidate ${candidate.candidateId} references unknown signal ${signalId}.`);
        return signal;
      });

      return {
        ...candidate,
        evidenceNeeded: [...candidate.evidenceNeeded],
        risks: [...candidate.risks],
        supportingSignalIds: [...(candidate.supportingSignalIds ?? [])],
        supportingSignals,
        proofState: "hypothesis",
        canonical: false,
      };
    });

    const unknowns = input.context.signals
      .filter((signal) => signal.classification === "UNKNOWN")
      .map((signal) => signal.text);

    if (input.includeUnknownBranch !== false) {
      candidates.push({
        candidateId: "cdp-unknown-possibility",
        hypothesis: "An unresolved possibility remains because available context is incomplete or unclassified.",
        difference: "Preserves an explicit unknown branch instead of forcing false completeness.",
        evidenceNeeded: ["additional authorized evidence"],
        risks: ["premature convergence"],
        supportingSignalIds: [],
        supportingSignals: [],
        proofState: "hypothesis",
        canonical: false,
      });
    }

    return {
      receiptId: generateId(),
      timestamp: now(),
      protocol: "CDP",
      statelessRenter: true,
      dedicatedCdpEngineExecuted: true,
      currentState: input.currentState,
      humanGoal: input.humanGoal,
      hardConstraints: [...input.hardConstraints],
      forbiddenPaths: [...(input.forbiddenPaths ?? [])],
      parserPromotionStatus: input.context.receipt.promotionStatus,
      candidates,
      unknowns,
      recommendedNextProtocol: "CEEP",
      canonicalized: false,
    };
  }

  currentSignals(context: CDPContextParseResult): CDPContextSignal[] {
    return context.signals.filter((signal) => signal.currentAuthorityEligible);
  }

  private normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  }
}
