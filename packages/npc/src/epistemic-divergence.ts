import type { ID, NPCRelationship } from "@jennifer/shared";
import { clamp, generateId, now } from "@jennifer/shared";

export type EpistemicDisposition = "CONVERGE" | "DIVERGE" | "HOLD";
export type DivergenceCapability = "STANDARD" | "POWER";
export type InterpretationLabel = "supportive" | "threatening" | "ambiguous" | "unknown";
export type ObservationMeaning =
  | "supports-goal"
  | "obstructs-goal"
  | "trust-signal"
  | "threat-signal"
  | "ambiguous";
export type ConsequenceVisibility = "immediate" | "latent";

export interface DivergenceEventFact {
  factId: ID;
  statement: string;
  evidenceRefs: readonly string[];
}

export interface DivergenceEvent {
  eventId: ID;
  facts: readonly DivergenceEventFact[];
}

/**
 * An observation is actor-relative evidence about a known event fact.
 * `meaning` is the actor's interpretation of what was observed; it is not
 * promoted into objective event truth by the engine.
 */
export interface ActorObservation {
  factId: ID;
  meaning: ObservationMeaning;
  confidence: number;
}

export interface DivergenceGoalSnapshot {
  goalId: ID;
  description: string;
  priority: number;
}

export interface DivergenceAwarenessSnapshot {
  nearbyNpcIds: readonly ID[];
  recentEvents: readonly string[];
  environmentalTone: number;
}

export interface DivergenceActorContext {
  actorId: ID;
  capability: DivergenceCapability;
  observations: readonly ActorObservation[];
  relationship?: Pick<NPCRelationship, "targetId" | "type" | "trust">;
  currentGoal?: DivergenceGoalSnapshot;
  awareness?: DivergenceAwarenessSnapshot;
}

export interface ConsequenceRule {
  ruleId: ID;
  priority: number;
  when: {
    disposition?: EpistemicDisposition;
    interpretation?: InterpretationLabel;
    minConfidence?: number;
  };
  effect: string;
  visibility: ConsequenceVisibility;
  maturesWhen: string;
  evidenceRefs: readonly string[];
}

export interface InterpretationCandidate {
  label: InterpretationLabel;
  plausibilitySignal: number;
  canonical: false;
}

export interface DivergenceConsequenceIntent {
  ruleId: ID;
  effect: string;
  visibility: ConsequenceVisibility;
  maturesWhen: string;
  policyEvidenceRefs: readonly string[];
  causalEvidenceRefs: readonly string[];
}

export interface EpistemicDivergenceReceipt {
  receiptId: ID;
  engine: "EpistemicDivergenceEngine";
  eventId: ID;
  actorId: ID;
  capability: DivergenceCapability;
  knownFactIds: readonly ID[];
  unknownFactIds: readonly ID[];
  evidenceRefs: readonly string[];
  coverage: number;
  ambiguity: number;
  interpretationScore: number;
  interpretationConfidence: number;
  disposition: EpistemicDisposition;
  actorBelief?: InterpretationLabel;
  alternatives: readonly InterpretationCandidate[];
  consequence?: DivergenceConsequenceIntent;
  proofState: "actor-model";
  validationState: "UNVALIDATED";
  canonical: false;
  createdAt: number;
}

export interface EpistemicDivergenceInput {
  event: DivergenceEvent;
  actor: DivergenceActorContext;
  consequenceRules?: readonly ConsequenceRule[];
}

export interface EpistemicDivergenceThresholds {
  standardCoverageForConvergence: number;
  powerCoverageForConvergence: number;
  standardScoreForConvergence: number;
  powerScoreForConvergence: number;
  ambiguityForDivergence: number;
}

const DEFAULT_THRESHOLDS: EpistemicDivergenceThresholds = {
  standardCoverageForConvergence: 0.5,
  powerCoverageForConvergence: 0.75,
  standardScoreForConvergence: 0.2,
  powerScoreForConvergence: 0.35,
  ambiguityForDivergence: 0.5,
};

const MEANING_WEIGHT: Record<ObservationMeaning, number> = {
  "supports-goal": 0.55,
  "obstructs-goal": -0.55,
  "trust-signal": 0.45,
  "threat-signal": -0.45,
  ambiguous: 0,
};

export class EpistemicDivergenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EpistemicDivergenceError";
  }
}

function requireText(value: string, field: string): void {
  if (!value.trim()) throw new EpistemicDivergenceError(`${field} is required.`);
}

function requireUnitInterval(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new EpistemicDivergenceError(`${field} must be finite and within [0, 1].`);
  }
}

function unique<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

/**
 * Deterministic first-slice runtime for actor-relative interpretation.
 *
 * It intentionally separates:
 *   objective event facts -> actor observations -> actor interpretation
 *   -> optional policy-backed consequence intent.
 *
 * The receipt is never objective truth or POC/FOC validation by itself.
 */
export class EpistemicDivergenceEngine {
  private readonly thresholds: EpistemicDivergenceThresholds;

