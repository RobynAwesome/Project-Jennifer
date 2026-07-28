/**
 * Registry – key constants for Phaser's global DataManager (game.registry).
 *
 * All cross-scene game state is stored and read through these keys so there
 * are no magic strings scattered across scene files.
 */

export const REGISTRY_KEYS = {
  /** PersonaMode selected during PersonaSelectScene */
  PERSONA: "jennifer.game.persona",
  /** Display name derived from the chosen persona */
  PLAYER_NAME: "jennifer.game.playerName",
  /** Unique session id for this play-through */
  SESSION_ID: "jennifer.game.sessionId",
  /** Last ValidationReport serialised as JSON – written by ValidationDemoScene */
  LAST_VALIDATION_REPORT: "jennifer.game.lastValidationReport",
  /** Whether the player has completed the validation mission */
  MISSION_COMPLETE: "jennifer.game.missionComplete",
  /** How many memory entries have been stored during this session */
  MEMORY_ENTRY_COUNT: "jennifer.game.memoryEntryCount",
} as const;

export type RegistryKey = (typeof REGISTRY_KEYS)[keyof typeof REGISTRY_KEYS];

// ─── Persona configuration ───────────────────────────────────────────────────

export type GamePersona = "best-friend" | "mentor" | "guide";

export interface PersonaConfig {
  id: GamePersona;
  displayName: string;
  description: string;
  color: number;
  emoji: string;
  /** Base confidence modifier applied during validation missions */
  confidenceBonus: number;
}

export const PERSONA_CONFIGS: PersonaConfig[] = [
  {
    id: "best-friend",
    displayName: "Best Friend",
    description: "Empathetic & curious. Explores the city with open eyes.",
    color: 0xa855f7,
    emoji: "💜",
    confidenceBonus: 0.05,
  },
  {
    id: "mentor",
    displayName: "Mentor",
    description: "Analytical & precise. Every claim must survive validation.",
    color: 0x6366f1,
    emoji: "🔭",
    confidenceBonus: 0.10,
  },
  {
    id: "guide",
    displayName: "City Guide",
    description: "Knowledgeable & calm. Knows every district of Jennifer City.",
    color: 0x10b981,
    emoji: "🗺️",
    confidenceBonus: 0.08,
  },
];
