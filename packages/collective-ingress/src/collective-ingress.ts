import type {
  IngressEvent,
  IngressCategory,
  CollectiveNarrative,
  NarrativePhase,
  NarrativeStage,
  ID,
} from "@jennifer/shared";
import type { IEventBus } from "@jennifer/shared";
import { generateId, now, clamp } from "@jennifer/shared";

export const INGRESS_EVENT_TOPIC = "jennifer:collective-ingress";
export const NARRATIVE_UPDATE_TOPIC = "jennifer:collective-narrative";

// ─── Ingress Monitor ──────────────────────────────────────────────────────────

/**
 * Monitors large-scale societal ingress signals (holidays, trends,
 * financial shifts, etc.) and injects them into the runtime as
 * IngressEvents that influence system behaviour without directly
 * generating responses.
 */
export class IngressMonitor {
  private readonly events: Map<ID, IngressEvent> = new Map();

  constructor(private readonly bus: IEventBus) {}

  async ingest(event: Omit<IngressEvent, "id" | "detectedAt">): Promise<IngressEvent> {
    const full: IngressEvent = {
      ...event,
      id: generateId(),
      magnitude: clamp(event.magnitude, 0, 1),
      sentiment: clamp(event.sentiment, -1, 1),
      detectedAt: now(),
    };

    this.events.set(full.id, full);
    await this.bus.publish(INGRESS_EVENT_TOPIC, full);
    return full;
  }

  getActive(): IngressEvent[] {
    const current = now();
    return Array.from(this.events.values()).filter(
      (e) => e.validUntil === undefined || e.validUntil > current
    );
  }

  getByCategory(category: IngressCategory): IngressEvent[] {
    return this.getActive().filter((e) => e.category === category);
  }

  /**
   * Computes an aggregate sentiment score for currently active events.
   * Weighted by event magnitude.
   */
  aggregateSentiment(): number {
    const active = this.getActive();
    if (active.length === 0) return 0;

    const totalWeight = active.reduce((s, e) => s + e.magnitude, 0);
    if (totalWeight === 0) return 0;

    const weighted = active.reduce((s, e) => s + e.sentiment * e.magnitude, 0);
    return clamp(weighted / totalWeight, -1, 1);
  }

  /**
   * Computes a behavioural influence modifier (0-2) that can be applied
   * to response generation and NPC behaviour.
   */
  getBehaviourModifier(): number {
    const sentiment = this.aggregateSentiment();
    const active = this.getActive();
    const maxMagnitude = active.reduce((m, e) => Math.max(m, e.magnitude), 0);

    // Baseline 1.0; scale ±0.5 by sentiment * peak magnitude.
    return clamp(1.0 + sentiment * maxMagnitude * 0.5, 0.5, 1.5);
  }
}

// ─── Collective Perception Protocol (CCPP) ────────────────────────────────────

/**
 * CCPP measures how a single ingress event evolves through distributed
 * societal networks into layered narratives. Tracks emergence →
 * amplification → distribution → saturation → decay.
 */
export class CollectivePerceptionProtocol {
  private readonly narratives: Map<ID, CollectiveNarrative> = new Map();

  constructor(private readonly bus: IEventBus) {}

  /**
   * Initialises a new narrative arc from an ingress event.
   */
  async startNarrative(originEventId: ID): Promise<CollectiveNarrative> {
    const stage: NarrativeStage = {
      phase: "emergence",
      reachCount: 0,
      sentimentDelta: 0,
      timestamp: now(),
    };

    const narrative: CollectiveNarrative = {
      id: generateId(),
      originEventId,
      stages: [stage],
      spreadVelocity: 0,
      peakReach: 0,
      currentPhase: "emergence",
      measuredAt: now(),
    };

    this.narratives.set(narrative.id, narrative);
    await this.bus.publish(NARRATIVE_UPDATE_TOPIC, narrative);
    return narrative;
  }

  /**
   * Records a measurement step for an active narrative.
   */
  async recordMeasurement(
    narrativeId: ID,
    reachCount: number,
    sentimentDelta: number
  ): Promise<CollectiveNarrative | undefined> {
    const narrative = this.narratives.get(narrativeId);
    if (!narrative) return undefined;

    const phase = this.inferPhase(narrative, reachCount);
    const stage: NarrativeStage = {
      phase,
      reachCount,
      sentimentDelta,
      timestamp: now(),
    };

    const stages = [...narrative.stages, stage];
    const spreadVelocity = this.calculateVelocity(stages);
    const peakReach = Math.max(narrative.peakReach, reachCount);

    const updated: CollectiveNarrative = {
      ...narrative,
      stages,
      spreadVelocity,
      peakReach,
      currentPhase: phase,
      measuredAt: now(),
    };

    this.narratives.set(narrativeId, updated);
    await this.bus.publish(NARRATIVE_UPDATE_TOPIC, updated);
    return updated;
  }

  getNarrative(id: ID): CollectiveNarrative | undefined {
    return this.narratives.get(id);
  }

  getAllNarratives(): CollectiveNarrative[] {
    return Array.from(this.narratives.values());
  }

  private inferPhase(narrative: CollectiveNarrative, newReach: number): NarrativePhase {
    const lastStage = narrative.stages[narrative.stages.length - 1];
    const lastReach = lastStage?.reachCount ?? 0;
    const growth = newReach - lastReach;

    if (narrative.currentPhase === "emergence" && growth > 100) return "amplification";
    if (narrative.currentPhase === "amplification" && growth > 1000) return "distribution";
    if (narrative.currentPhase === "distribution" && growth < 100) return "saturation";
    if (narrative.currentPhase === "saturation" && growth <= 0) return "decay";
    return narrative.currentPhase;
  }

  private calculateVelocity(stages: NarrativeStage[]): number {
    if (stages.length < 2) return 0;
    const recent = stages.slice(-2);
    const dt = (recent[1]!.timestamp - recent[0]!.timestamp) / 1000; // seconds
    if (dt === 0) return 0;
    return Math.abs(recent[1]!.reachCount - recent[0]!.reachCount) / dt;
  }
}
