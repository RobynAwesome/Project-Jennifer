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

import {
  InMemoryRuntimeGateLedger,
  createRuntimeGateLedgerRecord,
  type IRuntimeGateLedger,
  type RuntimeGateLedgerRecord,
} from "./runtime-gate-ledger.js";

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

export class RuntimeGateOutcomePersistenceError extends Error {
  readonly actionId: string;

  constructor(actionId: string, cause: unknown) {
    super(
      `Mutation returned for ${actionId}, but the runtime ledger could not confirm the applied outcome. The action remains prepared and requires reconciliation.`,
      { cause },
    );
    this.name = "RuntimeGateOutcomePersistenceError";
    this.actionId = actionId;
  }
}

/**
 * Runtime membrane between a POC/FOC action evaluation and consequential
 * Project Jennifer state mutation.
 *
 * Conceptual evaluation is deliberately performed outside this package so the
 * runtime does not acquire ownership of KPGS/VOC semantics. The runtime only
 * consumes the shared decision contract, verifies evidence admission, mints a
 * Memory Receipt, reserves the action in the runtime ledger, and applies the
 * mutation only when every gate remains open.
 *
 * The ledger reservation is intentionally written before the mutation. This
 * prevents a second runtime from replaying the same action ID. If a process
 * disappears after reservation but before the mutation outcome is durably
 * recorded, the action remains PREPARED and is held for reconciliation rather
 * than guessed/replayed.
 */
export class POCFOCRuntimeGate {
  constructor(
    private readonly receiptEngine: MemoryReceiptEngine = new MemoryReceiptEngine(),
    private readonly ledger: IRuntimeGateLedger = new InMemoryRuntimeGateLedger(),
  ) {}

  async execute<TOutput>(
    input: GovernedRuntimeActionInput,
    applyMutation: () => Promise<TOutput> | TOutput,
  ): Promise<POCFOCRuntimeGateResult<TOutput>> {
    const actionId = input.actionId.trim();
    if (!actionId) throw new Error("actionId is required");

    const prior = await this.ledger.get<TOutput>(actionId);
    if (prior) return this.resultFromLedger(prior, true);

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

    if (decision === "ACCEPT" && memoryReceipt.admission !== "admitted") {
      decision = "HOLD";
      reasons.push(
        `Memory receipt admission was ${memoryReceipt.admission}; mutation was not executed.`,
      );
    }

    const candidate = createRuntimeGateLedgerRecord<TOutput>({
      actionId,
      decision,
      reasons,
      evaluation: input.evaluation,
      memoryReceipt,
      state: decision === "ACCEPT" ? "prepared" : "blocked",
    });

    const reservation = await this.ledger.reserve(candidate);
    if (!reservation.created) {
      return this.resultFromLedger(reservation.record, true);
    }

    if (decision !== "ACCEPT") {
      return this.resultFromLedger(reservation.record, false);
    }

    let output: TOutput;
    try {
      output = await applyMutation();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      try {
        await this.ledger.markFailed(actionId, message);
      } catch (ledgerError) {
        throw new AggregateError(
          [error, ledgerError],
          `Runtime mutation failed and ledger failure state could not be persisted for ${actionId}.`,
        );
      }
      throw error;
    }

    try {
      const applied = await this.ledger.markApplied(actionId, output);
      return this.resultFromLedger(applied, false, output);
    } catch (error) {
      // The mutation returned successfully, so marking it as FAILED would be a
      // fabricated outcome. Preserve PREPARED/uncertain and force a governed
      // reconciliation path instead.
      throw new RuntimeGateOutcomePersistenceError(actionId, error);
    }
  }

  async getAction<TOutput = unknown>(
    actionId: string,
  ): Promise<RuntimeGateLedgerRecord<TOutput> | undefined> {
    return this.ledger.get<TOutput>(actionId);
  }

  getReceipt(receiptId: string): MemoryReceipt | undefined {
    return this.receiptEngine.get(receiptId);
  }

  listReceipts(): MemoryReceipt[] {
    return this.receiptEngine.list();
  }

  private resultFromLedger<TOutput>(
    record: RuntimeGateLedgerRecord<TOutput>,
    duplicate: boolean,
    liveOutput?: TOutput,
  ): POCFOCRuntimeGateResult<TOutput> {
    const reasons = [...record.reasons];
    let decision = record.decision;

    if (record.state === "prepared") {
      decision = "HOLD";
      reasons.push(
        "Action is durably prepared but the mutation outcome is not confirmed; automatic replay is blocked pending reconciliation.",
      );
    } else if (record.state === "failed") {
      decision = "HOLD";
      reasons.push(
        `A prior mutation attempt failed${record.error ? `: ${record.error}` : "."} Automatic replay is blocked pending reconciliation.`,
      );
    }

    const output = liveOutput === undefined ? record.output : liveOutput;

    return {
      actionId: record.actionId,
      decision,
      reasons,
      evaluation: structuredClone(record.evaluation),
      memoryReceipt: structuredClone(record.memoryReceipt),
      mutationApplied: record.state === "applied" && record.mutationApplied,
      duplicate,
      ...(output === undefined ? {} : { output }),
    };
  }
}
