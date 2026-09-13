import Phaser from "@/game/phaser-runtime";
import { SCENE_KEYS, SceneManager } from "../SceneManager";
import { REGISTRY_KEYS } from "../registry";
import { PALETTE, TEXTURE_KEYS } from "../AssetManifest";
import { Player } from "../entities/Player";
import { DialogNPC, KAGE_NPC_CONFIG, TOWERS_NPC_CONFIG } from "../entities/DialogNPC";
import { fadeToIfLive, sceneIsLive } from "../scene-lifecycle";
import { attachHeartbeatLine } from "../hud/OrchestrationRibbon";
import {
  KPGS_THREE_HOLD,
  PAVILION_STATIONS,
  createClassroomReceipt,
  readClassroomReceipt,
  writeClassroomReceipt,
  visitPavilionStation,
  type PavilionStation,
} from "../kpgs-three-hold";

const WORLD_W = 1000;
const WORLD_H = 720;

const STATION_LAYOUT: Array<{
  id: PavilionStation;
  label: string;
  x: number;
  y: number;
}> = [
  { id: "foundation", label: "1  FOUNDATION", x: 200, y: 250 },
  { id: "columns", label: "2  COLUMNS", x: 400, y: 250 },
  { id: "beams", label: "3  BEAMS", x: 600, y: 250 },
  { id: "roof", label: "4  ROOF", x: 800, y: 250 },
];

/**
 * Towers' KPGSthree classroom. Phaser room. Pavilion names only.
 * Completing stations writes a local experiment receipt. autoMount stays false.
 */
export class KpgsThreeClassroomScene extends Phaser.Scene {
  private sceneManager!: SceneManager;
  private player!: Player;
  private towers!: DialogNPC;
  private kage!: DialogNPC;
  private boardText!: Phaser.GameObjects.Text;
  private stationHints: Phaser.GameObjects.Text[] = [];
  private visited: PavilionStation[] = [];
  private nearStation: PavilionStation | null = null;

  constructor() {
    super({ key: SCENE_KEYS.KPGS_THREE_CLASSROOM });
  }

  create(): void {
    this.sceneManager = new SceneManager(this);
    const persona =
      (this.registry.get(REGISTRY_KEYS.PLAYER_NAME) as string) ?? "Jennifer";

    const prior = readClassroomReceipt();
    this.visited = prior?.stations ? [...prior.stations] : [];

    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.buildWorld();
    this.buildStations();
    this.buildBoard();
    this.buildTeachers(persona);
    this.player = new Player(this, WORLD_W / 2, 560, persona);
    this.player.create();
    this.buildHUD(persona);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.events.on("player:interact", this.handleInteract, this);
    const markByKey: Record<string, PavilionStation> = {
      ONE: "foundation",
      TWO: "columns",
      THREE: "beams",
      FOUR: "roof",
    };
    for (const [key, station] of Object.entries(markByKey)) {
      this.input.keyboard?.on(`keydown-${key}`, () => this.markStation(station));
    }
    this.events.once("shutdown", () => {
      this.events.off("player:interact", this.handleInteract, this);
    });
    this.refreshBoard();
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    if (!sceneIsLive(this)) return;
    this.player.update(delta);
    this.towers.update(delta);
    this.kage.update(delta);
    this.checkStationProximity();
  }

  private buildWorld(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x0a1210, 1);
    bg.fillRect(0, 0, WORLD_W, WORLD_H);
    bg.lineStyle(1, PALETTE.EMERALD, 0.08);
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
    room.fillStyle(0x102018, 1);
    room.fillRect(50, 50, WORLD_W - 100, WORLD_H - 100);
    room.lineStyle(2, PALETTE.EMERALD, 0.4);
    room.strokeRect(50, 50, WORLD_W - 100, WORLD_H - 100);

    this.add
      .text(WORLD_W / 2, 72, "KPGSthree CLASSROOM  ·  TOWERS TEACHES", {
        fontSize: "13px",
        color: "#34d399",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 0)
      .setDepth(4);

    this.add
      .text(
        WORLD_W / 2,
        94,
        "pavilion handoff  ·  Phaser room  ·  Three.js autoMount HOLD",
        {
          fontSize: "10px",
          color: "#6ee7b7",
          fontFamily: '"Courier New", monospace',
        },
      )
      .setOrigin(0.5, 0)
      .setDepth(4);
  }

  private buildStations(): void {
    for (const station of STATION_LAYOUT) {
      const done = this.visited.includes(station.id);
      const bench = this.add
        .rectangle(station.x, station.y, 140, 88, 0x163024, 0.95)
        .setStrokeStyle(2, done ? PALETTE.EMERALD : PALETTE.AMBER, 0.7)
        .setDepth(4)
        .setInteractive({ useHandCursor: true });
      bench.on("pointerdown", () => this.markStation(station.id));
      this.add.image(station.x, station.y - 8, TEXTURE_KEYS.TERMINAL).setDepth(5);
      this.add
        .text(station.x, station.y + 28, station.label, {
          fontSize: "10px",
          color: done ? "#34d399" : "#fbbf24",
          fontFamily: '"Courier New", monospace',
        })
        .setOrigin(0.5, 0)
        .setDepth(5);

      const hint = this.add
        .text(station.x, station.y - 56, `[E] mark ${station.id}`, {
          fontSize: "10px",
          color: "#6ee7b7",
          fontFamily: '"Courier New", monospace',
          backgroundColor: "#0a1210",
          padding: { x: 5, y: 3 },
        })
        .setOrigin(0.5, 1)
        .setDepth(6)
        .setAlpha(0);
      this.stationHints.push(hint);
    }
  }

