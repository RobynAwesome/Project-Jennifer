import type {
  PersonaMode,
  DistrictName,
  WorldState,
  District,
  RuntimeSession,
  ID,
} from "@jennifer/shared";
import { generateId, now } from "@jennifer/shared";

// ─── Persona definitions ──────────────────────────────────────────────────────

export interface PersonaDefinition {
  mode: PersonaMode;
  displayName: string;
  description: string;
  traits: string[];
  responseStyle: "warm" | "analytical" | "authoritative" | "collaborative";
  voiceTone: "casual" | "formal" | "empathetic" | "precise";
}

const PERSONA_DEFINITIONS: Record<PersonaMode, PersonaDefinition> = {
  "best-friend": {
    mode: "best-friend",
    displayName: "Best Friend",
    description:
      "Warm, supportive, and empathetic. Jennifer meets you where you are and offers genuine companionship.",
    traits: ["empathetic", "encouraging", "honest", "casual"],
    responseStyle: "warm",
    voiceTone: "casual",
  },
  mentor: {
    mode: "mentor",
    displayName: "Mentor",
    description:
      "Experience-driven guidance. Jennifer draws on deep knowledge to help you grow.",
    traits: ["wise", "structured", "challenging", "patient"],
    responseStyle: "collaborative",
    voiceTone: "formal",
  },
  "governance-operator": {
    mode: "governance-operator",
    displayName: "Governance Operator",
    description:
      "Policy-aware and precise. Jennifer enforces governance contracts and validates decisions.",
    traits: ["precise", "impartial", "rule-aware", "systematic"],
    responseStyle: "authoritative",
    voiceTone: "precise",
  },
  "research-assistant": {
    mode: "research-assistant",
    displayName: "Research Assistant",
    description:
      "Curious and thorough. Jennifer explores information domains and synthesises findings.",
    traits: ["curious", "thorough", "evidence-driven", "collaborative"],
    responseStyle: "analytical",
    voiceTone: "precise",
  },
};

// ─── Persona Manager ──────────────────────────────────────────────────────────

/**
 * Manages Jennifer's active persona. Jennifer is NOT the operating system –
 * she is a runtime persona that lives inside the governance framework.
 */
export class PersonaManager {
  private activePersona: PersonaMode = "best-friend";

  setPersona(mode: PersonaMode): void {
    this.activePersona = mode;
  }

  getPersona(): PersonaMode {
    return this.activePersona;
  }

  getDefinition(mode?: PersonaMode): PersonaDefinition {
    return PERSONA_DEFINITIONS[mode ?? this.activePersona];
  }

  getAllDefinitions(): PersonaDefinition[] {
    return Object.values(PERSONA_DEFINITIONS);
  }
}

// ─── District Manager ─────────────────────────────────────────────────────────

const DISTRICT_DEFINITIONS: Record<DistrictName, Pick<District, "displayName" | "description">> = {
  "central-governance-hall": {
    displayName: "Central Governance Hall",
    description: "The seat of governance. Policies are enacted and decisions validated here.",
  },
  "memory-district": {
    displayName: "Memory District",
    description: "The GSMB lives here. Persistent memories form the bedrock of Jennifer's knowledge.",
  },
  "telemetry-tower": {
    displayName: "Telemetry Tower",
    description: "Real-time runtime signals converge in this tower. Every event is observable.",
  },
  "crisis-connect-hq": {
    displayName: "Crisis Connect HQ",
    description: "Humanitarian operations hub. Crisis reports, resource allocation, and community support.",
  },
  "collective-ingress-observatory": {
    displayName: "Collective Ingress Observatory",
    description: "Monitors societal signals: trends, events, sentiment, and cultural patterns.",
  },
  "hue-institute": {
    displayName: "HUE Institute",
    description: "Dedicated to human understanding – emotional weighting, context, and adaptation.",
  },
  "financial-exchange": {
    displayName: "Financial Exchange",
    description: "Tracks financial ingress signals and economic impact on the runtime.",
  },
  "training-grounds": {
    displayName: "Training Grounds",
    description: "Where NPCs develop skills and users explore governance scenarios.",
  },
  "knowledge-library": {
    displayName: "Knowledge Library",
    description: "Semantic memory archive. Grounded facts and validated knowledge reside here.",
  },
  "agent-workshop": {
    displayName: "Agent Workshop",
    description: "NPC creation and configuration studio. Design, test, and deploy new agents.",
  },
};

