import type { MemoryReceipt } from "@jennifer/memory";
import type { EpistemicDivergenceReceipt } from "@jennifer/npc";
import {
  generateId,
  now,
  type ConsequenceRevealEvidenceGroups,
  type ConsequenceRevealInterpretationSnapshot,
  type ConsequenceRevealReceipt,
  type ConsequenceRevealRevision,
  type ConsequenceRevealState,
} from "@jennifer/shared";
import type { TelemetryCollector } from "@jennifer/telemetry";

export interface ConsequenceRevealSource {
  epistemicReceipt: EpistemicDivergenceReceipt;
  runtimeMemoryReceipt?: MemoryReceipt;
}

export class ConsequenceRevealError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConsequenceRevealError";
  }
}

function unique(values: readonly string[]): string[] {
  return Array.from(new Set(values));
}

function frozenStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeInterpretation(
  snapshot: ConsequenceRevealInterpretationSnapshot,
): Readonly<ConsequenceRevealInterpretationSnapshot> {
  return Object.freeze({
    ...snapshot,
    observedFactIds: frozenStrings(snapshot.observedFactIds),
    unknownFactIds: frozenStrings(snapshot.unknownFactIds),
  });
}

function freezeEvidence(
  evidence: ConsequenceRevealEvidenceGroups,
): Readonly<ConsequenceRevealEvidenceGroups> {
  return Object.freeze({
    event: frozenStrings(evidence.event),
    policy: frozenStrings(evidence.policy),
    maturity: frozenStrings(evidence.maturity),
    revision: frozenStrings(evidence.revision),
  });
}

function freezeRevision(
  revision: ConsequenceRevealRevision,
): Readonly<ConsequenceRevealRevision> {
  return Object.freeze({
    ...revision,
    addedEvidenceRefs: frozenStrings(revision.addedEvidenceRefs),
    interpretation: freezeInterpretation(revision.interpretation),
  });
}

function freezeReceipt(receipt: ConsequenceRevealReceipt): ConsequenceRevealReceipt {
  const runtimeAdmission = receipt.runtimeAdmission
    ? Object.freeze({ ...receipt.runtimeAdmission })
    : undefined;

  return Object.freeze({
    ...receipt,
    origin: Object.freeze({ ...receipt.origin }),
    ...(runtimeAdmission ? { runtimeAdmission } : {}),
    disclosedEvidence: freezeEvidence(receipt.disclosedEvidence),
    interpretationHistory: Object.freeze(
      receipt.interpretationHistory.map((entry) => freezeInterpretation(entry)),
    ),
    revisions: Object.freeze(receipt.revisions.map((entry) => freezeRevision(entry))),
  });
}

const ALLOWED_ADVANCES: Readonly<Record<ConsequenceRevealState, readonly ConsequenceRevealState[]>> = {
  LATENT: ["EFFECT_VISIBLE"],
  EFFECT_VISIBLE: ["CAUSE_PARTIAL", "CAUSE_REVEALED"],
  CAUSE_PARTIAL: ["CAUSE_REVEALED"],
  CAUSE_REVEALED: [],
  REVISED: [],
};

/**
 * Builds a player-safe projection from governed internal NPC consequence
 * receipts without turning that projection into a new source of authority.
 *
 * The engine intentionally requires the original internal receipts again when
 * visibility advances. That makes the reveal reconstructable after process
 * restart and prevents a client-facing object from becoming the hidden source
 * of its own causal truth.
 */
export class NPCConsequenceRevealEngine {
  constructor(private readonly telemetry: TelemetryCollector) {}

