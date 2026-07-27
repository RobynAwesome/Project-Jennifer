// Core entity types for Project Jennifer

export type ID = string;
export type Timestamp = number; // Unix epoch ms

// ─── Governance ──────────────────────────────────────────────────────────────

export type PolicyEffect = "allow" | "deny" | "escalate";

export interface Policy {
  id: ID;
  name: string;
  description: string;
  effect: PolicyEffect;
  conditions: Record<string, unknown>;
  priority: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Permission {
  id: ID;
  subject: string;
  action: string;
  resource: string;
  effect: PolicyEffect;
  metadata: Record<string, unknown>;
}

export interface SemanticContract {
  id: ID;
  name: string;
  version: string;
  inputs: ContractField[];
  outputs: ContractField[];
  constraints: string[];
  createdAt: Timestamp;
}

export interface ContractField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface GovernanceDecision {
  id: ID;
  requestId: ID;
  policyId: ID;
  effect: PolicyEffect;
  reasoning: string;
  confidence: number;
  timestamp: Timestamp;
}

// ─── Telemetry ────────────────────────────────────────────────────────────────

export type TelemetryEventKind =
  | "user.action"
  | "system.event"
  | "environment.change"
  | "runtime.state"
  | "governance.decision"
  | "memory.operation"
  | "validation.result"
  | "npc.action"
  | "world.event";

export interface TelemetryEvent {
  id: ID;
  kind: TelemetryEventKind;
  source: string;
  payload: Record<string, unknown>;
  sessionId?: ID;
  agentId?: ID;
  timestamp: Timestamp;
}

// ─── Memory (GSMB) ───────────────────────────────────────────────────────────

export type MemoryKind =
  | "episodic"
  | "semantic"
  | "procedural"
  | "working"
  | "collective";

export interface MemoryEntry {
  id: ID;
  kind: MemoryKind;
  subject: string;
  content: unknown;
  tags: string[];
  confidence: number;
  importance: number;
  createdAt: Timestamp;
  accessedAt: Timestamp;
  expiresAt?: Timestamp;
}

export interface MemoryQuery {
  subject?: string;
  tags?: string[];
  kind?: MemoryKind;
  minConfidence?: number;
  limit?: number;
  before?: Timestamp;
  after?: Timestamp;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export type ValidationStatus = "passed" | "failed" | "warning" | "pending";

export interface ValidationResult {
  id: ID;
  ruleId: string;
  status: ValidationStatus;
  confidence: number;
  message: string;
  details: Record<string, unknown>;
  timestamp: Timestamp;
}

export interface ValidationReport {
  id: ID;
  requestId: ID;
  status: ValidationStatus;
  results: ValidationResult[];
  overallConfidence: number;
  failedAt?: Timestamp;
  completedAt: Timestamp;
}

// ─── HUE (Human Understanding Engine) ────────────────────────────────────────

export type EmotionalState =
  | "neutral"
  | "positive"
  | "negative"
  | "anxious"
  | "engaged"
  | "frustrated"
  | "curious"
  | "confident";

export interface HumanState {
  userId: ID;
  emotionalState: EmotionalState;
  engagementScore: number;
  stressLevel: number;
  contextWeight: number;
  lastUpdated: Timestamp;
}

export interface BehavioralProfile {
  userId: ID;
  preferences: Record<string, unknown>;
  adaptations: BehavioralAdaptation[];
  interactionHistory: number;
  updatedAt: Timestamp;
}

export interface BehavioralAdaptation {
  trigger: string;
  response: string;
  weight: number;
}

// ─── Collective Ingress ───────────────────────────────────────────────────────

export type IngressCategory =
  | "holiday"
  | "cultural"
  | "sporting"
  | "financial"
  | "geographic"
  | "weather"
  | "trend"
  | "sentiment";

export interface IngressEvent {
  id: ID;
  category: IngressCategory;
  title: string;
  description: string;
  region?: string;
  magnitude: number; // 0.0 - 1.0 societal impact
  sentiment: number; // -1.0 (negative) to 1.0 (positive)
  source: string;
  detectedAt: Timestamp;
  validUntil?: Timestamp;
}

// Collective Perception Protocol (CCPP)
export interface CollectiveNarrative {
  id: ID;
  originEventId: ID;
  stages: NarrativeStage[];
  spreadVelocity: number;
  peakReach: number;
  currentPhase: NarrativePhase;
  measuredAt: Timestamp;
}

export type NarrativePhase =
  | "emergence"
  | "amplification"
  | "distribution"
  | "saturation"
  | "decay";

export interface NarrativeStage {
  phase: NarrativePhase;
  reachCount: number;
  sentimentDelta: number;
  timestamp: Timestamp;
}

// ─── Crisis Connect ───────────────────────────────────────────────────────────

export type CrisisCategory =
  | "community"
  | "public-service"
  | "employment"
  | "accessibility"
  | "local-governance";

export type CrisisSeverity = "low" | "medium" | "high" | "critical";

export interface CrisisRecord {
  id: ID;
  category: CrisisCategory;
  severity: CrisisSeverity;
  title: string;
  description: string;
  affectedRegion: string;
  affectedPopulation?: number;
  reportedAt: Timestamp;
  resolvedAt?: Timestamp;
  responseActions: ResponseAction[];
}

export interface ResponseAction {
  id: ID;
  crisisId: ID;
  type: string;
  description: string;
  assignedTo?: string;
  status: "pending" | "active" | "completed";
  createdAt: Timestamp;
}

// ─── NPC ─────────────────────────────────────────────────────────────────────

export type NPCPersonalityTrait =
  | "helpful"
  | "cautious"
  | "ambitious"
  | "empathetic"
  | "analytical"
  | "creative";

export interface NPCProfile {
  id: ID;
  name: string;
  role: string;
  district: DistrictName;
  personality: NPCPersonalityTrait[];
  goals: string[];
  relationships: NPCRelationship[];
  createdAt: Timestamp;
}

export interface NPCRelationship {
  targetId: ID;
  type: "ally" | "rival" | "neutral" | "mentor" | "mentee";
  trust: number; // 0.0 - 1.0
  history: string[];
}

// ─── Runtime / World ──────────────────────────────────────────────────────────

export type PersonaMode =
  | "best-friend"
  | "mentor"
  | "governance-operator"
  | "research-assistant";

export type DistrictName =
  | "central-governance-hall"
  | "memory-district"
  | "telemetry-tower"
  | "crisis-connect-hq"
  | "collective-ingress-observatory"
  | "hue-institute"
  | "financial-exchange"
  | "training-grounds"
  | "knowledge-library"
  | "agent-workshop";

export interface WorldState {
  id: ID;
  tick: number;
  districts: District[];
  activePersona: PersonaMode;
  simulationRunning: boolean;
  isPremiumUser: boolean;
  lastTickAt: Timestamp;
}

export interface District {
  name: DistrictName;
  displayName: string;
  description: string;
  npcIds: ID[];
  activityLevel: number; // 0.0 - 1.0
  lastEvent?: string;
}

export interface RuntimeSession {
  id: ID;
  userId: ID;
  persona: PersonaMode;
  worldStateId: ID;
  startedAt: Timestamp;
  lastActiveAt: Timestamp;
  isPremium: boolean;
}
