import {
  POCvsFOCEvaluator,
  VOCRegistryParser,
  type FOCGroupDefinition,
  type FrameworkDefinition,
  type POCProfile,
  type VOCRegistry,
} from "@jennifer/conceptual";
import {
  MemoryReceiptEngine,
  type MemoryReceipt,
  type RetrievalValidationTrace,
  type ReceiptMemoryLane,
} from "@jennifer/memory";

export type RuntimeGateDecision = "ACCEPT" | "HOLD" | "REJECT";

export interface POCFOCRuntimeGatePolicy {
  minimumPOCScore: number;
  rejectOnOperationalFOCMatch: boolean;
}

export interface GovernedRuntimeActionInput {
  actionId: string;
  subject: string;
  claim: string;
  framework: FrameworkDefinition;
  supportingReceipts: string[];
  evaluationRules: string[];
  evidenceRefs: string[];
  observedFOCSignals?: string[];
  confidence: number;
  consequence?: string;
  provenance: Record<string, unknown>;
  retrieval: RetrievalValidationTrace;
  memoryLane?: ReceiptMemoryLane;
}

export interface POCFOCRuntimeGateResult<TOutput = unknown> {
  actionId: string;
  decision: RuntimeGateDecision;
  reasons: string[];
  pocProfile: POCProfile;
  matchedFOCGroups: FOCGroupDefinition[];
  memoryReceipt: MemoryReceipt;
  mutationApplied: boolean;
  duplicate: boolean;
  output?: TOutput;
}

const DEFAULT_POLICY: POCFOCRuntimeGatePolicy = {
  minimumPOCScore: 0.5,
  rejectOnOperationalFOCMatch: true,
};

/**
 * Runtime membrane between a proposed action and consequential state mutation.
 *
 * The gate keeps three namespaces separate:
 * - Project Jennifer POC/FOC conceptual risk scoring;
 * - Introduction-to-MCP FOC-G## operational immune groups;
 * - Memory Receipt admission / continuity.
 *
 * A rejected or held action never executes the supplied mutation callback.
 */
export class POCFOCRuntimeGate {
  private readonly parser = new VOCRegistryParser();
  private readonly evaluator = new POCvsFOCEvaluator();
  private readonly receiptEngine: MemoryReceiptEngine;
  private readonly policy: POCFOCRuntimeGatePolicy;
  private readonly priorResults = new Map<
    string,
    POCFOCRuntimeGateResult<unknown>
  >();

  constructor(
    private readonly registry: VOCRegistry,
    options: {
      policy?: Partial<POCFOCRuntimeGatePolicy>;
      receiptEngine?: MemoryReceiptEngine;
    } = {},
  ) {
    this.policy = { ...DEFAULT_POLICY, ...options.policy };
    this.receiptEngine = options.receiptEngine ?? new MemoryReceiptEngine();
  }

  async execute<TOutput>(
    input: GovernedRuntimeActionInput,
    applyMutation: () => Promise<TOutput> | TOutput,
  ): Promise<POCFOCRuntimeGateResult<TOutput>> {
    const actionId = input.actionId.trim();
    if (!actionId) throw new Error("actionId is required");

    const prior = this.priorResults.get(actionId);
    if (prior) {
      return {
        ...(prior as POCFOCRuntimeGateResult<TOutput>),
        duplicate: true,
      };
    }

    const pocProfile = this.evaluator.evaluate({
      subject: input.subject,
      framework: input.framework,
      supportingReceipts: input.supportingReceipts,
      evaluationRules: input.evaluationRules,
    });

    const matchedFOCGroups = this.matchOperationalFOCGroups(
      input.observedFOCSignals ?? [],
    );
    const reasons: string[] = [];

    let decision: RuntimeGateDecision = "ACCEPT";

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
    } else {
      if (input.evidenceRefs.length === 0) {
        decision = "HOLD";
        reasons.push("No evidence references supplied.");
      }
      if (!input.retrieval.evidenceVerified) {
        decision = "HOLD";
        reasons.push("Evidence has not been verified.");
      }
      if (!input.retrieval.answerBoundToEvidence) {
        decision = "HOLD";
        reasons.push("Proposed action is not bound to verified evidence.");
      }
      if (pocProfile.pocScore < this.policy.minimumPOCScore) {
        decision = "HOLD";
        reasons.push(
          `POC score ${pocProfile.pocScore.toFixed(2)} is below runtime threshold ${this.policy.minimumPOCScore.toFixed(2)}.`,
        );
      }
    }

    if (reasons.length === 0) {
      reasons.push("POC/FOC runtime checks passed.");
    }

    const memoryReceipt = this.receiptEngine.issue({
      subject: input.subject,
      claim: input.claim,
      evidenceRefs: [...input.evidenceRefs],
      conceptState:
        decision === "ACCEPT"
          ? "proof-of-concept"
          : decision === "HOLD"
            ? "maybe"
            : "failure-of-concept",
      confidence: input.confidence,
      consequence:
        input.consequence ??
        (decision === "ACCEPT"
          ? "Runtime mutation admitted through POC/FOC gate."
          : "Runtime mutation blocked by POC/FOC gate."),
      provenance: {
        ...input.provenance,
        runtimeGate: "POCFOCRuntimeGate",
        vocAuthority: this.registry.source.authorityOrigin,
        vocSourceRef: this.registry.source.sourceRef,
        operationalFOCGroups: matchedFOCGroups.map((group) => group.groupId),
        pocScore: pocProfile.pocScore,
        runtimeDecision: decision,
      },
      temporal: {
        lane: input.memoryLane ?? "procedure",
      },
      retrieval: {
        ...input.retrieval,
        retrievalRoots: input.retrieval.retrievalRoots
          ? [...input.retrieval.retrievalRoots]
          : undefined,
      },
    });

    let mutationApplied = false;
    let output: TOutput | undefined;

    if (decision === "ACCEPT" && memoryReceipt.admission === "admitted") {
      output = await applyMutation();
      mutationApplied = true;
    } else if (decision === "ACCEPT") {
      decision = "HOLD";
      reasons.push(
        `Memory receipt admission was ${memoryReceipt.admission}; mutation was not executed.`,
      );
    }

    const result: POCFOCRuntimeGateResult<TOutput> = {
      actionId,
      decision,
      reasons,
      pocProfile,
      matchedFOCGroups,
      memoryReceipt,
      mutationApplied,
      duplicate: false,
      ...(mutationApplied ? { output } : {}),
    };

    this.priorResults.set(actionId, result as POCFOCRuntimeGateResult<unknown>);
    return result;
  }

  getReceipt(receiptId: string): MemoryReceipt | undefined {
    return this.receiptEngine.get(receiptId);
  }

  listReceipts(): MemoryReceipt[] {
    return this.receiptEngine.list();
  }

  private matchOperationalFOCGroups(signals: string[]): FOCGroupDefinition[] {
    const groups = new Map<string, FOCGroupDefinition>();

    for (const signal of signals) {
      for (const group of this.parser.matchFOCGroups(signal, this.registry)) {
        groups.set(group.groupId, group);
      }
    }

    return [...groups.values()];
  }
}