  constructor(thresholds: Partial<EpistemicDivergenceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    this.validateThresholds();
  }

  evaluate(input: EpistemicDivergenceInput): EpistemicDivergenceReceipt {
    this.validateInput(input);

    const factById = new Map<ID, DivergenceEventFact>();
    for (const fact of input.event.facts) factById.set(fact.factId, fact);

    const observedFactIds = unique(input.actor.observations.map((observation) => observation.factId));
    const observedSet = new Set(observedFactIds);
    const unknownFactIds = input.event.facts
      .map((fact) => fact.factId)
      .filter((factId) => !observedSet.has(factId));

    const coverage = observedFactIds.length / input.event.facts.length;
    const ambiguityCount = input.actor.observations.filter(
      (observation) => observation.meaning === "ambiguous",
    ).length;
    const ambiguity = input.actor.observations.length === 0
      ? 1
      : ambiguityCount / input.actor.observations.length;

    const interpretationScore = this.interpretationScore(input.actor);
    const interpretationConfidence = this.interpretationConfidence(
      coverage,
      ambiguity,
      interpretationScore,
    );
    const disposition = this.disposition(
      input.actor,
      coverage,
      ambiguity,
      interpretationScore,
    );

    const actorBelief = disposition === "CONVERGE"
      ? this.labelForScore(interpretationScore)
      : undefined;
    const alternatives = this.alternatives(
      disposition,
      interpretationScore,
      coverage,
      ambiguity,
      actorBelief,
    );

    const evidenceRefs = unique(
      observedFactIds.flatMap((factId) => factById.get(factId)?.evidenceRefs ?? []),
    );

    const matchingRule = this.selectRule(
      input.consequenceRules ?? [],
      disposition,
      actorBelief,
      interpretationConfidence,
    );

    const consequence = matchingRule
      ? {
          ruleId: matchingRule.ruleId,
          effect: matchingRule.effect,
          visibility: matchingRule.visibility,
          maturesWhen: matchingRule.maturesWhen,
          policyEvidenceRefs: [...matchingRule.evidenceRefs],
          causalEvidenceRefs: unique([...evidenceRefs, ...matchingRule.evidenceRefs]),
        }
      : undefined;

    return {
      receiptId: generateId(),
      engine: "EpistemicDivergenceEngine",
      eventId: input.event.eventId,
      actorId: input.actor.actorId,
      capability: input.actor.capability,
      knownFactIds: observedFactIds,
      unknownFactIds,
      evidenceRefs,
      coverage,
      ambiguity,
      interpretationScore,
      interpretationConfidence,
      disposition,
      actorBelief,
      alternatives,
      consequence,
      proofState: "actor-model",
      validationState: "UNVALIDATED",
      canonical: false,
      createdAt: now(),
    };
  }

  private interpretationScore(actor: DivergenceActorContext): number {
    if (actor.observations.length === 0) return 0;

    let observationTotal = 0;
    for (const observation of actor.observations) {
      let weight = MEANING_WEIGHT[observation.meaning];
      if (
        (observation.meaning === "supports-goal" || observation.meaning === "obstructs-goal")
        && actor.currentGoal
      ) {
        weight *= actor.currentGoal.priority;
      }
      observationTotal += weight * observation.confidence;
    }

    const normalizedObservation = observationTotal / actor.observations.length;
    const relationshipBias = actor.relationship
      ? (actor.relationship.trust - 0.5) * 0.35
      : 0;
    const environmentBias = actor.awareness
      ? clamp(actor.awareness.environmentalTone, -1, 1) * 0.1
      : 0;

    return clamp(normalizedObservation + relationshipBias + environmentBias, -1, 1);
  }

  private interpretationConfidence(
    coverage: number,
    ambiguity: number,
    score: number,
  ): number {
    const evidenceFactor = coverage * (1 - ambiguity * 0.5);
    const convictionFactor = 0.55 + Math.abs(score) * 0.45;
    return clamp(evidenceFactor * convictionFactor, 0, 1);
  }

  private disposition(
    actor: DivergenceActorContext,
    coverage: number,
    ambiguity: number,
    score: number,
  ): EpistemicDisposition {
    if (actor.observations.length === 0) return "HOLD";

    const coverageThreshold = actor.capability === "POWER"
      ? this.thresholds.powerCoverageForConvergence
      : this.thresholds.standardCoverageForConvergence;
    const scoreThreshold = actor.capability === "POWER"
      ? this.thresholds.powerScoreForConvergence
      : this.thresholds.standardScoreForConvergence;

    if (
      coverage < coverageThreshold
      || ambiguity >= this.thresholds.ambiguityForDivergence
      || Math.abs(score) < scoreThreshold
    ) {
      return "DIVERGE";
    }

    return "CONVERGE";
  }

  private labelForScore(score: number): InterpretationLabel {
    if (score >= 0.2) return "supportive";
    if (score <= -0.2) return "threatening";
    return "ambiguous";
  }

