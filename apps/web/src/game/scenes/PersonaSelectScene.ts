import Phaser from "phaser";
import { SCENE_KEYS, SceneManager } from "../SceneManager";
import { REGISTRY_KEYS, PERSONA_CONFIGS, type GamePersona } from "../registry";
import { PALETTE } from "../AssetManifest";
import { generateId } from "@jennifer/shared";

/**
 * PersonaSelectScene – choose which persona to play as.
 *
 * The selected persona is written into the global game registry so all
 * subsequent scenes can read it without passing it through scene data.
 */
export class PersonaSelectScene extends Phaser.Scene {
  private sceneManager!: SceneManager;

  constructor() {
    super({ key: SCENE_KEYS.PERSONA_SELECT });
  }

  create(): void {
    this.sceneManager = new SceneManager(this);

    const { width, height } = this.scale;
    const cx = width / 2;

    this.drawBackground(width, height);
    this.buildUI(cx, width, height);
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private drawBackground(w: number, h: number): void {
    this.add.rectangle(w / 2, h / 2, w, h, PALETTE.DARK);

    const g = this.add.graphics();
    g.lineStyle(1, PALETTE.PRIMARY, 0.05);
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

  private buildUI(cx: number, w: number, h: number): void {
    // Header
    this.add
      .text(cx, 60, "Choose Your Persona", {
        fontSize: "22px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 92, "Your persona determines your approach to governance.", {
        fontSize: "10px",
        color: "#6b7280",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5);

    // Persona cards
    const cardW = 195;
    const cardH = 220;
    const gap = 20;
    const totalW = PERSONA_CONFIGS.length * cardW + (PERSONA_CONFIGS.length - 1) * gap;
    const startX = cx - totalW / 2 + cardW / 2;
    const cardY = h / 2 + 10;

    PERSONA_CONFIGS.forEach((persona, idx) => {
      const x = startX + idx * (cardW + gap);
      this.buildPersonaCard(x, cardY, cardW, cardH, persona);
    });

    // Back hint
    this.add
      .text(cx, h - 24, "↩ Back to Menu", {
        fontSize: "10px",
        color: "#374151",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", function (this: Phaser.GameObjects.Text) {
        this.setStyle({ color: "#6b7280" });
      })
      .on("pointerout", function (this: Phaser.GameObjects.Text) {
        this.setStyle({ color: "#374151" });
      })
      .on("pointerdown", () => {
        this.cameras.main.fadeOut(250, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.sceneManager.goTo(SCENE_KEYS.START_MENU);
        });
      });
  }

  private buildPersonaCard(
    x: number,
    y: number,
    w: number,
    h: number,
    persona: (typeof PERSONA_CONFIGS)[number]
  ): void {
    // Card background
    const cardBg = this.add
      .rectangle(x, y, w, h, PALETTE.SURFACE)
      .setStrokeStyle(1, PALETTE.BORDER);

    // Hover highlight border (starts transparent)
    const hoverBorder = this.add
      .rectangle(x, y, w + 4, h + 4, 0x000000, 0)
      .setStrokeStyle(2, persona.color, 0);

    // Emoji
    this.add
      .text(x, y - 72, persona.emoji, { fontSize: "36px" })
      .setOrigin(0.5);

    // Name
    this.add
      .text(x, y - 28, persona.displayName, {
        fontSize: "14px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Description
    this.add
      .text(x, y + 6, persona.description, {
        fontSize: "10px",
        color: "#9ca3af",
        fontFamily: '"Courier New", monospace',
        wordWrap: { width: w - 20 },
        align: "center",
      })
      .setOrigin(0.5);

    // Confidence bonus
    this.add
      .text(
        x,
        y + 56,
        `Confidence +${(persona.confidenceBonus * 100).toFixed(0)}%`,
        {
          fontSize: "9px",
          color: "#10b981",
          fontFamily: '"Courier New", monospace',
        }
      )
      .setOrigin(0.5);

    // Select button
    const selectBtn = this.add
      .text(x, y + 82, "SELECT", {
        fontSize: "12px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        backgroundColor: "#1e1b4b",
        padding: { x: 20, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Hover effects
    const colorHex = `#${persona.color.toString(16).padStart(6, "0")}`;

    cardBg.setInteractive();
    cardBg.on("pointerover", () => {
      hoverBorder.setStrokeStyle(2, persona.color, 1);
      selectBtn.setStyle({ color: colorHex });
    });
    cardBg.on("pointerout", () => {
      hoverBorder.setStrokeStyle(2, persona.color, 0);
      selectBtn.setStyle({ color: "#ffffff" });
    });

    selectBtn.on("pointerover", () => {
      hoverBorder.setStrokeStyle(2, persona.color, 1);
      selectBtn.setStyle({ color: colorHex });
    });
    selectBtn.on("pointerout", () => {
      hoverBorder.setStrokeStyle(2, persona.color, 0);
      selectBtn.setStyle({ color: "#ffffff" });
    });

    const onSelect = () => this.selectPersona(persona.id);
    cardBg.on("pointerdown", onSelect);
    selectBtn.on("pointerdown", onSelect);
  }

  private selectPersona(id: GamePersona): void {
    const config = PERSONA_CONFIGS.find((p) => p.id === id)!;

    // Write into global registry
    this.registry.set(REGISTRY_KEYS.PERSONA, id);
    this.registry.set(REGISTRY_KEYS.PLAYER_NAME, config.displayName);
    this.registry.set(REGISTRY_KEYS.SESSION_ID, generateId());
    this.registry.set(REGISTRY_KEYS.MISSION_COMPLETE, false);
    this.registry.set(REGISTRY_KEYS.MEMORY_ENTRY_COUNT, 0);

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.sceneManager.goTo(SCENE_KEYS.GOVERNANCE_HALL);
    });
  }
}
