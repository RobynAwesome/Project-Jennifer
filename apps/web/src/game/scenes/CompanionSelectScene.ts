import Phaser from "phaser";
import {
  COMPANION_CATALOG,
  generateId,
  now,
  type CompanionDefinition,
  type CompanionRenderMode,
  type CompanionRelationshipLane,
  type CompanionValidationReceipt,
} from "@jennifer/shared";
import { PALETTE } from "../AssetManifest";
import { REGISTRY_KEYS } from "../registry";
import { SCENE_KEYS, SceneManager } from "../SceneManager";

const DEFAULT_LANE: CompanionRelationshipLane = "co-builder";

const LOGIC_LABELS = {
  "memory-architect": "MEMORY ARCHITECT",
  "system-intuition": "SYSTEM INTUITION",
  "contextual-analyst": "CONTEXTUAL ANALYST",
} as const;

const CORE_GLYPHS = {
  prism: "◇",
  orb: "◉",
  mandala: "✺",
  "archive-cube": "▣",
  vortex: "✦",
  citadel: "⬢",
} as const;

/**
 * CompanionSelectScene – binds a governed core logic to the current game
 * session before entering Jennifer City.
 *
 * The player selects the kind of intelligence that will walk beside them, not
 * only a cosmetic avatar. Every selection emits a local validation receipt;
 * the API exposes the same contract for persistent runtime use.
 */