  private alternatives(
    disposition: EpistemicDisposition,
    score: number,
    coverage: number,
    ambiguity: number,
    actorBelief: InterpretationLabel | undefined,
  ): InterpretationCandidate[] {
    if (disposition === "HOLD") {
      return [{ label: "unknown", plausibilitySignal: 1, canonical: false }];
    }

    if (disposition === "CONVERGE" && actorBelief) {
      return [{
        label: actorBelief,
        plausibilitySignal: clamp(0.5 + Math.abs(score) * 0.5, 0, 1),
        canonical: false,
      }];
    }

    return [
      {
        label: "supportive",
        plausibilitySignal: clamp((score + 1) / 2, 0, 1),
        canonical: false,
      },
      {
        label: "threatening",
        plausibilitySignal: clamp((1 - score) / 2, 0, 1),
        canonical: false,
      },
      {
        label: "unknown",
        plausibilitySignal: clamp(Math.max(1 - coverage, ambiguity), 0, 1),
        canonical: false,
      },
    ];
  }

  private selectRule(
    rules: readonly ConsequenceRule[],
    disposition: EpistemicDisposition,
    actorBelief: InterpretationLabel | undefined,
    confidence: number,
  ): ConsequenceRule | undefined {
    return [...rules]
      .sort((a, b) => b.priority - a.priority)
      .find((rule) => {
        if (rule.when.disposition && rule.when.disposition !== disposition) return false;
        if (rule.when.interpretation && rule.when.interpretation !== actorBelief) return false;
        if (rule.when.minConfidence !== undefined && confidence < rule.when.minConfidence) return false;
        return true;
      });
  }

  private validateInput(input: EpistemicDivergenceInput): void {
    requireText(input.event.eventId, "Event ID");
    requireText(input.actor.actorId, "Actor ID");

    if (input.event.facts.length === 0) {
      throw new EpistemicDivergenceError("An epistemic event requires at least one objective fact.");
    }

    const factIds = new Set<ID>();
    for (const fact of input.event.facts) {
      requireText(fact.factId, "Fact ID");
      requireText(fact.statement, `Fact '${fact.factId}' statement`);
      if (fact.evidenceRefs.length === 0) {
        throw new EpistemicDivergenceError(`Fact '${fact.factId}' requires evidence references.`);
      }
      if (factIds.has(fact.factId)) {
        throw new EpistemicDivergenceError(`Duplicate event fact '${fact.factId}'.`);
      }
      factIds.add(fact.factId);
    }

    for (const observation of input.actor.observations) {
      if (!factIds.has(observation.factId)) {
        throw new EpistemicDivergenceError(
          `Actor '${input.actor.actorId}' cannot observe unknown fact '${observation.factId}'.`,
        );
      }
      requireUnitInterval(observation.confidence, `Observation '${observation.factId}' confidence`);
    }

    if (input.actor.relationship) {
      requireUnitInterval(input.actor.relationship.trust, "Relationship trust");
    }
    if (input.actor.currentGoal) {
      requireText(input.actor.currentGoal.goalId, "Goal ID");
      requireText(input.actor.currentGoal.description, "Goal description");
      requireUnitInterval(input.actor.currentGoal.priority, "Goal priority");
    }
    if (input.actor.awareness) {
      if (
        !Number.isFinite(input.actor.awareness.environmentalTone)
        || input.actor.awareness.environmentalTone < -1
        || input.actor.awareness.environmentalTone > 1
      ) {
        throw new EpistemicDivergenceError("Environmental tone must be finite and within [-1, 1].");
      }
    }

    for (const rule of input.consequenceRules ?? []) {
      requireText(rule.ruleId, "Consequence rule ID");
      requireText(rule.effect, `Consequence rule '${rule.ruleId}' effect`);
      requireText(rule.maturesWhen, `Consequence rule '${rule.ruleId}' maturity condition`);
      if (!Number.isFinite(rule.priority)) {
        throw new EpistemicDivergenceError(`Consequence rule '${rule.ruleId}' priority must be finite.`);
      }
      if (rule.evidenceRefs.length === 0) {
        throw new EpistemicDivergenceError(
          `Consequence rule '${rule.ruleId}' requires policy evidence references.`,
        );
      }
      if (rule.when.minConfidence !== undefined) {
        requireUnitInterval(
          rule.when.minConfidence,
          `Consequence rule '${rule.ruleId}' minimum confidence`,
        );
      }
    }
  }

  private validateThresholds(): void {
    requireUnitInterval(
      this.thresholds.standardCoverageForConvergence,
      "Standard convergence coverage threshold",
    );
    requireUnitInterval(
      this.thresholds.powerCoverageForConvergence,
      "Power convergence coverage threshold",
    );
    requireUnitInterval(
      this.thresholds.standardScoreForConvergence,
      "Standard convergence score threshold",
    );
    requireUnitInterval(
      this.thresholds.powerScoreForConvergence,
      "Power convergence score threshold",
    );
    requireUnitInterval(
      this.thresholds.ambiguityForDivergence,
      "Divergence ambiguity threshold",
    );
  }
}
