import type Phaser from "phaser";

/**
 * SceneManager – scene key constants and helper methods for transitions.
 *
 * Wrap this around `scene.scene` to keep all scene transitions type-safe and
 * free of magic strings. Instantiate once per scene and store as a property.
 */

export const SCENE_KEYS = {
  BOOT: "Boot",
  START_MENU: "StartMenu",
  PERSONA_SELECT: "PersonaSelect",
  COMPANION_SELECT: "CompanionSelect",
  GOVERNANCE_HALL: "GovernanceHall",
  MEMORY_DISTRICT: "MemoryDistrict",
  TELEMETRY_TOWER: "TelemetryTower",
  OBSERVATION_DISTRICT: "ObservationDistrict",
  VALIDATION_DEMO: "ValidationDemo",
  THIRD_SIGNAL_EPISODE: "ThirdSignalEpisode",
  KPGS_THREE_CLASSROOM: "KpgsThreeClassroom",
} as const;

export type SceneKey = (typeof SCENE_KEYS)[keyof typeof SCENE_KEYS];

/** Only districts with an admitted Phaser scene belong here. */
export const DISTRICT_SCENE_KEYS: Record<string, SceneKey> = {
  "memory-district": SCENE_KEYS.MEMORY_DISTRICT,
  "telemetry-tower": SCENE_KEYS.TELEMETRY_TOWER,
  "crisis-connect-hq": SCENE_KEYS.OBSERVATION_DISTRICT,
  "collective-ingress-observatory": SCENE_KEYS.OBSERVATION_DISTRICT,
  "hue-institute": SCENE_KEYS.OBSERVATION_DISTRICT,
  "financial-exchange": SCENE_KEYS.OBSERVATION_DISTRICT,
  "training-grounds": SCENE_KEYS.OBSERVATION_DISTRICT,
  "knowledge-library": SCENE_KEYS.OBSERVATION_DISTRICT,
  "agent-workshop": SCENE_KEYS.OBSERVATION_DISTRICT,
};

export class SceneManager {
  constructor(private readonly scene: Phaser.Scene) {}

  goTo(key: SceneKey, data?: Record<string, unknown>): void {
    this.scene.scene.start(key, data);
  }

  launchOverlay(key: SceneKey, data?: Record<string, unknown>): void {
    this.scene.scene.launch(key, data);
    this.scene.scene.bringToTop(key);
  }

  pauseAndLaunch(key: SceneKey, data?: Record<string, unknown>): void {
    this.scene.scene.pause();
    this.launchOverlay(key, data);
  }

  closeOverlay(returnToKey: SceneKey): void {
    this.scene.scene.stop();
    this.scene.scene.resume(returnToKey);
  }

  sleep(): void {
    this.scene.scene.sleep();
  }

  wake(key: SceneKey): void {
    this.scene.scene.wake(key);
  }
}
