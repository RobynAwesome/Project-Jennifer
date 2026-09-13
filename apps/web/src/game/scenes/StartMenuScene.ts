import Phaser from "@/game/phaser-runtime";
import { ContinuityBridge } from "../bridge/ContinuityBridge";
import { applyContinuityToRegistry } from "../continuity/apply-continuity";
import { readLocalContinuity } from "../continuity/session-store";
import { SCENE_KEYS, SceneManager } from "../SceneManager";
import { PALETTE } from "../AssetManifest";
import { restartSceneOnResize } from "../bind-scene-resize";
import { attachCityAmbience } from "../audio/city-ambience";

/**
 * StartMenuScene – title screen for Jennifer City love loop.
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
    attachCityAmbience(this);
    restartSceneOnResize(this);
  }

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
    this.add
      .text(cx, cy - 150, "◆ JENNIFER CITY ◆", {
        fontSize: "28px",
        color: "#6366f1",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 115, "THE WORLD REMEMBERS WHAT YOU CHOOSE.", {
        fontSize: "11px",
        color: "#c4b5fd",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5);

    const sepGfx = this.add.graphics();
    sepGfx.lineStyle(1, PALETTE.BORDER, 0.8);
    sepGfx.beginPath();
    sepGfx.moveTo(cx - 180, cy - 95);
    sepGfx.lineTo(cx + 180, cy - 95);
    sepGfx.strokePath();

    this.add
      .text(
        cx,
        cy - 70,
        [
          "Choose who walks with you.",
          "Make one choice that matters later.",
          "Come back — the receipt will still be here.",
        ].join("\n"),
        {
          fontSize: "11px",
          color: "#9ca3af",
          fontFamily: '"Courier New", monospace',
          align: "center",
          lineSpacing: 6,
        },
      )
      .setOrigin(0.5);

    const startBtn = this.add
      .text(cx, cy + 20, "▶  ENTER THE CITY", {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        backgroundColor: "#312e81",
        padding: { x: 28, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startBtn.on("pointerover", () => startBtn.setStyle({ color: "#a5b4fc" }));
    startBtn.on("pointerout", () => startBtn.setStyle({ color: "#ffffff" }));

    const enterCity = () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.sceneManager.goTo(SCENE_KEYS.PERSONA_SELECT);
      });
    };

    startBtn.on("pointerdown", enterCity);
    this.input.keyboard?.once("keydown-ENTER", enterCity);
    this.input.keyboard?.once("keydown-SPACE", enterCity);

    const saved = readLocalContinuity();
    if (saved?.companionId) {
      const label = saved.questComplete
        ? `↺ CONTINUE · ${saved.companionName ?? "companion"} remembers`
        : `↺ CONTINUE · resume with ${saved.companionName ?? "companion"}`;
      const continueBtn = this.add
        .text(cx, cy + 78, label, {
          fontSize: "12px",
          color: "#f2c879",
          fontFamily: '"Courier New", monospace',
          backgroundColor: "#1a1625",
          padding: { x: 16, y: 8 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      continueBtn.on("pointerover", () =>
        continueBtn.setStyle({ color: "#fde68a" }),
      );
      continueBtn.on("pointerout", () =>
        continueBtn.setStyle({ color: "#f2c879" }),
      );
      continueBtn.on("pointerdown", () => {
        void this.continueFromSnapshot(saved.sessionId);
      });
    }

    this.add
      .text(w - 12, this.scale.height - 12, "v0.6.0 · Love Loop Dedication", {
        fontSize: "9px",
        color: "#374151",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(1, 1);

    this.add
      .text(
        cx,
        cy + 130,
        "Enter / Space to start  ·  WASD and [E] in the city",
        {
          fontSize: "10px",
          color: "#4b5563",
          fontFamily: '"Courier New", monospace',
        },
      )
      .setOrigin(0.5);

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  private async continueFromSnapshot(sessionId: string): Promise<void> {
    const bridge = new ContinuityBridge();
    const loaded = await bridge.load(sessionId);
    if (!loaded.snapshot?.companionId) {
      this.sceneManager.goTo(SCENE_KEYS.PERSONA_SELECT);
      return;
    }

    applyContinuityToRegistry(
      this.registry,
      loaded.snapshot,
      loaded.sourceMode,
    );

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      const next = loaded.snapshot?.questComplete
        ? SCENE_KEYS.MEMORY_DISTRICT
        : SCENE_KEYS.GOVERNANCE_HALL;
      this.sceneManager.goTo(next);
    });
  }
}