  private buildBoard(): void {
    this.add
      .rectangle(WORLD_W / 2, 160, 640, 64, 0x0c1812, 0.95)
      .setStrokeStyle(1, PALETTE.EMERALD, 0.45)
      .setDepth(4);

    this.boardText = this.add
      .text(WORLD_W / 2, 160, "", {
        fontSize: "11px",
        color: "#a7f3d0",
        fontFamily: '"Courier New", monospace',
        align: "center",
        lineSpacing: 4,
      })
      .setOrigin(0.5)
      .setDepth(5);
  }

  private buildTeachers(persona: string): void {
    this.towers = new DialogNPC(
      this,
      {
        ...TOWERS_NPC_CONFIG,
        x: 220,
        y: 500,
        dialog: [
          `${persona}, walk the four names. That is the pavilion contract.`,
          "foundation, columns, beams, roof. Blender can match those later.",
          "Completing this room does not mount Three.js.",
          "A capability starts not-verified. I will not pretend it is proven.",
        ],
      },
      () => ({ x: this.player.sprite.x, y: this.player.sprite.y }),
    );
    this.towers.create();

    this.kage = new DialogNPC(
      this,
      {
        ...KAGE_NPC_CONFIG,
        x: 780,
        y: 500,
        dialog: [
          "KPGSthree.ts has no art from Kage or Towers. We are renters here.",
          "Phaser already owns /game. A second WebGL root is not a city upgrade.",
          "Hold autoMount. Write the experiment receipt. Leave Three parked.",
        ],
      },
      () => ({ x: this.player.sprite.x, y: this.player.sprite.y }),
    );
    this.kage.create();
  }

  private checkStationProximity(): void {
    this.nearStation = null;
    STATION_LAYOUT.forEach((station, index) => {
      const dist = Phaser.Math.Distance.Between(
        this.player.sprite.x,
        this.player.sprite.y,
        station.x,
        station.y,
      );
      const near = dist < 70;
      const hint = this.stationHints[index];
      if (hint) hint.setAlpha(near ? 1 : 0);
      if (near) this.nearStation = station.id;
    });
  }

  private markStation(station: PavilionStation): void {
    this.visited = visitPavilionStation(this.visited, station);
    const receipt = createClassroomReceipt(this.visited);
    writeClassroomReceipt(receipt);
    this.registry.set(REGISTRY_KEYS.KPGS_THREE_CLASSROOM, JSON.stringify(receipt));
    this.refreshBoard();
  }

  private handleInteract(): void {
    if (!this.nearStation) return;
    this.markStation(this.nearStation);
  }

  private refreshBoard(): void {
    const receipt = createClassroomReceipt(this.visited);
    const marks = PAVILION_STATIONS.map((station) =>
      this.visited.includes(station) ? `[x] ${station}` : `[ ] ${station}`,
    ).join("   ");
    const status = receipt.complete
      ? "COMPLETE  ·  local-experiment  ·  autoMount still HOLD"
      : `IN PROGRESS  ·  renderer ${KPGS_THREE_HOLD.jenniferRenderer}  ·  ${KPGS_THREE_HOLD.package} HOLD`;
    this.boardText.setText(`${marks}\n${status}`);
  }

  private buildHUD(persona: string): void {
    const { width, height } = this.scale;
    this.add
      .rectangle(0, 0, width, 32, 0x0a1210, 0.92)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(50)
      .setStrokeStyle(1, PALETTE.EMERALD, 0.4);

    this.add
      .text(10, 9, `◆ ${persona}`, {
        fontSize: "11px",
        color: "#34d399",
        fontFamily: '"Courier New", monospace',
      })
      .setScrollFactor(0)
      .setDepth(51);

    this.add
      .text(width / 2, 9, "Towers Classroom  ·  KPGSthree experiment", {
        fontSize: "11px",
        color: "#9ca3af",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(51);

    const returnBtn = this.add
      .text(width - 12, 9, "↩ Return to Tower", {
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
        this.sceneManager.goTo(SCENE_KEYS.TELEMETRY_TOWER);
      });
    });

    this.add
      .rectangle(0, height - 24, width, 24, 0x0a1210, 0.88)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(50)
      .setStrokeStyle(1, PALETTE.EMERALD, 0.3);

    this.add
      .text(
        width / 2,
        height - 12,
        "WASD  ·  [E] or click a bench  ·  1-4 mark the pavilion names",
        {
          fontSize: "10px",
          color: "#047857",
          fontFamily: '"Courier New", monospace',
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(51);

    attachHeartbeatLine(this, this.registry.get(REGISTRY_KEYS.LAST_WORLD_RECEIPT));
  }
}
