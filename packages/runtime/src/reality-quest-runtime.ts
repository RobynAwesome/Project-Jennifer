import {
  RealityQuestError,
  assertRealityQuestContract,
  type RealityQuestContract,
  type RealityQuestEvidenceSubmission,
  type RealityQuestVerdict,
} from "@jennifer/shared";

export interface RealityQuestEvaluationReceipt {
  receiptId: string;
  questId: string;
  verdict: RealityQuestVerdict;
  reasons: readonly string[];
  memoryReceiptRef?: string;
  canonical: false;
}

/**
 * In-process Reality Quest Runtime.
 *
 * AI OUTPUT != QUEST COMPLETION
 * PROGRESSION REQUIRES AN ADMITTED RECEIPT
 * DARER clinical claims cannot inherit validity.
 */
export class RealityQuestRuntime {
  private readonly quests = new Map<string, RealityQuestContract>();
  private readonly receipts = new Map<string, RealityQuestEvaluationReceipt>();

  propose(quest: RealityQuestContract): RealityQuestContract {
    assertRealityQuestContract(quest);
    const next = { ...quest, status: "proposed" as const };
    this.quests.set(next.questId, next);
    return next;
  }

  accept(questId: string, acceptedAt: string): RealityQuestContract {
    const quest = this.require(questId);
    if (quest.status !== "proposed") {
      throw new RealityQuestError("Only a proposed quest can be accepted");
    }
    const next = { ...quest, status: "accepted" as const, userAcceptedAt: acceptedAt };
    this.quests.set(questId, next);
    return next;
  }

  abandon(questId: string): RealityQuestContract {
    const quest = this.require(questId);
    const next = { ...quest, status: "abandoned" as const };
    this.quests.set(questId, next);
    return next;
  }

  evaluate(
    submission: RealityQuestEvidenceSubmission,
  ): RealityQuestEvaluationReceipt {
    const quest = this.require(submission.questId);
    if (quest.status === "abandoned") {
      throw new RealityQuestError("Abandoned quests are not evaluated as failures");
    }

    const reasons: string[] = [];
    let verdict: RealityQuestVerdict = "HOLD";

    if (submission.clinicalClaimFromDarer) {
      reasons.push("DARER clinical claims cannot inherit Jennifer validity");
      verdict = "HOLD";
    } else if (submission.praiseOnly || (submission.claimedComplete && submission.evidenceRefs.length === 0)) {
      reasons.push("AI praise or an unbacked 'done' claim is not quest completion");
      verdict = "HOLD";
    } else if (
      quest.evidencePolicy.required &&
      !quest.evidencePolicy.acceptedEvidenceTypes.includes(submission.evidenceType)
    ) {
      reasons.push(`Evidence type '${submission.evidenceType}' is not admitted for this quest`);
      verdict = "REVISE";
    } else if (quest.evidencePolicy.required && submission.evidenceRefs.length === 0) {
      reasons.push("Required evidence is missing; UNKNOWN is not failure");
      verdict = "HOLD";
    } else if (submission.evidenceRefs.length > 0) {
      reasons.push("Admitted evidence satisfies the bounded KPGS operations policy");
      verdict = "ACCEPT";
    } else {
      reasons.push("Insufficient evidence; HOLD");
    }

    const receiptId = `rq-eval:${quest.questId}:${this.receipts.size + 1}`;
    const memoryReceiptRef =
      verdict === "ACCEPT" ? `memory:${receiptId}` : undefined;
    const receipt: RealityQuestEvaluationReceipt = {
      receiptId,
      questId: quest.questId,
      verdict,
      reasons,
      memoryReceiptRef,
      canonical: false,
    };

    const existing = this.receipts.get(idempotencyKey(submission));
    if (existing) return existing;
    this.receipts.set(idempotencyKey(submission), receipt);

    this.quests.set(quest.questId, {
      ...quest,
      status:
        verdict === "ACCEPT"
          ? "completed"
          : verdict === "REVISE"
            ? "revise"
            : "hold",
      evaluationReceiptRef: receipt.receiptId,
      memoryReceiptRef,
    });

    return receipt;
  }

  reconstruct(questId: string): RealityQuestContract {
    return { ...this.require(questId) };
  }

  snapshot(): RealityQuestContract[] {
    return [...this.quests.values()].map((quest) => ({ ...quest }));
  }

  restore(quests: readonly RealityQuestContract[]): void {
    this.quests.clear();
    for (const quest of quests) {
      assertRealityQuestContract(quest);
      this.quests.set(quest.questId, { ...quest });
    }
  }

  private require(questId: string): RealityQuestContract {
    const quest = this.quests.get(questId);
    if (!quest) throw new RealityQuestError(`Unknown quest ${questId}`);
    return quest;
  }
}

function idempotencyKey(submission: RealityQuestEvidenceSubmission): string {
  return `${submission.questId}:${[...submission.evidenceRefs].sort().join(",")}:${submission.evidenceType}`;
}
