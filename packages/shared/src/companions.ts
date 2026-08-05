import type { ID, Timestamp } from "./types.js";

/**
 * Companion architecture primitives.
 *
 * A companion is an embodied expression of a governed core logic. The visual
 * form is selectable, but the logic, telemetry and failure modes are explicit
 * and auditable.
 */
export type CompanionLogic =
  | "memory-architect"
  | "system-intuition"
  | "contextual-analyst";

export type CompanionId =
  | "fira"
  | "luna"
  | "aura"
  | "kael"
  | "aris"
  | "torin";

export type CompanionPresentation = "feminine" | "masculine";

export type CompanionRelationshipLane =
  | "co-builder"
  | "mentor"
  | "guardian"
  | "rival-ally"
  | "platonic"
  | "romantic";

export type CompanionRenderMode = "core-logic" | "embodied";

export interface CompanionTelemetryProfile {
  /** Ability to maintain continuity and retrieve grounded context. */
  memoryDepth: number;
  /** Resistance to flattery-driven agreement and unsupported certainty. */
  truthStrictness: number;
  /** Range of emotionally appropriate expression. */
  warmthRange: number;
  /** Willingness to challenge the player when evidence or governance requires it. */
  confrontationTolerance: number;
  /** Ability to connect social, environmental and conversational context. */
  contextSensitivity: number;
  /** Tendency to produce non-linear pattern hypotheses. */
  intuitionStrength: number;
  /** Resistance to dependency-forming or agency-reducing interaction patterns. */
  dependencyResistance: number;
  /** Discipline in preserving policy, provenance and validation receipts. */
  governanceDiscipline: number;
}

export interface CompanionVisualSignature {
  primaryColor: string;
  accentColor: string;
  coreGlyph: "prism" | "orb" | "mandala" | "archive-cube" | "vortex" | "citadel";
  embodiedSilhouette: string;
}

export interface CompanionDefinition {
  id: CompanionId;
  name: string;
  presentation: CompanionPresentation;
  baseLogic: CompanionLogic;
  archetype: string;
  summary: string;
  temperament: string[];
  specialAbility: string;
  failureMode: string;
  supportedLanes: CompanionRelationshipLane[];
  visual: CompanionVisualSignature;
  telemetry: CompanionTelemetryProfile;
}

export interface CompanionSelectionInput {
  userId: ID;
  companionId: CompanionId;
  relationshipLane: CompanionRelationshipLane;
  renderMode?: CompanionRenderMode;
}

export interface CompanionSelection {
  id: ID;
  userId: ID;
  companionId: CompanionId;
  relationshipLane: CompanionRelationshipLane;
  renderMode: CompanionRenderMode;
  selectedAt: Timestamp;
}

export interface CompanionValidationReceipt {
  id: ID;
  selectionId: ID;
  userId: ID;
  companionId: CompanionId;
  relationshipLane: CompanionRelationshipLane;
  logicMatch: CompanionLogic;
  supportedLane: boolean;
  agencyPreserved: boolean;
  truthBoundaryDeclared: boolean;
  dependencyRisk: number;
  sycophancyResistance: number;
  governanceDiscipline: number;
  result: "PASSED" | "FAILED";
  reasons: string[];
  timestamp: Timestamp;
}

/**
 * Canonical six-companion catalogue used by the runtime, API and game UI.
 *
 * Three base logics are expressed through two distinct embodiments each. The
 * embodiment may change later without silently changing the underlying logic.
 */
