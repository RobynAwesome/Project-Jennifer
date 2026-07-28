import type Phaser from "phaser";

/**
 * SceneManager – scene key constants and helper methods for transitions.
 *
 * Wrap this around `scene.scene` to keep all scene transitions type-safe and
 * free of magic strings.  Instantiate once per scene and store as a property.
 */

// ─── Scene key registry ──────────────────────────────────────────────────────

export const SCENE_KEYS = {
  BOOT: "Boot",
  START_MENU: "StartMenu",
  PERSONA_SELECT: "PersonaSelect",
  GOVERNANCE_HALL: "GovernanceHall",
  MEMORY_DISTRICT: "MemoryDistrict",
  VALIDATION_DEMO: "ValidationDemo",
} as const;

export type SceneKey = (typeof SCENE_KEYS)[keyof typeof SCENE_KEYS];

// ─── Manager class ───────────────────────────────────────────────────────────

export class SceneManager {
  constructor(private readonly scene: Phaser.Scene) {}

  /**
   * Stop the current scene and start another, passing optional data.
   */
  goTo(key: SceneKey, data?: Record<string, unknown>): void {
    this.scene.scene.start(key, data);
  }

  /**
   * Launch a second scene on top without stopping the current one.
   * The launched scene renders above the caller.
   */
  launchOverlay(key: SceneKey, data?: Record<string, unknown>): void {
    this.scene.scene.launch(key, data);
    this.scene.scene.bringToTop(key);
  }

  /**
   * Pause the current scene (freezes update + render) and launch an overlay.
   */
  pauseAndLaunch(key: SceneKey, data?: Record<string, unknown>): void {
    this.scene.scene.pause();
    this.launchOverlay(key, data);
  }

  /**
   * Stop the current overlay scene and resume the scene that launched it.
   */
  closeOverlay(returnToKey: SceneKey): void {
    this.scene.scene.stop();
    this.scene.scene.resume(returnToKey);
  }

  /**
   * Put the current scene to sleep (hidden, update still runs).
   */
  sleep(): void {
    this.scene.scene.sleep();
  }

  /**
   * Wake a sleeping scene.
   */
  wake(key: SceneKey): void {
    this.scene.scene.wake(key);
  }
}
