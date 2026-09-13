import type Phaser from "phaser";

/** Scene objects are invalid after shutdown or a resize-restart. */
export function sceneIsLive(scene: Phaser.Scene): boolean {
  return scene.sys.isActive() && scene.cameras.main !== undefined;
}

export function fadeToIfLive(
  scene: Phaser.Scene,
  next: () => void,
  duration = 300,
): void {
  if (!sceneIsLive(scene)) return;
  const camera = scene.cameras.main;
  camera.fadeOut(duration, 0, 0, 0);
  camera.once("camerafadeoutcomplete", () => {
    if (!scene.sys.isActive()) return;
    next();
  });
}