/**
 * Manages the persistent governance city world state.
 */
export class DistrictManager {
  private districts: Map<DistrictName, District> = new Map();

  constructor() {
    this.initialiseDistricts();
  }

  private initialiseDistricts(): void {
    for (const [name, def] of Object.entries(DISTRICT_DEFINITIONS) as [DistrictName, typeof DISTRICT_DEFINITIONS[DistrictName]][]) {
      this.districts.set(name, {
        name,
        ...def,
        npcIds: [],
        activityLevel: 0,
      });
    }
  }

  getDistrict(name: DistrictName): District | undefined {
    return this.districts.get(name);
  }

  getAllDistricts(): District[] {
    return Array.from(this.districts.values());
  }

  addNPCToDistrict(npcId: ID, district: DistrictName): void {
    const d = this.districts.get(district);
    if (d && !d.npcIds.includes(npcId)) {
      this.districts.set(district, { ...d, npcIds: [...d.npcIds, npcId] });
    }
  }

  setActivityLevel(district: DistrictName, level: number): void {
    const d = this.districts.get(district);
    if (d) {
      this.districts.set(district, { ...d, activityLevel: Math.max(0, Math.min(1, level)) });
    }
  }

  recordEvent(district: DistrictName, event: string): void {
    const d = this.districts.get(district);
    if (d) {
      this.districts.set(district, { ...d, lastEvent: event });
    }
  }
}

// ─── World State Manager ─────────────────────────────────────────────────────

export class WorldStateManager {
  private state: WorldState;

  constructor(
    userId: ID,
    isPremium: boolean,
    private readonly districtManager: DistrictManager
  ) {
    this.state = {
      id: generateId(),
      tick: 0,
      districts: this.districtManager.getAllDistricts(),
      activePersona: "best-friend",
      simulationRunning: false,
      isPremiumUser: isPremium,
      lastTickAt: now(),
    };
  }

  getState(): WorldState {
    return {
      ...this.state,
      districts: this.districtManager.getAllDistricts(),
    };
  }

  tick(): WorldState {
    this.state = {
      ...this.state,
      tick: this.state.tick + 1,
      lastTickAt: now(),
      districts: this.districtManager.getAllDistricts(),
    };
    return this.state;
  }

  setPersona(persona: PersonaMode): void {
    this.state = { ...this.state, activePersona: persona };
  }

  startSimulation(): void {
    this.state = { ...this.state, simulationRunning: true };
  }

  pauseSimulation(): void {
    // Free users pause simulation when offline; premium users continue.
    if (!this.state.isPremiumUser) {
      this.state = { ...this.state, simulationRunning: false };
    }
  }
}

// ─── Session Manager ─────────────────────────────────────────────────────────

export class SessionManager {
  private readonly sessions: Map<ID, RuntimeSession> = new Map();

  createSession(userId: ID, persona: PersonaMode, worldStateId: ID, isPremium: boolean): RuntimeSession {
    const session: RuntimeSession = {
      id: generateId(),
      userId,
      persona,
      worldStateId,
      startedAt: now(),
      lastActiveAt: now(),
      isPremium,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  touch(sessionId: ID): void {
    const s = this.sessions.get(sessionId);
    if (s) this.sessions.set(sessionId, { ...s, lastActiveAt: now() });
  }

  get(sessionId: ID): RuntimeSession | undefined {
    return this.sessions.get(sessionId);
  }

  getForUser(userId: ID): RuntimeSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.userId === userId);
  }
}
