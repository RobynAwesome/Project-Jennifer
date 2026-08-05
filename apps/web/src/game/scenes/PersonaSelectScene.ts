import Phaser from "phaser";
import { generateId } from "@jennifer/shared";
import { PALETTE } from "../AssetManifest";
import { PERSONA_CONFIGS, REGISTRY_KEYS, type GamePersona } from "../registry";
import { SCENE_KEYS, SceneManager } from "../SceneManager";

/**
 * Selects the player's operating persona. Companion selection happens in the
 * following scene so persona and companion remain separate governance layers.
 */
export class PersonaSelectScene extends Phaser.Scene {
  private sceneManager!: SceneManager;

  constructor() {
    super({ key: SCENE_KEYS.PERSONA_SELECT });
  }

  create(): void {
    this.sceneManager = new SceneManager(this);
    const { width, height } = this.scale;

    this.drawBackground(width, height);
    this.buildHeader(width);
    this.buildCards(width, height);
    this.buildBackLink(width, height);
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  private drawBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, PALETTE.DARK);

    const grid = this.add.graphics();
    grid.lineStyle(1, PALETTE.PRIMARY, 0.05);
    for (let x = 0; x <= width; x += 40) grid.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += 40) grid.lineBetween(0, y, width, y);
  }

  private buildHeader(width: number): void {
    const cx = width / 2;
    this.add
      .text(cx, 58, "CHOOSE YOUR PERSONA", {
        fontSize: "22px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(
        cx,
        90,
        "Persona controls your approach. Companion logic is selected next.",
        {
          fontSize: "10px",
          color: "#6b7280",
          fontFamily: '"Courier New", monospace',
        }
      )
      .setOrigin(0.5);
  }

  private buildCards(width: number, height: number): void {
    const cardWidth = 195;
    const cardHeight = 220;
    const gap = 20;
    const totalWidth =
      PERSONA_CONFIGS.length * cardWidth +
      (PERSONA_CONFIGS.length - 1) * gap;
    const startX = width / 2 - totalWidth / 2 + cardWidth / 2;
    const y = height / 2 + 10;

    PERSONA_CONFIGS.forEach((persona, index) => {
      this.buildCard(
        startX + index * (cardWidth + gap),
        y,
        cardWidth,
        cardHeight,
        persona
      );
    });
  }

  private buildCard(
    x: number,
    y: number,
    width: number,
    height: number,
    persona: (typeof PERSONA_CONFIGS)[number]
  ): void {
    const card = this.add
      .rectangle(x, y, width, height, PALETTE.SURFACE)
      .setStrokeStyle(1, PALETTE.BORDER)
      .setInteractive({ useHandCursor: true });

    const border = this.add
      .rectangle(x, y, width + 4, height + 4, 0x000000, 0)
      .setStrokeStyle(2, persona.color, 0);

    this.add.text(x, y - 72, persona.emoji, { fontSize: "36px" }).setOrigin(0.5);
    this.add
      .text(x, y - 28, persona.displayName, {
        fontSize: "14px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(x, y + 6, persona.description, {
        fontSize: "10px",
        color: "#9ca3af",
        fontFamily: '"Courier New", monospace',
        wordWrap: { width: width - 20 },
        align: "center",
      })
      .setOrigin(0.5);
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

    const select = this.add
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

    const accent = `#${persona.color.toString(16).padStart(6, "0")}`;
    const focus = (active: boolean) => {
      border.setStrokeStyle(2, persona.color, active ? 1 : 0);
      select.setStyle({ color: active ? accent : "#ffffff" });
    };

    card.on("pointerover", () => focus(true));
    card.on("pointerout", () => focus(false));
    select.on("pointerover", () => focus(true));
    select.on("pointerout", () => focus(false));

    const choose = () => this.selectPersona(persona.id);
    card.on("pointerdown", choose);
    select.on("pointerdown", choose);
  }

  private buildBackLink(width: number, height: number): void {
    this.add
      .text(width / 2, height - 24, "↩ Back to Menu", {
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
      .on("pointerdown", () => this.sceneManager.goTo(SCENE_KEYS.START_MENU));
  }

  private selectPersona(id: GamePersona): void {
    const config = PERSONA_CONFIGS.find((persona) => persona.id === id);
    if (!config) return;

    this.registry.set(REGISTRY_KEYS.PERSONA, id);
    this.registry.set(REGISTRY_KEYS.PLAYER_NAME, config.displayName);
    this.registry.set(REGISTRY_KEYS.SESSION_ID, generateId());
    this.registry.set(REGISTRY_KEYS.MISSION_COMPLETE, false);
    this.registry.set(REGISTRY_KEYS.MEMORY_ENTRY_COUNT, 0);

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.sceneManager.goTo(SCENE_KEYS.COMPANION_SELECT);
    });
  }
}
