import {
  type POCFOCActionEvaluation,
  type RuntimeGateDecision,
} from "@jennifer/shared";
import {
  MemoryReceiptEngine,
  type MemoryReceipt,
  type RetrievalValidationTrace,
  type ReceiptMemoryLane,
} from "@jennifer/memory";

export interface GovernedRuntimeActionInput {
  actionId: string;
  subject: string;
  claim: string;
  evaluation: POCFOCActionEvaluation;
  evidenceRefs: string[];
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
  evaluation: POCFOCActionEvaluation;
  memoryReceipt: MemoryReceipt;
  mutationApplied: boolean;
  duplicate: boolean;
  output?: TOutput;
}

/**
 * Runtime membrane between a POC/FOC action evaluation and consequential
 * Project Jennifer state mutation.
 *
 * Conceptual evaluation is deliberately performed outside this package so the
 * runtime does not acquire ownership of KPGS/VOC semantics. The runtime only
 * consumes the shared decision contract, verifies evidence admission, mints a
 * Memory Receipt, and applies the mutation if every gate remains open.
 */
export class POCFOCRuntimeGate {
  private readonly receiptEngine: MemoryReceiptEngine;
  private readonly priorResults = new Map<
    string,
    POCFOCRuntimeGateResult<unknown>
  >();

  constructor(receiptEngine: MemoryReceiptEngine = new MemoryReceiptEngine()) {
    this.receiptEngine = receiptEngine;
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

    const reasons = [...input.evaluation.reasons];
    let decision = input.evaluation.decision;

    if (decision === "ACCEPT") {
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
        vocAuthority: input.evaluation.sourceAuthority,
        vocSourceRef: input.evaluation.sourceRef,
        operationalFOCGroups: input.evaluation.matchedFOCGroups.map(
          (group) => group.groupId,
        ),
        pocScore: input.evaluation.pocScore,
        conceptualDecision: input.evaluation.decision,
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
      evaluation: {
        ...input.evaluation,
        reasons: [...input.evaluation.reasons],
        matchedFOCGroups: input.evaluation.matchedFOCGroups.map((group) => ({
          ...group,
        })),
      },
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
}