  create(source: ConsequenceRevealSource): ConsequenceRevealReceipt {
    const consequence = this.validateEpistemicReceipt(source.epistemicReceipt);
    if (source.runtimeMemoryReceipt) {
      this.validateRuntimeAdmission(source.epistemicReceipt, source.runtimeMemoryReceipt);
    }

    const timestamp = now();
    return freezeReceipt({
      revealId: generateId(),
      schemaVersion: 1,
      state: "LATENT",
      origin: {
        epistemicReceiptId: source.epistemicReceipt.receiptId,
        eventId: source.epistemicReceipt.eventId,
        actorId: source.epistemicReceipt.actorId,
        consequenceRuleId: consequence.ruleId,
      },
      ...(source.runtimeMemoryReceipt
        ? {
            runtimeAdmission: {
              memoryReceiptId: source.runtimeMemoryReceipt.id,
              admission: "admitted" as const,
            },
          }
        : {}),
      disclosedEvidence: this.disclosureForState("LATENT", source, []),
      interpretationHistory: [],
      revisions: [],
      proofState: "player-safe-causal-reveal",
      canonical: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  async advance(
    current: ConsequenceRevealReceipt,
    source: ConsequenceRevealSource,
    nextState: Exclude<ConsequenceRevealState, "REVISED" | "LATENT">,
  ): Promise<ConsequenceRevealReceipt> {
    this.validateOrigin(current, source.epistemicReceipt);
    this.validateRuntimeAdmissionRequired(source);

    if (!ALLOWED_ADVANCES[current.state].includes(nextState)) {
      throw new ConsequenceRevealError(
        `Reveal '${current.revealId}' cannot advance from ${current.state} to ${nextState}.`,
      );
    }

    const next = freezeReceipt({
      ...current,
      state: nextState,
      runtimeAdmission: {
        memoryReceiptId: source.runtimeMemoryReceipt!.id,
        admission: "admitted",
      },
      effect: source.epistemicReceipt.consequence!.effect,
      disclosedEvidence: this.disclosureForState(
        nextState,
        source,
        current.revisions,
      ),
      interpretationHistory:
        nextState === "CAUSE_REVEALED"
          ? [this.snapshot(source.epistemicReceipt)]
          : [],
      updatedAt: now(),
    });

    if (current.state === "LATENT" && nextState === "EFFECT_VISIBLE") {
      await this.telemetry.emit(
        "consequence.reveal.matured",
        `consequence-reveal:${current.revealId}`,
        {
          revealId: current.revealId,
          epistemicReceiptId: current.origin.epistemicReceiptId,
          runtimeMemoryReceiptId: source.runtimeMemoryReceipt!.id,
          eventId: current.origin.eventId,
          actorId: current.origin.actorId,
          consequenceRuleId: current.origin.consequenceRuleId,
        },
      );
    }

    return next;
  }

  async inspect(current: ConsequenceRevealReceipt): Promise<ConsequenceRevealReceipt> {
    if (current.state === "LATENT") {
      throw new ConsequenceRevealError(
        `Reveal '${current.revealId}' is still latent and is not player-inspectable.`,
      );
    }

    const evidenceCount =
      current.disclosedEvidence.event.length
      + current.disclosedEvidence.policy.length
      + current.disclosedEvidence.maturity.length
      + current.disclosedEvidence.revision.length;

    await this.telemetry.emit(
      "consequence.reveal.inspected",
      `consequence-reveal:${current.revealId}`,
      {
        revealId: current.revealId,
        state: current.state,
        eventId: current.origin.eventId,
        actorId: current.origin.actorId,
        disclosedEvidenceCount: evidenceCount,
        interpretationCount: current.interpretationHistory.length,
        revisionCount: current.revisions.length,
      },
    );

    return current;
  }

  async revise(
    current: ConsequenceRevealReceipt,
    source: ConsequenceRevealSource,
    revisedEpistemicReceipt: EpistemicDivergenceReceipt,
  ): Promise<ConsequenceRevealReceipt> {
    if (current.state !== "CAUSE_REVEALED" && current.state !== "REVISED") {
      throw new ConsequenceRevealError(
        `Reveal '${current.revealId}' must reveal its original cause before a revision can be appended.`,
      );
    }

    this.validateOrigin(current, source.epistemicReceipt);
    this.validateRuntimeAdmissionRequired(source);
    this.validateRevisionReceipt(source.epistemicReceipt, revisedEpistemicReceipt);

    const seenReceiptIds = new Set([
      current.origin.epistemicReceiptId,
      ...current.revisions.map((revision) => revision.sourceReceiptId),
    ]);
    if (seenReceiptIds.has(revisedEpistemicReceipt.receiptId)) {
      throw new ConsequenceRevealError(
        `Revision receipt '${revisedEpistemicReceipt.receiptId}' has already been admitted to this reveal.`,
      );
    }

    const alreadyKnownEvidence = new Set([
      ...source.epistemicReceipt.evidenceRefs,
      ...source.epistemicReceipt.consequence!.policyEvidenceRefs,
      ...this.maturityEvidence(source),
      ...current.revisions.flatMap((revision) => revision.addedEvidenceRefs),
    ]);
    const addedEvidenceRefs = revisedEpistemicReceipt.evidenceRefs.filter(
      (ref) => !alreadyKnownEvidence.has(ref),
    );

    if (addedEvidenceRefs.length === 0) {
      throw new ConsequenceRevealError(
        "A consequence revision requires new actor-observed causal evidence; interpretation changes without new evidence remain unpromoted.",
      );
    }

    const revision: ConsequenceRevealRevision = {
      revisionId: generateId(),
      sourceReceiptId: revisedEpistemicReceipt.receiptId,
      addedEvidenceRefs,
      interpretation: this.snapshot(revisedEpistemicReceipt),
      appendedAt: now(),
    };
    const revisions = [...current.revisions, revision];
    const interpretationHistory = [
      this.snapshot(source.epistemicReceipt),
      ...revisions.map((entry) => entry.interpretation),
    ];

    const next = freezeReceipt({
      ...current,
      state: "REVISED",
      runtimeAdmission: {
        memoryReceiptId: source.runtimeMemoryReceipt!.id,
        admission: "admitted",
      },
      effect: source.epistemicReceipt.consequence!.effect,
      disclosedEvidence: this.disclosureForState("REVISED", source, revisions),
      interpretationHistory,
      revisions,
      updatedAt: now(),
    });

    await this.telemetry.emit(
      "consequence.reveal.revised",
      `consequence-reveal:${current.revealId}`,
      {
        revealId: current.revealId,
        eventId: current.origin.eventId,
        actorId: current.origin.actorId,
        revisionId: revision.revisionId,
        sourceReceiptId: revision.sourceReceiptId,
        addedEvidenceRefs: [...revision.addedEvidenceRefs],
        priorInterpretationCount: current.interpretationHistory.length,
        interpretationCount: next.interpretationHistory.length,
      },
    );

    return next;
  }

  private validateEpistemicReceipt(receipt: EpistemicDivergenceReceipt) {
    if (!receipt.consequence) {
      throw new ConsequenceRevealError(
        `Epistemic receipt '${receipt.receiptId}' has no consequence intent to reveal.`,
      );
    }
    if (
      receipt.proofState !== "actor-model"
      || receipt.validationState !== "UNVALIDATED"
      || receipt.canonical !== false
    ) {
      throw new ConsequenceRevealError(
        "Consequence reveal expects the original non-canonical actor-model receipt.",
      );
    }
    return receipt.consequence;
  }

  private validateOrigin(
    current: ConsequenceRevealReceipt,
    receipt: EpistemicDivergenceReceipt,
  ): void {
    const consequence = this.validateEpistemicReceipt(receipt);
    if (
      current.origin.epistemicReceiptId !== receipt.receiptId
      || current.origin.eventId !== receipt.eventId
      || current.origin.actorId !== receipt.actorId
      || current.origin.consequenceRuleId !== consequence.ruleId
    ) {
      throw new ConsequenceRevealError(
        `Reveal '${current.revealId}' cannot be rebound to a different causal origin.`,
      );
    }
  }

  private validateRuntimeAdmissionRequired(source: ConsequenceRevealSource): void {
    if (!source.runtimeMemoryReceipt) {
      throw new ConsequenceRevealError(
        "Player-visible consequence state requires an admitted runtime Memory Receipt.",
      );
    }
    this.validateRuntimeAdmission(source.epistemicReceipt, source.runtimeMemoryReceipt);
  }

  private validateRuntimeAdmission(
    receipt: EpistemicDivergenceReceipt,
    memoryReceipt: MemoryReceipt,
  ): void {
    const consequence = this.validateEpistemicReceipt(receipt);
    const provenance = memoryReceipt.provenance;

    if (
      memoryReceipt.admission !== "admitted"
      || memoryReceipt.conceptState !== "proof-of-concept"
      || provenance.runtimeDecision !== "ACCEPT"
    ) {
      throw new ConsequenceRevealError(
        `Memory Receipt '${memoryReceipt.id}' does not prove admitted consequence execution.`,
      );
    }

    if (
      provenance.epistemicReceiptId !== receipt.receiptId
      || provenance.eventId !== receipt.eventId
      || provenance.actorId !== receipt.actorId
      || provenance.consequenceRuleId !== consequence.ruleId
    ) {
      throw new ConsequenceRevealError(
        `Memory Receipt '${memoryReceipt.id}' does not belong to the reveal's causal origin.`,
      );
    }

    const admittedEvidence = new Set(memoryReceipt.evidenceRefs);
    for (const ref of consequence.causalEvidenceRefs) {
      if (!admittedEvidence.has(ref)) {
        throw new ConsequenceRevealError(
          `Memory Receipt '${memoryReceipt.id}' is missing causal evidence '${ref}'.`,
        );
      }
    }
  }

  private validateRevisionReceipt(
    origin: EpistemicDivergenceReceipt,
    revision: EpistemicDivergenceReceipt,
  ): void {
    if (
      revision.eventId !== origin.eventId
      || revision.actorId !== origin.actorId
    ) {
      throw new ConsequenceRevealError(
        "A revision must re-evaluate the same event from the same actor identity.",
      );
    }
    if (
      revision.proofState !== "actor-model"
      || revision.validationState !== "UNVALIDATED"
      || revision.canonical !== false
    ) {
      throw new ConsequenceRevealError(
        "A revision must remain a non-canonical actor-model receipt until independently validated.",
      );
    }
  }

  private maturityEvidence(source: ConsequenceRevealSource): string[] {
    if (!source.runtimeMemoryReceipt) return [];
    const consequence = source.epistemicReceipt.consequence!;
    const causal = new Set(consequence.causalEvidenceRefs);
    return source.runtimeMemoryReceipt.evidenceRefs.filter((ref) => !causal.has(ref));
  }

  private disclosureForState(
    state: ConsequenceRevealState,
    source: ConsequenceRevealSource,
    revisions: readonly ConsequenceRevealRevision[],
  ): ConsequenceRevealEvidenceGroups {
    const consequence = source.epistemicReceipt.consequence!;
    const event = source.epistemicReceipt.evidenceRefs;
    const policy = consequence.policyEvidenceRefs;
    const maturity = this.maturityEvidence(source);
    const revision = unique(revisions.flatMap((entry) => entry.addedEvidenceRefs));

    if (state === "LATENT" || state === "EFFECT_VISIBLE") {
      return { event: [], policy: [], maturity: [], revision: [] };
    }
    if (state === "CAUSE_PARTIAL") {
      return { event: [...event], policy: [], maturity: [], revision: [] };
    }
    return {
      event: [...event],
      policy: [...policy],
      maturity,
      revision,
    };
  }

  private snapshot(
    receipt: EpistemicDivergenceReceipt,
  ): ConsequenceRevealInterpretationSnapshot {
    return {
      sourceReceiptId: receipt.receiptId,
      disposition: receipt.disposition,
      ...(receipt.actorBelief ? { belief: receipt.actorBelief } : {}),
      confidence: receipt.interpretationConfidence,
      observedFactIds: [...receipt.knownFactIds],
      unknownFactIds: [...receipt.unknownFactIds],
      recordedAt: receipt.createdAt,
    };
  }
}
