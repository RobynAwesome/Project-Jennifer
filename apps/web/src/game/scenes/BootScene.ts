import Phaser from "phaser";
import { SCENE_KEYS } from "../SceneManager";
import { ASSET_MANIFEST, PALETTE } from "../AssetManifest";
import type { AssetDefinition } from "../AssetManifest";

/**
 * BootScene – the first Phaser scene.
 *
 * Responsibilities:
 *   1. Generate all programmatic textures defined in ASSET_MANIFEST.
 *   2. Show a brief loading bar while generation runs.
 *   3. Transition to StartMenuScene.
 *
 * No external network requests are made; every texture is drawn with
 * Phaser.GameObjects.Graphics so the game works fully offline.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Background
    this.add.rectangle(cx, cy, width, height, PALETTE.DARK);

    // Jennifer logo
    this.add
      .text(cx, cy - 60, "J", {
        fontSize: "48px",
        color: "#6366f1",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 10, "Jennifer City", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 16, "Sovereign Governance Intelligence Runtime", {
        fontSize: "10px",
        color: "#6b7280",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5);

    // Loading bar background
    const barW = 300;
    const barH = 6;
    const barX = cx - barW / 2;
    const barY = cy + 60;

    this.add
      .rectangle(cx, barY + barH / 2, barW + 4, barH + 4, PALETTE.BORDER)
      .setOrigin(0.5);

    const barFill = this.add
      .rectangle(barX, barY, 0, barH, PALETTE.PRIMARY)
      .setOrigin(0, 0);

    const statusText = this.add
      .text(cx, barY + 20, "Generating textures…", {
        fontSize: "10px",
        color: "#6b7280",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5);

    // Generate all textures from the manifest
    const total = ASSET_MANIFEST.length;
    ASSET_MANIFEST.forEach((def, idx) => {
      this.generateTexture(def);
      const progress = (idx + 1) / total;
      barFill.setSize(barW * progress, barH);
      statusText.setText(`Loading… ${Math.round(progress * 100)}%`);
    });

    statusText.setText("Ready");

    // Brief pause then transition
    this.time.delayedCall(400, () => {
      this.scene.start(SCENE_KEYS.START_MENU);
    });
  }

  private generateTexture(def: AssetDefinition): void {
    const g = this.make.graphics({ x: 0, y: 0 });

    const fillAlpha = def.fillAlpha ?? 1;

    if (def.strokeColor !== undefined && def.strokeWidth) {
      g.lineStyle(def.strokeWidth, def.strokeColor, 1);
    }

    g.fillStyle(def.fillColor, fillAlpha);

    switch (def.shape) {
      case "circle": {
        const r = def.width / 2;
        g.fillCircle(r, r, r - (def.strokeWidth ?? 0));
        if (def.strokeColor !== undefined) {
          g.strokeCircle(r, r, r - Math.ceil((def.strokeWidth ?? 0) / 2));
        }
        break;
      }
      case "rounded-rect": {
        const radius = def.radius ?? 4;
        const sw = def.strokeWidth ?? 0;
        g.fillRoundedRect(sw, sw, def.width - sw * 2, def.height - sw * 2, radius);
        if (def.strokeColor !== undefined) {
          g.strokeRoundedRect(sw / 2, sw / 2, def.width - sw, def.height - sw, radius);
        }
        break;
      }
      case "rect": {
        const sw = def.strokeWidth ?? 0;
        g.fillRect(sw, sw, def.width - sw * 2, def.height - sw * 2);
        if (def.strokeColor !== undefined) {
          g.strokeRect(sw / 2, sw / 2, def.width - sw, def.height - sw);
        }
        break;
      }
    }

    g.generateTexture(def.key, def.width, def.height);
    g.destroy();
  }
}
