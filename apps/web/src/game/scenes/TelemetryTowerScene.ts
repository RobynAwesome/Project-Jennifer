import Phaser from "@/game/phaser-runtime";
import { SCENE_KEYS, SceneManager } from "../SceneManager";
import { REGISTRY_KEYS } from "../registry";
import { PALETTE } from "../AssetManifest";
import { Player } from "../entities/Player";
import { DialogNPC, OBSERVER_NPC_CONFIG } from "../entities/DialogNPC";
import { TelemetryBridge, type TowerSignalBoard } from "../bridge/TelemetryBridge";
import { fadeToIfLive, sceneIsLive } from "../scene-lifecycle";
import { attachHeartbeatLine } from "../hud/OrchestrationRibbon";

const WORLD_W = 900;
const WORLD_H = 700;

/**
 * Telemetry Tower – expose live API signals. Observation only.
 */
const CLASSROOM_DOOR = { x: 720, y: 480 };

export class TelemetryTowerScene extends Phaser.Scene {
  private sceneManager!: SceneManager;
  private player!: Player;
  private npc!: DialogNPC;
  private boardText!: Phaser.GameObjects.Text;
  private classroomHint!: Phaser.GameObjects.Text;
  private nearClassroom = false;
  private telemetryBridge = new TelemetryBridge();

  constructor() {
    super({ key: SCENE_KEYS.TELEMETRY_TOWER });
  }

  create(): void {
    this.sceneManager = new SceneManager(this);
    const persona =
      (this.registry.get(REGISTRY_KEYS.PLAYER_NAME) as string) ?? "Jennifer";

    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.buildWorld();
    this.buildSignalBoard();
    this.buildClassroomDoor();
    this.buildNPC(persona);
    this.buildPlayer(persona);
    this.buildHUD(persona);
    this.setupCamera();
    this.events.on("player:interact", this.handleClassroomInteract, this);
    this.events.once("shutdown", () => {
      this.events.off("player:interact", this.handleClassroomInteract, this);
    });
    void this.refreshBoard();
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    this.player.update(delta);
    this.npc.update(delta);
    this.checkClassroomProximity();
  }

  private buildWorld(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x120c08, 1);
    bg.fillRect(0, 0, WORLD_W, WORLD_H);
    bg.lineStyle(1, PALETTE.AMBER, 0.08);
    for (let x = 0; x <= WORLD_W; x += 40) {
      bg.beginPath();
      bg.moveTo(x, 0);
      bg.lineTo(x, WORLD_H);
      bg.strokePath();
    }
    for (let y = 0; y <= WORLD_H; y += 40) {
      bg.beginPath();
      bg.moveTo(0, y);
      bg.lineTo(WORLD_W, y);
      bg.strokePath();
    }

