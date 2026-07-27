import type {
  NPCProfile,
  NPCRelationship,
  NPCPersonalityTrait,
  DistrictName,
  MemoryEntry,
  ID,
} from "@jennifer/shared";
import { generateId, now, clamp } from "@jennifer/shared";
import type { IMemoryStore } from "@jennifer/memory";
import type { TelemetryCollector } from "@jennifer/telemetry";

// ─── NPC Goal ─────────────────────────────────────────────────────────────────

export interface NPCGoal {
  id: ID;
  npcId: ID;
  description: string;
  priority: number; // 0-1
  progress: number; // 0-1
  completedAt?: number;
}

// ─── NPC Awareness ────────────────────────────────────────────────────────────

export interface LocalAwarenessSnapshot {
  npcId: ID;
  district: DistrictName;
  nearbyNpcIds: ID[];
  recentEvents: string[];
  environmentalTone: number; // -1 to 1
  capturedAt: number;
}

/**
 * Maintains a local awareness window for an NPC. Unlike scripted NPCs,
 * awareness is built from telemetry events and memory queries – giving
 * each NPC an emergent understanding of its environment.
 */
export class AwarenessEngine {
  private snapshots: Map<ID, LocalAwarenessSnapshot> = new Map();

  updateAwareness(
    npcId: ID,
    district: DistrictName,
    nearbyNpcIds: ID[],
    recentEvents: string[],
    environmentalTone: number
  ): LocalAwarenessSnapshot {
    const snapshot: LocalAwarenessSnapshot = {
      npcId,
      district,
      nearbyNpcIds,
      recentEvents: recentEvents.slice(-10), // keep last 10
      environmentalTone: clamp(environmentalTone, -1, 1),
      capturedAt: now(),
    };
    this.snapshots.set(npcId, snapshot);
    return snapshot;
  }

  getAwareness(npcId: ID): LocalAwarenessSnapshot | undefined {
    return this.snapshots.get(npcId);
  }
}

// ─── Relationship Graph ───────────────────────────────────────────────────────

/**
 * Tracks social relationships between NPCs. Relationships evolve over
 * time based on interactions – they are never hardcoded.
 */
export class RelationshipGraph {
  private readonly graph = new Map<string, NPCRelationship>();

  private key(fromId: ID, toId: ID): string {
    return `${fromId}→${toId}`;
  }

  setRelationship(fromId: ID, relationship: NPCRelationship): void {
    this.graph.set(this.key(fromId, relationship.targetId), relationship);
  }

  getRelationship(fromId: ID, toId: ID): NPCRelationship | undefined {
    return this.graph.get(this.key(fromId, toId));
  }

  adjustTrust(fromId: ID, toId: ID, delta: number): NPCRelationship | undefined {
    const rel = this.getRelationship(fromId, toId);
    if (!rel) return undefined;

    const updated: NPCRelationship = {
      ...rel,
      trust: clamp(rel.trust + delta, 0, 1),
    };
    this.graph.set(this.key(fromId, toId), updated);
    return updated;
  }

  getRelationshipsFor(npcId: ID): NPCRelationship[] {
    const result: NPCRelationship[] = [];
    for (const [key, rel] of this.graph.entries()) {
      if (key.startsWith(`${npcId}→`)) result.push(rel);
    }
    return result;
  }
}

// ─── NPC Agent ────────────────────────────────────────────────────────────────

/**
 * Core NPC agent. Each NPC is a self-contained agent with:
 * - Local awareness (environment, nearby NPCs)
 * - Personal memory (episodic + semantic)
 * - Individual goals (priority-ordered, tracked over time)
 * - Relationship graph (trust-weighted, evolving)
 * - Telemetry emission (all actions are observable)
 *
 * NPCs are NOT scripted. Behaviour emerges from goal prioritisation,
 * memory context, and environmental signals.
 */
export class NPCAgent {
  readonly profile: NPCProfile;
  private goals: NPCGoal[] = [];

