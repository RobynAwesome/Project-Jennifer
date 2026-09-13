import type Phaser from "phaser";

/**
 * Menus may rebuild on a real window size change. Gameplay scenes must not:
 * a restart mid-await destroys cameras and canvas frames (drawImage/fadeOut).
 */
export function restartSceneOnResize(scene: Phaser.Scene): void {
  let lastWidth = scene.scale.width;
  let lastHeight = scene.scale.height;
  let timer: Phaser.Time.TimerEvent | undefined;

  const handler = (gameSize: { width: number; height: number }) => {
    if (!scene.sys.isActive()) return;
    const width = Math.round(gameSize.width);
    const height = Math.round(gameSize.height);
    if (Math.abs(width - lastWidth) < 48 && Math.abs(height - lastHeight) < 48) {
      return;
    }
    timer?.remove(false);
    timer = scene.time.delayedCall(250, () => {
      if (!scene.sys.isActive()) return;
      lastWidth = width;
      lastHeight = height;
      scene.scene.restart();
    });
  };

  scene.scale.on("resize", handler);
  scene.events.once("shutdown", () => {
    timer?.remove(false);
    scene.scale.off("resize", handler);
  });
}
