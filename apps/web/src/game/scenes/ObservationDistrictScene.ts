import Phaser from "@/game/phaser-runtime";
import type { DistrictName } from "@jennifer/shared";
import { SCENE_KEYS, SceneManager } from "../SceneManager";
import { REGISTRY_KEYS } from "../registry";
import { PALETTE, TEXTURE_KEYS } from "../AssetManifest";
import { Player } from "../entities/Player";
import { DialogNPC } from "../entities/DialogNPC";
import { DistrictObservationBridge } from "../bridge/DistrictObservationBridge";
import {
  observationRoomSpec,
  type ObservationRoomSpec,
} from "../district-rooms";
import { fadeToIfLive, sceneIsLive } from "../scene-lifecycle";
import { attachHeartbeatLine } from "../hud/OrchestrationRibbon";

/**
 * Shared walkable room for admitted districts that expose a live API board.
 */
export class ObservationDistrictScene extends Phaser.Scene {
  private sceneManager!: SceneManager;
  private player!: Player;
  private npc!: DialogNPC;
  private boardText!: Phaser.GameObjects.Text;
  private spec!: ObservationRoomSpec;
  private readonly bridge = new DistrictObservationBridge();

  constructor() {
    super({ key: SCENE_KEYS.OBSERVATION_DISTRICT });
  }

  init(data: { district?: DistrictName }): void {
    const spec = data.district ? observationRoomSpec(data.district) : undefined;
    if (!spec) {
      this.spec = {
        district: "hue-institute",
        title: "Unknown room",
        boardTitle: "NO SPEC",
        accent: PALETTE.GRAY,
        npcName: "Hold",
        npcRole: "Gate",
        dialog: ["This room has no admitted spec.", "Return to the Hall."],
      };
      return;
    }
    this.spec = spec;
  }

  create(): void {
    this.sceneManager = new SceneManager(this);
    const persona =
      (this.registry.get(REGISTRY_KEYS.PLAYER_NAME) as string) ?? "Jennifer";
    const worldW = Math.max(900, this.scale.width);
    const worldH = Math.max(700, this.scale.height);

    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.buildWorld(worldW, worldH);
    this.buildBoard(worldW);
    this.buildNPC(persona, worldW);
    this.player = new Player(this, worldW / 2, worldH * 0.72, persona);
    this.player.create();
    this.buildHUD(persona);
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    void this.refreshBoard();
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    this.player.update(delta);
    this.npc.update(delta);
  }

  private buildWorld(worldW: number, worldH: number): void {
    const bg = this.add.graphics();
    bg.fillStyle(PALETTE.DARK, 1);
    bg.fillRect(0, 0, worldW, worldH);
    bg.lineStyle(1, this.spec.accent, 0.08);
    for (let x = 0; x <= worldW; x += 40) {
      bg.beginPath();
      bg.moveTo(x, 0);
      bg.lineTo(x, worldH);
      bg.strokePath();
    }
    for (let y = 0; y <= worldH; y += 40) {
      bg.beginPath();
      bg.moveTo(0, y);
      bg.lineTo(worldW, y);
      bg.strokePath();
    }

    const room = this.add.graphics();
    room.fillStyle(PALETTE.SURFACE, 1);
    room.fillRect(50, 50, worldW - 100, worldH - 100);
    room.lineStyle(2, this.spec.accent, 0.4);
    room.strokeRect(50, 50, worldW - 100, worldH - 100);
  }

  private buildBoard(worldW: number): void {
    this.add
      .rectangle(worldW / 2, 220, Math.min(560, worldW - 140), 190, 0x12121f, 0.95)
      .setStrokeStyle(1, this.spec.accent, 0.55)
      .setDepth(4);

    this.add
      .text(worldW / 2, 138, this.spec.boardTitle, {
        fontSize: "11px",
        color: "#e5e7eb",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 0)
      .setDepth(5);

    this.boardText = this.add
      .text(worldW / 2, 172, "Reading Jennifer API…", {
        fontSize: "12px",
        color: "#c4b5fd",
        fontFamily: '"Courier New", monospace',
        align: "center",
        lineSpacing: 8,
        wordWrap: { width: Math.min(520, worldW - 180) },
      })
      .setOrigin(0.5, 0)
      .setDepth(5);
  }

  private async refreshBoard(): Promise<void> {
    const board = await this.bridge.readBoard(this.spec.district);
    if (!sceneIsLive(this) || !this.boardText.active) return;
    this.boardText.setText(
      [`source   ${board.sourceMode}`, ...board.lines].join("\n"),
    );
  }

  private buildNPC(persona: string, worldW: number): void {
    this.npc = new DialogNPC(
      this,
      {
        textureKey: TEXTURE_KEYS.NPC_GUIDE,
        name: this.spec.npcName,
        role: this.spec.npcRole,
        x: worldW * 0.28,
        y: 460,
        dialog: this.spec.dialog.map((line) =>
          line.includes("${persona}") ? line.replace("${persona}", persona) : line,
        ),
        patrolRange: 36,
      },
      () => ({ x: this.player.sprite.x, y: this.player.sprite.y }),
    );
    this.npc.create();
  }

  private buildHUD(persona: string): void {
    const { width, height } = this.scale;
    this.add
      .rectangle(0, 0, width, 32, PALETTE.SURFACE, 0.92)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(50)
      .setStrokeStyle(1, this.spec.accent, 0.4);

    this.add
      .text(10, 9, `◆ ${persona}`, {
        fontSize: "11px",
        color: "#c4b5fd",
        fontFamily: '"Courier New", monospace',
      })
      .setScrollFactor(0)
      .setDepth(51);

    this.add
      .text(width / 2, 9, `${this.spec.title}  ·  Observation`, {
        fontSize: "11px",
        color: "#9ca3af",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(51);

    const returnBtn = this.add
      .text(width - 12, 9, "↩ Return to Hall", {
        fontSize: "11px",
        color: "#374151",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(51)
      .setInteractive({ useHandCursor: true });

    returnBtn.on("pointerover", () => returnBtn.setStyle({ color: "#6b7280" }));
    returnBtn.on("pointerout", () => returnBtn.setStyle({ color: "#374151" }));
    returnBtn.on("pointerdown", () => {
      fadeToIfLive(this, () => {
        this.sceneManager.goTo(SCENE_KEYS.GOVERNANCE_HALL);
      });
    });

    this.add
      .rectangle(0, height - 24, width, 24, PALETTE.SURFACE, 0.88)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(50)
      .setStrokeStyle(1, this.spec.accent, 0.3);

    this.add
      .text(width / 2, height - 12, "Arrow keys / WASD · [E] talk · board is observation only", {
        fontSize: "10px",
        color: "#6b7280",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(51);

    attachHeartbeatLine(this, this.registry.get(REGISTRY_KEYS.LAST_WORLD_RECEIPT));
  }
}
