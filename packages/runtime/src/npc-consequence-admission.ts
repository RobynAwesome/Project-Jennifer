import type { RetrievalValidationTrace } from "@jennifer/memory";
import type { EpistemicDivergenceReceipt } from "@jennifer/npc";
import type { POCFOCActionEvaluation } from "@jennifer/shared";

import {
  POCFOCRuntimeGate,
  type POCFOCRuntimeGateResult,
} from "./poc-foc-runtime-gate.js";

export interface NPCConsequenceMaturityEvidence {
  satisfied: boolean;
  evidenceRefs: readonly string[];
  note?: string;
}

export interface NPCConsequenceAdmissionInput<TOutput> {
  receipt: EpistemicDivergenceReceipt;
  evaluation: POCFOCActionEvaluation;
  retrieval: RetrievalValidationTrace;
  maturity?: NPCConsequenceMaturityEvidence;
  applyMutation: () => Promise<TOutput> | TOutput;
}

export type NPCConsequenceAdmissionResult<TOutput> =
  | {
      status: "PENDING_MATURITY";
      actionId: string;
      receiptId: string;
      ruleId: string;
      mutationApplied: false;
      reason: string;
    }
  | {
      status: "GATED";
      actionId: string;
      receiptId: string;
      ruleId: string;
      gate: POCFOCRuntimeGateResult<TOutput>;
    };

export class NPCConsequenceAdmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NPCConsequenceAdmissionError";
  }
}

function unique(values: readonly string[]): string[] {
  return Array.from(new Set(values));
}

/**
 * Runtime bridge between an NPC actor-model consequence intent and an actual
 * consequential Project Jennifer mutation.
 *
 * The epistemic receipt is deliberately insufficient on its own: it remains
 * `UNVALIDATED` / non-canonical actor state. This gateway requires an external
 * POC/FOC action evaluation plus verified retrieval evidence before delegating
 * to `POCFOCRuntimeGate` and its Memory Receipt / idempotency ledger.
 */
export class NPCConsequenceRuntimeGateway {
  constructor(
    private readonly runtimeGate: POCFOCRuntimeGate = new POCFOCRuntimeGate(),
  ) {}

  async admit<TOutput>(
    input: NPCConsequenceAdmissionInput<TOutput>,
  ): Promise<NPCConsequenceAdmissionResult<TOutput>> {
    const consequence = input.receipt.consequence;
    if (!consequence) {
      throw new NPCConsequenceAdmissionError(
        `Epistemic receipt '${input.receipt.receiptId}' has no consequence intent to admit.`,
      );
    }

    if (input.receipt.canonical !== false || input.receipt.proofState !== "actor-model") {
      throw new NPCConsequenceAdmissionError(
        "NPC consequence admission expects a non-canonical actor-model receipt.",
      );
    }

    const actionId = this.actionId(input.receipt.receiptId, consequence.ruleId);

    if (consequence.visibility === "latent") {
      if (!input.maturity?.satisfied) {
        return {
          status: "PENDING_MATURITY",
          actionId,
          receiptId: input.receipt.receiptId,
          ruleId: consequence.ruleId,
          mutationApplied: false,
          reason: consequence.maturesWhen,
        };
      }
      if (input.maturity.evidenceRefs.length === 0) {
        throw new NPCConsequenceAdmissionError(
          `Latent consequence '${consequence.ruleId}' requires maturity evidence before runtime admission.`,
        );
      }
    }

    const maturityEvidenceRefs = input.maturity?.satisfied
      ? [...input.maturity.evidenceRefs]
      : [];
    const evidenceRefs = unique([
      ...consequence.causalEvidenceRefs,
      ...maturityEvidenceRefs,
    ]);

    const gate = await this.runtimeGate.execute(
      {
        actionId,
        subject: `npc:${input.receipt.actorId}:consequence:${consequence.ruleId}`,
        claim: `Admit NPC consequence '${consequence.effect}' from event '${input.receipt.eventId}'.`,
        evaluation: input.evaluation,
        evidenceRefs,
        confidence: input.receipt.interpretationConfidence,
        consequence: consequence.effect,
        provenance: {
          sourceEngine: input.receipt.engine,
          epistemicReceiptId: input.receipt.receiptId,
          eventId: input.receipt.eventId,
          actorId: input.receipt.actorId,
          actorDisposition: input.receipt.disposition,
          actorBelief: input.receipt.actorBelief,
          actorProofState: input.receipt.proofState,
          actorValidationState: input.receipt.validationState,
          actorCanonical: input.receipt.canonical,
          consequenceRuleId: consequence.ruleId,
          consequenceVisibility: consequence.visibility,
          consequenceMaturesWhen: consequence.maturesWhen,
          maturityNote: input.maturity?.note,
        },
        retrieval: {
          ...input.retrieval,
          retrievalRoots: unique([
            ...(input.retrieval.retrievalRoots ?? []),
            ...evidenceRefs,
          ]),
        },
        memoryLane: "dynamic-experience",
      },
      input.applyMutation,
    );

    return {
      status: "GATED",
      actionId,
      receiptId: input.receipt.receiptId,
      ruleId: consequence.ruleId,
      gate,
    };
  }

  getActionId(receipt: EpistemicDivergenceReceipt): string | undefined {
    return receipt.consequence
      ? this.actionId(receipt.receiptId, receipt.consequence.ruleId)
      : undefined;
  }

  private actionId(receiptId: string, ruleId: string): string {
    return `npc-consequence:${receiptId}:${ruleId}`;
  }
}
