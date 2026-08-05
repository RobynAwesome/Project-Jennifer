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
  VALIDATION_DEMO: "ValidationDemo",
} as const;

export type SceneKey = (typeof SCENE_KEYS)[keyof typeof SCENE_KEYS];

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
