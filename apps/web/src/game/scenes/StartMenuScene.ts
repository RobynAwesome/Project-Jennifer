import Phaser from "phaser";
import { SCENE_KEYS, SceneManager } from "../SceneManager";
import { PALETTE } from "../AssetManifest";

/**
 * StartMenuScene – title screen.
 *
 * Shows the Jennifer City logo, version, and a "Start" button.
 * On click transitions to PersonaSelectScene.
 */
export class StartMenuScene extends Phaser.Scene {
  private sceneManager!: SceneManager;

  constructor() {
    super({ key: SCENE_KEYS.START_MENU });
  }

  create(): void {
    this.sceneManager = new SceneManager(this);

    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.drawBackground(width, height);
    this.drawGrid(width, height);
    this.buildUI(cx, cy, width);
  }

  // ─── Private helpers ────────────────────────────────────────────────────

  private drawBackground(w: number, h: number): void {
    this.add.rectangle(w / 2, h / 2, w, h, PALETTE.DARK);
  }

  private drawGrid(w: number, h: number): void {
    const g = this.add.graphics();
    g.lineStyle(1, PALETTE.PRIMARY, 0.06);

    for (let x = 0; x <= w; x += 40) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.strokePath();
    }
    for (let y = 0; y <= h; y += 40) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.strokePath();
    }
  }

  private buildUI(cx: number, cy: number, w: number): void {
    // ── Title ──
    this.add
      .text(cx, cy - 140, "◆ JENNIFER CITY ◆", {
        fontSize: "28px",
        color: "#6366f1",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 105, "Sovereign Governance Intelligence Runtime", {
        fontSize: "11px",
        color: "#9ca3af",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5);

    // ── Separator ──
    const sepGfx = this.add.graphics();
    sepGfx.lineStyle(1, PALETTE.BORDER, 0.8);
    sepGfx.beginPath();
    sepGfx.moveTo(cx - 180, cy - 85);
    sepGfx.lineTo(cx + 180, cy - 85);
    sepGfx.strokePath();

    // ── Lore blurb ──
    this.add
      .text(
        cx,
        cy - 60,
        [
          "Governance before Intelligence.",
          "Validation before Optimisation.",
          "Reality before Prediction.",
        ].join("\n"),
        {
          fontSize: "11px",
          color: "#6b7280",
          fontFamily: '"Courier New", monospace',
          align: "center",
          lineSpacing: 6,
        }
      )
      .setOrigin(0.5);

    // ── Start button ──
    const startBtn = this.add
      .text(cx, cy + 30, "▶  ENTER THE CITY", {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        backgroundColor: "#312e81",
        padding: { x: 28, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startBtn.on("pointerover", () =>
      startBtn.setStyle({ color: "#a5b4fc" })
    );
    startBtn.on("pointerout", () =>
      startBtn.setStyle({ color: "#ffffff" })
    );
    startBtn.on("pointerdown", () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.sceneManager.goTo(SCENE_KEYS.PERSONA_SELECT);
      });
    });

    // ── Version ──
    this.add
      .text(w - 12, this.scale.height - 12, "v0.5.0 · Vertical Slice", {
        fontSize: "9px",
        color: "#374151",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(1, 1);

    // ── Keyboard hint ──
    this.add
      .text(cx, cy + 85, "Keyboard: ← ↑ → ↓  or  W A S D  · [E] Interact", {
        fontSize: "10px",
        color: "#4b5563",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5);

    // Fade in
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }
}