  constructor(
    profile: Omit<NPCProfile, "id" | "createdAt">,
    private readonly memory: IMemoryStore,
    private readonly telemetry: TelemetryCollector,
    private readonly awareness: AwarenessEngine,
    private readonly relationships: RelationshipGraph
  ) {
    this.profile = {
      ...profile,
      id: generateId(),
      createdAt: now(),
    };
  }

  // ─── Goals ──────────────────────────────────────────────────────────────────

  addGoal(description: string, priority: number): NPCGoal {
    const goal: NPCGoal = {
      id: generateId(),
      npcId: this.profile.id,
      description,
      priority: clamp(priority, 0, 1),
      progress: 0,
    };
    this.goals.push(goal);
    this.goals.sort((a, b) => b.priority - a.priority);
    return goal;
  }

  advanceGoal(goalId: ID, progressDelta: number): NPCGoal | undefined {
    const goal = this.goals.find((g) => g.id === goalId);
    if (!goal) return undefined;

    goal.progress = clamp(goal.progress + progressDelta, 0, 1);
    if (goal.progress >= 1) goal.completedAt = now();
    return goal;
  }

  getActiveGoals(): NPCGoal[] {
    return this.goals.filter((g) => !g.completedAt);
  }

  getCurrentGoal(): NPCGoal | undefined {
    return this.getActiveGoals()[0];
  }

  // ─── Memory ─────────────────────────────────────────────────────────────────

  async remember(content: unknown, tags: string[] = []): Promise<MemoryEntry> {
    return this.memory.store({
      kind: "episodic",
      subject: this.profile.id,
      content,
      tags: ["npc", this.profile.id, ...tags],
      confidence: 1.0,
      importance: 0.5,
    });
  }

  async recall(tags: string[]): Promise<MemoryEntry[]> {
    return this.memory.query({ subject: this.profile.id, tags, limit: 10 });
  }

  // ─── Tick (simulation step) ──────────────────────────────────────────────────

  /**
   * Called each simulation tick. The NPC evaluates its current goal,
   * environment, and relationships to determine its next action.
   * Returns a human-readable description of what the NPC did.
   */
  async tick(): Promise<string> {
    const goal = this.getCurrentGoal();
    const awareness = this.awareness.getAwareness(this.profile.id);

    const action = goal
      ? `${this.profile.name} works toward: "${goal.description}" (${Math.round(goal.progress * 100)}%)`
      : `${this.profile.name} is idle in ${this.profile.district}`;

    await this.telemetry.emit(
      "npc.action",
      `npc:${this.profile.id}`,
      {
        npcId: this.profile.id,
        action,
        goalId: goal?.id,
        district: this.profile.district,
        nearbyNpcs: awareness?.nearbyNpcIds ?? [],
      }
    );

    await this.remember({ action, tick: now() }, ["tick"]);
    return action;
  }
}

// ─── NPC Registry ────────────────────────────────────────────────────────────

/**
 * Manages all NPC agents and drives the simulation tick.
 * Premium users run the tick loop when offline; free users pause it.
 */
export class NPCRegistry {
  private readonly agents: Map<ID, NPCAgent> = new Map();
  private tickInterval: ReturnType<typeof setInterval> | null = null;

  register(agent: NPCAgent): void {
    this.agents.set(agent.profile.id, agent);
  }

  get(id: ID): NPCAgent | undefined {
    return this.agents.get(id);
  }

  getAll(): NPCAgent[] {
    return Array.from(this.agents.values());
  }

  getByDistrict(district: DistrictName): NPCAgent[] {
    return this.getAll().filter((a) => a.profile.district === district);
  }

  /**
   * Runs one simulation tick across all registered NPCs.
   */
  async tick(): Promise<string[]> {
    const actions: string[] = [];
    for (const agent of this.agents.values()) {
      actions.push(await agent.tick());
    }
    return actions;
  }

  /**
   * Starts continuous simulation for premium users.
   * Free users must call `tick()` manually.
   */
  startContinuousSimulation(intervalMs = 5000): void {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => {
      void this.tick();
    }, intervalMs);
  }

  stopSimulation(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
}