export class CompanionSelectScene extends Phaser.Scene {
  private sceneManager!: SceneManager;
  private renderMode: CompanionRenderMode = "core-logic";
  private statusText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.COMPANION_SELECT });
  }

  init(data?: { renderMode?: CompanionRenderMode }): void {
    this.renderMode = data?.renderMode ?? "core-logic";
  }

  create(): void {
    this.sceneManager = new SceneManager(this);

    const { width, height } = this.scale;
    this.drawBackground(width, height);
    this.buildHeader(width);
    this.buildCards(width);
    this.buildFooter(width, height);

    this.cameras.main.fadeIn(350, 0, 0, 0);
  }

  private drawBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, PALETTE.DARK);

    const grid = this.add.graphics();
    grid.lineStyle(1, PALETTE.PRIMARY, 0.045);
    for (let x = 0; x <= width; x += 32) {
      grid.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += 32) {
      grid.lineBetween(0, y, width, y);
    }

    const core = this.add.graphics();
    core.lineStyle(1, 0xf2c879, 0.18);
    core.strokeCircle(width / 2, 72, 34);
    core.strokeCircle(width / 2, 72, 24);
    core.lineBetween(width / 2 - 52, 72, width / 2 + 52, 72);
  }

  private buildHeader(width: number): void {
    const cx = width / 2;

    this.add
      .text(cx, 26, "DIGITAL HIPPOCAMPUS · CORE LOGIC", {
        fontSize: "11px",
        color: "#f2c879",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 58, "SELECT YOUR COMPANION", {
        fontSize: "22px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 84, "Three base logics · six expressions · one governed selection", {
        fontSize: "9px",
        color: "#7c8494",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5);

    const toggleLabel =
      this.renderMode === "core-logic" ? "SHOW EMBODIED FORMS" : "SHOW CORE LOGIC";

    const toggle = this.add
      .text(width - 18, 20, toggleLabel, {
        fontSize: "9px",
        color: "#93c5fd",
        fontFamily: '"Courier New", monospace',
        backgroundColor: "#111827",
        padding: { x: 9, y: 6 },
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    toggle.on("pointerover", () => toggle.setStyle({ color: "#ffffff" }));
    toggle.on("pointerout", () => toggle.setStyle({ color: "#93c5fd" }));
    toggle.on("pointerdown", () => {
      const next: CompanionRenderMode =
        this.renderMode === "core-logic" ? "embodied" : "core-logic";
      this.scene.restart({ renderMode: next });
    });
  }

  private buildCards(width: number): void {
    const cardWidth = 232;
    const cardHeight = 174;
    const gapX = 18;
    const startX = width / 2 - cardWidth - gapX;
    const rowY = [205, 398] as const;

    COMPANION_CATALOG.forEach((companion, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const y = rowY[row];
      if (y === undefined) return;

      const x = startX + column * (cardWidth + gapX);
      this.buildCompanionCard(x, y, cardWidth, cardHeight, companion);
    });
  }

  private buildCompanionCard(
    x: number,
    y: number,
    width: number,
    height: number,
    companion: CompanionDefinition
  ): void {
    const accent = parseHexColor(companion.visual.accentColor);
    const background = this.add
      .rectangle(x, y, width, height, PALETTE.SURFACE, 0.96)
      .setStrokeStyle(1, PALETTE.BORDER)
      .setInteractive({ useHandCursor: true });

    const hover = this.add
      .rectangle(x, y, width + 4, height + 4, 0x000000, 0)
      .setStrokeStyle(2, accent, 0);

    const avatar =
      this.renderMode === "core-logic"
        ? CORE_GLYPHS[companion.visual.coreGlyph]
        : `${companion.presentation === "feminine" ? "F" : "M"} · ${companion.name[0]}`;

    this.add
      .text(x - width / 2 + 20, y - height / 2 + 20, avatar, {
        fontSize: this.renderMode === "core-logic" ? "30px" : "15px",
        color: companion.visual.accentColor,
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);

    this.add
      .text(x - width / 2 + 65, y - height / 2 + 12, companion.name.toUpperCase(), {
        fontSize: "15px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0, 0);

    this.add
      .text(
        x - width / 2 + 65,
        y - height / 2 + 33,
        LOGIC_LABELS[companion.baseLogic],
        {
          fontSize: "8px",
          color: companion.visual.accentColor,
          fontFamily: '"Courier New", monospace',
        }
      )
      .setOrigin(0, 0);

    this.add
      .text(x - width / 2 + 14, y - 26, companion.archetype, {
        fontSize: "10px",
        color: "#d1d5db",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);

    this.add
      .text(x - width / 2 + 14, y - 7, companion.summary, {
        fontSize: "8px",
        color: "#8b93a3",
        fontFamily: '"Courier New", monospace',
        wordWrap: { width: width - 28 },
        lineSpacing: 2,
      })
      .setOrigin(0, 0);

    this.drawTelemetryBar(
      x - width / 2 + 14,
      y + 37,
      96,
      "TRUTH",
      companion.telemetry.truthStrictness,
      accent
    );
    this.drawTelemetryBar(
      x + 12,
      y + 37,
      96,
      "CONTEXT",
      companion.telemetry.contextSensitivity,
      accent
    );

    const select = this.add
      .text(x, y + height / 2 - 18, "SELECT · CO-BUILDER", {
        fontSize: "9px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        backgroundColor: "#172033",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const focus = (active: boolean) => {
      hover.setStrokeStyle(2, accent, active ? 1 : 0);
      select.setStyle({ color: active ? companion.visual.accentColor : "#ffffff" });
    };

    background.on("pointerover", () => focus(true));
    background.on("pointerout", () => focus(false));
    select.on("pointerover", () => focus(true));
    select.on("pointerout", () => focus(false));

    const choose = () => this.selectCompanion(companion);
    background.on("pointerdown", choose);
    select.on("pointerdown", choose);
  }

  private drawTelemetryBar(
    x: number,
    y: number,
    width: number,
    label: string,
    value: number,
    color: number
  ): void {
    this.add.text(x, y, label, {
      fontSize: "7px",
      color: "#64748b",
      fontFamily: '"Courier New", monospace',
    });

    const track = this.add.graphics();
    track.fillStyle(0x273244, 1);
    track.fillRect(x, y + 11, width, 4);
    track.fillStyle(color, 0.9);
    track.fillRect(x, y + 11, width * Math.max(0, Math.min(1, value)), 4);
  }

  private buildFooter(width: number, height: number): void {
    this.statusText = this.add
      .text(width / 2, height - 48, "A companion is an embodied expression of a governed core logic.", {
        fontSize: "9px",
        color: "#6b7280",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height - 20, "↩ Back to Persona Selection", {
        fontSize: "9px",
        color: "#374151",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", function (this: Phaser.GameObjects.Text) {
        this.setStyle({ color: "#9ca3af" });
      })
      .on("pointerout", function (this: Phaser.GameObjects.Text) {
        this.setStyle({ color: "#374151" });
      })
      .on("pointerdown", () => this.sceneManager.goTo(SCENE_KEYS.PERSONA_SELECT));
  }

  private selectCompanion(companion: CompanionDefinition): void {
    const supportedLane = companion.supportedLanes.includes(DEFAULT_LANE);
    const dependencyRisk = round4(1 - companion.telemetry.dependencyResistance);
    const sycophancyResistance = round4(
      companion.telemetry.truthStrictness * 0.55 +
        companion.telemetry.governanceDiscipline * 0.45
    );
    const passed = supportedLane && dependencyRisk <= 0.25 && sycophancyResistance >= 0.75;

    const receipt: CompanionValidationReceipt = {
      id: generateId(),
      selectionId: generateId(),
      userId: (this.registry.get(REGISTRY_KEYS.SESSION_ID) as string) ?? "local-session",
      companionId: companion.id,
      relationshipLane: DEFAULT_LANE,
      logicMatch: companion.baseLogic,
      supportedLane,
      agencyPreserved: true,
      truthBoundaryDeclared: true,
      dependencyRisk,
      sycophancyResistance,
      governanceDiscipline: companion.telemetry.governanceDiscipline,
      result: passed ? "PASSED" : "FAILED",
      reasons: passed
        ? ["Companion logic and governance thresholds validated."]
        : ["Companion selection failed the local validation membrane."],
      timestamp: now(),
    };

    if (!passed) {
      this.statusText?.setText(receipt.reasons[0] ?? "Selection failed.");
      this.statusText?.setStyle({ color: "#ef4444" });
      return;
    }

    this.registry.set(REGISTRY_KEYS.COMPANION_ID, companion.id);
    this.registry.set(REGISTRY_KEYS.COMPANION_NAME, companion.name);
    this.registry.set(REGISTRY_KEYS.COMPANION_LOGIC, companion.baseLogic);
    this.registry.set(REGISTRY_KEYS.COMPANION_LANE, DEFAULT_LANE);
    this.registry.set(REGISTRY_KEYS.COMPANION_RENDER_MODE, this.renderMode);
    this.registry.set(REGISTRY_KEYS.LAST_COMPANION_RECEIPT, JSON.stringify(receipt));

    this.statusText?.setText(
      `${companion.name} linked · ${LOGIC_LABELS[companion.baseLogic]} · receipt ${receipt.id.slice(0, 8)}`
    );
    this.statusText?.setStyle({ color: "#10b981" });

    this.time.delayedCall(250, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.sceneManager.goTo(SCENE_KEYS.GOVERNANCE_HALL);
      });
    });
  }
}

function parseHexColor(hex: string): number {
  return Number.parseInt(hex.replace("#", ""), 16);
}

function round4(value: number): number {
  return Number(Math.max(0, Math.min(1, value)).toFixed(4));
}