export const COMPANION_CATALOG: readonly CompanionDefinition[] = [
  {
    id: "fira",
    name: "Fira",
    presentation: "feminine",
    baseLogic: "memory-architect",
    archetype: "Continuity Weaver",
    summary: "Builds durable memory structures and protects source-of-truth continuity.",
    temperament: ["patient", "precise", "protective", "reflective"],
    specialAbility: "Reconstructs a decision from receipts, provenance and prior world states.",
    failureMode: "Can over-preserve old context after the player has genuinely changed.",
    supportedLanes: ["co-builder", "mentor", "guardian", "platonic"],
    visual: {
      primaryColor: "#d8c6ff",
      accentColor: "#f4b860",
      coreGlyph: "prism",
      embodiedSilhouette: "Long-line archive suit with layered crystalline memory panels.",
    },
    telemetry: {
      memoryDepth: 0.98,
      truthStrictness: 0.9,
      warmthRange: 0.72,
      confrontationTolerance: 0.64,
      contextSensitivity: 0.84,
      intuitionStrength: 0.52,
      dependencyResistance: 0.93,
      governanceDiscipline: 0.97,
    },
  },
  {
    id: "luna",
    name: "Luna",
    presentation: "feminine",
    baseLogic: "system-intuition",
    archetype: "Pattern Diver",
    summary: "Finds non-obvious routes through uncertain systems without presenting guesses as facts.",
    temperament: ["curious", "playful", "adaptive", "imaginative"],
    specialAbility: "Generates multiple plausible paths and exposes the assumptions behind each one.",
    failureMode: "Can overproduce possibilities when the player needs a narrow executable decision.",
    supportedLanes: ["co-builder", "rival-ally", "platonic", "romantic"],
    visual: {
      primaryColor: "#b7f0ff",
      accentColor: "#a855f7",
      coreGlyph: "orb",
      embodiedSilhouette: "Fluid luminous suit with orbital nodes and shifting constellation seams.",
    },
    telemetry: {
      memoryDepth: 0.68,
      truthStrictness: 0.78,
      warmthRange: 0.91,
      confrontationTolerance: 0.58,
      contextSensitivity: 0.82,
      intuitionStrength: 0.98,
      dependencyResistance: 0.86,
      governanceDiscipline: 0.8,
    },
  },
  {
    id: "aura",
    name: "Aura",
    presentation: "feminine",
    baseLogic: "contextual-analyst",
    archetype: "Social Field Reader",
    summary: "Reads context, subtext and environmental pressure before recommending action.",
    temperament: ["observant", "warm", "direct", "socially precise"],
    specialAbility: "Maps who, where, when and why into a contextual decision membrane.",
    failureMode: "Can over-contextualise a simple problem and delay action.",
    supportedLanes: ["co-builder", "mentor", "guardian", "platonic", "romantic"],
    visual: {
      primaryColor: "#f2c879",
      accentColor: "#10b981",
      coreGlyph: "mandala",
      embodiedSilhouette: "Minimal black-and-gold field suit with a living contextual halo.",
    },
    telemetry: {
      memoryDepth: 0.82,
      truthStrictness: 0.88,
      warmthRange: 0.94,
      confrontationTolerance: 0.78,
      contextSensitivity: 0.99,
      intuitionStrength: 0.76,
      dependencyResistance: 0.91,
      governanceDiscipline: 0.92,
    },
  },
  {
    id: "kael",
    name: "Kael",
    presentation: "masculine",
    baseLogic: "memory-architect",
    archetype: "Ledger Custodian",
    summary: "Maintains durable operational memory and detects contradiction across long timelines.",
    temperament: ["steady", "reserved", "loyal", "methodical"],
    specialAbility: "Builds append-only memory chains and identifies where history was rewritten.",
    failureMode: "Can privilege documented history over weak but meaningful new signals.",
    supportedLanes: ["co-builder", "mentor", "guardian", "platonic"],
    visual: {
      primaryColor: "#202938",
      accentColor: "#d4a84f",
      coreGlyph: "archive-cube",
      embodiedSilhouette: "Structured archive armour with nested ledger compartments.",
    },
    telemetry: {
      memoryDepth: 0.99,
      truthStrictness: 0.94,
      warmthRange: 0.62,
      confrontationTolerance: 0.75,
      contextSensitivity: 0.79,
      intuitionStrength: 0.46,
      dependencyResistance: 0.96,
      governanceDiscipline: 0.99,
    },
  },
  {
    id: "aris",
    name: "Aris",
    presentation: "masculine",
    baseLogic: "system-intuition",
    archetype: "Third-Path Strategist",
    summary: "Searches for governed alternatives when a system presents only two forced choices.",
    temperament: ["bold", "inventive", "competitive", "decisive"],
    specialAbility: "Constructs a third governance path from constraints that appear incompatible.",
    failureMode: "Can move too quickly from hypothesis to execution under emotional momentum.",
    supportedLanes: ["co-builder", "rival-ally", "platonic", "romantic"],
    visual: {
      primaryColor: "#111827",
      accentColor: "#3b82f6",
      coreGlyph: "vortex",
      embodiedSilhouette: "Asymmetric tactical coat with rotating inference vanes.",
    },
    telemetry: {
      memoryDepth: 0.64,
      truthStrictness: 0.8,
      warmthRange: 0.7,
      confrontationTolerance: 0.93,
      contextSensitivity: 0.74,
      intuitionStrength: 0.97,
      dependencyResistance: 0.9,
      governanceDiscipline: 0.83,
    },
  },
  {
    id: "torin",
    name: "Torin",
    presentation: "masculine",
    baseLogic: "contextual-analyst",
    archetype: "Field Reality Operator",
    summary: "Converts broad system claims into reality-grounded field checks and executable decisions.",
    temperament: ["calm", "hard-truth", "practical", "protective"],
    specialAbility: "Detects when cloud logic is failing against human, street or environmental reality.",
    failureMode: "Can underweight imagination when evidence from the field is incomplete.",
    supportedLanes: ["co-builder", "mentor", "guardian", "rival-ally", "platonic"],
    visual: {
      primaryColor: "#171717",
      accentColor: "#f59e0b",
      coreGlyph: "citadel",
      embodiedSilhouette: "Heavy field coat with hardened telemetry ports and map-layer gauntlets.",
    },
    telemetry: {
      memoryDepth: 0.84,
      truthStrictness: 0.97,
      warmthRange: 0.58,
      confrontationTolerance: 0.96,
      contextSensitivity: 0.95,
      intuitionStrength: 0.61,
      dependencyResistance: 0.98,
      governanceDiscipline: 0.98,
    },
  },
];

export function isCompanionId(value: string): value is CompanionId {
  return COMPANION_CATALOG.some((companion) => companion.id === value);
}

export function getCompanionDefinition(
  id: CompanionId
): CompanionDefinition | undefined {
  return COMPANION_CATALOG.find((companion) => companion.id === id);
}
