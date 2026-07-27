import type {
  HumanState,
  BehavioralProfile,
  BehavioralAdaptation,
  EmotionalState,
  PersonaMode,
  ID,
} from "@jennifer/shared";
import { generateId, now, clamp } from "@jennifer/shared";

/**
 * Human Understanding Engine (HUE)
 *
 * Maintains a model of the human's current state – emotional tone,
 * engagement level, and stress – and uses it to adapt Jennifer's
 * persona and response strategies.
 */

// ─── Human State Abstractor ───────────────────────────────────────────────────

export class HumanStateAbstractor {
  private readonly states: Map<ID, HumanState> = new Map();

  getState(userId: ID): HumanState {
    return (
      this.states.get(userId) ?? {
        userId,
        emotionalState: "neutral",
        engagementScore: 0.5,
        stressLevel: 0.0,
        contextWeight: 1.0,
        lastUpdated: now(),
      }
    );
  }

  updateState(userId: ID, patch: Partial<Omit<HumanState, "userId" | "lastUpdated">>): HumanState {
    const current = this.getState(userId);
    const updated: HumanState = {
      ...current,
      ...patch,
      engagementScore: clamp(patch.engagementScore ?? current.engagementScore, 0, 1),
      stressLevel: clamp(patch.stressLevel ?? current.stressLevel, 0, 1),
      contextWeight: clamp(patch.contextWeight ?? current.contextWeight, 0, 2),
      lastUpdated: now(),
    };
    this.states.set(userId, updated);
    return updated;
  }

  /**
   * Infers emotional state from engagement and stress levels.
   */
  inferEmotionalState(engagementScore: number, stressLevel: number): EmotionalState {
    if (stressLevel > 0.7) return "anxious";
    if (stressLevel > 0.5 && engagementScore < 0.3) return "frustrated";
    if (engagementScore > 0.8 && stressLevel < 0.2) return "confident";
    if (engagementScore > 0.7) return "engaged";
    if (engagementScore > 0.5) return "curious";
    if (engagementScore < 0.3) return "negative";
    return "neutral";
  }
}

// ─── Emotional Weighter ───────────────────────────────────────────────────────

const EMOTIONAL_WEIGHTS: Record<EmotionalState, number> = {
  neutral: 1.0,
  positive: 1.2,
  curious: 1.15,
  engaged: 1.1,
  confident: 1.05,
  negative: 0.8,
  frustrated: 0.75,
  anxious: 0.7,
};

export class EmotionalWeighter {
  /**
   * Returns a weight modifier based on the user's emotional state.
   * Used to amplify or dampen response verbosity, tone, and pacing.
   */
  getWeight(emotionalState: EmotionalState): number {
    return EMOTIONAL_WEIGHTS[emotionalState] ?? 1.0;
  }

  /**
   * Selects the most appropriate persona given emotional state.
   */
  recommendPersona(state: HumanState): PersonaMode {
    if (state.stressLevel > 0.6) return "best-friend";
    if (state.emotionalState === "curious" || state.emotionalState === "engaged") {
      return "research-assistant";
    }
    if (state.emotionalState === "confident") return "mentor";
    return "governance-operator";
  }
}

// ─── Context Weighter ─────────────────────────────────────────────────────────

export class ContextWeighter {
  /**
   * Computes a context relevance weight for a memory or piece of information
   * given the user's current state and active persona.
   */
  computeWeight(params: {
    recencyMs: number;
    importance: number;
    emotionalWeight: number;
    userContextWeight: number;
  }): number {
    const RECENCY_HALF_LIFE_MS = 3 * 60 * 60 * 1000; // 3 hours
    const recencyDecay = Math.exp(
      (-Math.LN2 * params.recencyMs) / RECENCY_HALF_LIFE_MS
    );

    return clamp(
      params.importance * recencyDecay * params.emotionalWeight * params.userContextWeight,
      0,
      2
    );
  }
}

// ─── Behavioral Adapter ───────────────────────────────────────────────────────

export class BehavioralAdapter {
  private readonly profiles: Map<ID, BehavioralProfile> = new Map();

  getProfile(userId: ID): BehavioralProfile {
    return (
      this.profiles.get(userId) ?? {
        userId,
        preferences: {},
        adaptations: [],
        interactionHistory: 0,
        updatedAt: now(),
      }
    );
  }

  recordInteraction(userId: ID): void {
    const profile = this.getProfile(userId);
    this.profiles.set(userId, {
      ...profile,
      interactionHistory: profile.interactionHistory + 1,
      updatedAt: now(),
    });
  }

  addAdaptation(userId: ID, adaptation: Omit<BehavioralAdaptation, never>): void {
    const profile = this.getProfile(userId);

    // Merge with existing adaptation for the same trigger.
    const existing = profile.adaptations.findIndex((a) => a.trigger === adaptation.trigger);
    const adaptations = [...profile.adaptations];

    if (existing >= 0) {
      adaptations[existing] = adaptation;
    } else {
      adaptations.push(adaptation);
    }

    this.profiles.set(userId, { ...profile, adaptations, updatedAt: now() });
  }

  setPreference(userId: ID, key: string, value: unknown): void {
    const profile = this.getProfile(userId);
    this.profiles.set(userId, {
      ...profile,
      preferences: { ...profile.preferences, [key]: value },
      updatedAt: now(),
    });
  }
}