    const room = this.add.graphics();
    room.fillStyle(0x1a1208, 1);
    room.fillRect(50, 50, WORLD_W - 100, WORLD_H - 100);
    room.lineStyle(2, PALETTE.AMBER, 0.35);
    room.strokeRect(50, 50, WORLD_W - 100, WORLD_H - 100);
  }

  private buildSignalBoard(): void {
    this.add
      .rectangle(WORLD_W / 2, 220, 520, 180, 0x22180c, 0.95)
      .setStrokeStyle(1, PALETTE.AMBER, 0.5)
      .setDepth(4);

    this.add
      .text(WORLD_W / 2, 142, "SIGNAL BOARD  ·  OBSERVATION ONLY", {
        fontSize: "11px",
        color: "#f59e0b",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 0)
      .setDepth(5);

    this.boardText = this.add
      .text(WORLD_W / 2, 176, "Reading Jennifer API…", {
        fontSize: "12px",
        color: "#fbbf24",
        fontFamily: '"Courier New", monospace',
        align: "center",
        lineSpacing: 8,
      })
      .setOrigin(0.5, 0)
      .setDepth(5);
  }

  private async refreshBoard(): Promise<void> {
    const board = await this.telemetryBridge.readBoard();
    if (!sceneIsLive(this) || !this.boardText.active) return;
    this.boardText.setText(formatBoard(board));
  }

  private buildClassroomDoor(): void {
    const door = this.add
      .rectangle(CLASSROOM_DOOR.x, CLASSROOM_DOOR.y, 130, 90, 0x163024, 0.95)
      .setStrokeStyle(2, PALETTE.EMERALD, 0.6)
      .setDepth(4)
      .setInteractive({ useHandCursor: true });
    door.on("pointerdown", () => this.enterClassroom());
    this.add
      .text(CLASSROOM_DOOR.x, CLASSROOM_DOOR.y - 8, "CLASSROOM", {
        fontSize: "11px",
        color: "#34d399",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setDepth(5);
    this.add
      .text(CLASSROOM_DOOR.x, CLASSROOM_DOOR.y + 12, "KPGSthree", {
        fontSize: "10px",
        color: "#6ee7b7",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.classroomHint = this.add
      .text(CLASSROOM_DOOR.x, CLASSROOM_DOOR.y - 58, "[E] Towers is teaching", {
        fontSize: "10px",
        color: "#6ee7b7",
        fontFamily: '"Courier New", monospace',
        backgroundColor: "#120c08",
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5, 1)
      .setDepth(6)
      .setAlpha(0);
  }

  private checkClassroomProximity(): void {
    const dist = Phaser.Math.Distance.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      CLASSROOM_DOOR.x,
      CLASSROOM_DOOR.y,
    );
    const near = dist < 72;
    if (near && !this.nearClassroom) {
      this.tweens.add({ targets: this.classroomHint, alpha: 1, duration: 200 });
    } else if (!near && this.nearClassroom) {
      this.tweens.add({ targets: this.classroomHint, alpha: 0, duration: 200 });
    }
    this.nearClassroom = near;
  }

  private enterClassroom(): void {
    fadeToIfLive(this, () => {
      this.sceneManager.goTo(SCENE_KEYS.KPGS_THREE_CLASSROOM);
    });
  }

  private handleClassroomInteract(): void {
    if (!this.nearClassroom) return;
    this.enterClassroom();
  }

  private buildNPC(persona: string): void {
    this.npc = new DialogNPC(
      this,
      {
        ...OBSERVER_NPC_CONFIG,
        x: 220,
        y: 460,
        dialog: [
          `${persona}, this tower watches the runtime.`,
          "Numbers here are observations.",
          "They do not become canon because they appeared.",
          "Towers is teaching the KPGSthree classroom through that door.",
          "Return to the Hall when you have seen enough.",
        ],
      },
      () => ({ x: this.player.sprite.x, y: this.player.sprite.y }),
    );
    this.npc.create();
  }

  private buildPlayer(persona: string): void {
    this.player = new Player(this, WORLD_W / 2, 520, persona);
    this.player.create();
  }

  private buildHUD(persona: string): void {
    const { width, height } = this.scale;
    this.add
      .rectangle(0, 0, width, 32, 0x120c08, 0.92)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(50)
      .setStrokeStyle(1, PALETTE.AMBER, 0.4);

    this.add
      .text(10, 9, `◆ ${persona}`, {
        fontSize: "11px",
        color: "#f59e0b",
        fontFamily: '"Courier New", monospace',
      })
      .setScrollFactor(0)
      .setDepth(51);

    this.add
      .text(width / 2, 9, "Telemetry Tower  ·  Observation", {
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
      .rectangle(0, height - 24, width, 24, 0x120c08, 0.88)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(50)
      .setStrokeStyle(1, PALETTE.AMBER, 0.3);

    this.add
      .text(width / 2, height - 12, "WASD · [E] talk or enter Towers' classroom", {
        fontSize: "10px",
        color: "#b45309",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(51);

    attachHeartbeatLine(this, this.registry.get(REGISTRY_KEYS.LAST_WORLD_RECEIPT));
  }

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
  }
}

function formatBoard(board: TowerSignalBoard): string {
  return [
    `source   ${board.sourceMode}`,
    `api      ${board.apiStatus}`,
    `persist  ${board.persistenceMode} / ${board.projectionMode}`,
    `events   ${board.eventCount}   latest ${board.latestEvent}`,
    board.summary,
  ].join("\n");
}
