import Phaser from "phaser";
import { SCENE_KEYS, SceneManager } from "../SceneManager";
import { REGISTRY_KEYS } from "../registry";
import { TEXTURE_KEYS, PALETTE } from "../AssetManifest";
import { Player } from "../entities/Player";
import { DialogNPC, ARCHIVIST_NPC_CONFIG } from "../entities/DialogNPC";
import { MemoryBridge } from "../bridge/MemoryBridge";

// ─── Scene dimensions ─────────────────────────────────────────────────────────

const WORLD_W = 1000;
const WORLD_H = 750;

// ─── Memory node spread ───────────────────────────────────────────────────────

const NODE_POSITIONS = [
  { x: 200, y: 200 }, { x: 400, y: 160 }, { x: 650, y: 200 },
  { x: 850, y: 180 }, { x: 150, y: 450 }, { x: 380, y: 480 },
  { x: 700, y: 460 }, { x: 900, y: 430 }, { x: 250, y: 680 },
  { x: 580, y: 650 }, { x: 800, y: 700 },
];

/**
 * MemoryDistrictScene – the GSMB district.
 *
 * Features:
 *   - Distinct blue-teal visual theme
 *   - Floating memory nodes (animated)
 *   - One NPC archivist
 *   - A Validation Terminal: press [E] to launch ValidationDemoScene
 *   - "Return to Hall" prompt in the HUD
 */
export class MemoryDistrictScene extends Phaser.Scene {
  private sceneManager!: SceneManager;
  private player!: Player;
  private npc!: DialogNPC;
  private memoryBridge!: MemoryBridge;
  private terminalX = WORLD_W / 2;
  private terminalY = WORLD_H / 2;
  private terminalHint!: Phaser.GameObjects.Text;
  private isNearTerminal = false;

  constructor() {
    super({ key: SCENE_KEYS.MEMORY_DISTRICT });
  }

  create(): void {
    this.sceneManager = new SceneManager(this);
    this.memoryBridge = new MemoryBridge();

    const persona =
      (this.registry.get(REGISTRY_KEYS.PLAYER_NAME) as string) ?? "Jennifer";

    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    this.buildWorld();
    this.buildMemoryNodes();
    this.buildTerminal();
    this.buildNPC(persona);
    this.buildPlayer(persona);
    this.buildHUD(persona);
    this.setupCamera();

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    this.player.update(delta);
    this.npc.update(delta);
    this.checkTerminalProximity();
  }

  // ─── World ──────────────────────────────────────────────────────────────

  private buildWorld(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x060d1a, 1);
    bg.fillRect(0, 0, WORLD_W, WORLD_H);

    // Blue grid
    bg.lineStyle(1, PALETTE.BLUE, 0.07);
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

    // Inner room
    const room = this.add.graphics();
    room.fillStyle(0x091422, 1);
    room.fillRect(60, 60, WORLD_W - 120, WORLD_H - 120);
    room.lineStyle(2, PALETTE.BLUE, 0.4);
    room.strokeRect(60, 60, WORLD_W - 120, WORLD_H - 120);

    // Title
    this.add
      .text(WORLD_W / 2, 80, "◆ MEMORY DISTRICT ◆", {
        fontSize: "13px",
        color: "#3b82f6",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0)
      .setDepth(2);

    this.add
      .text(WORLD_W / 2, 98, "GSMB · Grounded State Memory Buffer", {
        fontSize: "9px",
        color: "#1e3a5f",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 0)
      .setDepth(2);

    // Memory count display
    const count = this.memoryBridge.size();
    this.add
      .text(WORLD_W / 2, WORLD_H - 72, `${count} memories stored in GSMB`, {
        fontSize: "10px",
        color: "#1d4ed8",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setDepth(2);

    // List recent memory subjects
    const recent = this.memoryBridge.recent(4);
    recent.forEach((mem, idx) => {
      const subject =
        String(mem.subject).length > 38
          ? String(mem.subject).slice(0, 35) + "…"
          : String(mem.subject);
      this.add
        .text(
          WORLD_W / 2,
          WORLD_H - 56 + idx * 12,
          `· ${subject}`,
          {
            fontSize: "9px",
            color: "#1e3a5f",
            fontFamily: '"Courier New", monospace',
          }
        )
        .setOrigin(0.5)
        .setDepth(2);
    });
  }

  private buildMemoryNodes(): void {
    NODE_POSITIONS.forEach(({ x, y }, idx) => {
      const node = this.add
        .image(x, y, TEXTURE_KEYS.MEMORY_NODE)
        .setDepth(3)
        .setAlpha(0.7);

      // Float animation
      this.tweens.add({
        targets: node,
        y: y - 10 - (idx % 5) * 2,
        alpha: 0.4,
        duration: 1500 + idx * 200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  private buildTerminal(): void {
    const x = this.terminalX;
    const y = this.terminalY;

    // Glow
    const glow = this.add
      .ellipse(x, y, 90, 90, PALETTE.CYAN, 0.15)
      .setDepth(3);
    this.tweens.add({
      targets: glow,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.07,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Terminal sprite
    this.add.image(x, y, TEXTURE_KEYS.TERMINAL).setDepth(4);

    // Label
    this.add
      .text(x, y + 34, "Validation Terminal", {
        fontSize: "10px",
        color: "#22d3ee",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 0)
      .setDepth(5);

    // Hint (shown on proximity)
    this.terminalHint = this.add
      .text(x, y - 38, "[E] Validate a claim", {
        fontSize: "10px",
        color: "#22d3ee",
        fontFamily: '"Courier New", monospace',
        backgroundColor: "#060d1a",
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5, 1)
      .setDepth(6)
      .setAlpha(0);

    // Listen for interact event
    this.events.on("player:interact", this.handleTerminalInteract, this);
  }

  private checkTerminalProximity(): void {
    const dist = Phaser.Math.Distance.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      this.terminalX,
      this.terminalY
    );
    const near = dist < 72;

    if (near && !this.isNearTerminal) {
      this.tweens.add({ targets: this.terminalHint, alpha: 1, duration: 200 });
    } else if (!near && this.isNearTerminal) {
      this.tweens.add({ targets: this.terminalHint, alpha: 0, duration: 200 });
    }
    this.isNearTerminal = near;
  }

  private handleTerminalInteract(): void {
    if (!this.isNearTerminal) return;
    this.sceneManager.pauseAndLaunch(SCENE_KEYS.VALIDATION_DEMO, {
      returnScene: SCENE_KEYS.MEMORY_DISTRICT,
    });
  }

  // ─── NPC ───────────────────────────────────────────────────────────────

  private buildNPC(persona: string): void {
    this.npc = new DialogNPC(
      this,
      {
        ...ARCHIVIST_NPC_CONFIG,
        x: 350,
        y: 380,
        dialog: [
          `${persona}, the GSMB stores 4 memories.`,
          "Approach the Validation Terminal.",
          "Choose POC or FOC to test a claim.",
          "POC = passes all 3 pipeline stages.",
        ],
      },
      () => ({
        x: this.player.sprite.x,
        y: this.player.sprite.y,
      })
    );
    this.npc.create();
  }

  // ─── Player ──────────────────────────────────────────────────────────────

  private buildPlayer(persona: string): void {
    this.player = new Player(this, 500, 600, persona);
    this.player.create();
  }

  // ─── HUD ───────────────────────────────────────────────────────────────

  private buildHUD(persona: string): void {
    const { width, height } = this.scale;

    const topBar = this.add
      .rectangle(0, 0, width, 32, 0x060d1a, 0.92)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(50);
    topBar.setStrokeStyle(1, PALETTE.BLUE, 0.4);

    this.add
      .text(10, 9, `◆ ${persona}`, {
        fontSize: "11px",
        color: "#3b82f6",
        fontFamily: '"Courier New", monospace',
      })
      .setScrollFactor(0)
      .setDepth(51);

    this.add
      .text(width / 2, 9, "Memory District  ·  GSMB", {
        fontSize: "11px",
        color: "#9ca3af",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(51);

    // Return button
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

    returnBtn.on("pointerover", () =>
      returnBtn.setStyle({ color: "#6b7280" })
    );
    returnBtn.on("pointerout", () =>
      returnBtn.setStyle({ color: "#374151" })
    );
    returnBtn.on("pointerdown", () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.events.off("player:interact", this.handleTerminalInteract, this);
        this.sceneManager.goTo(SCENE_KEYS.GOVERNANCE_HALL);
      });
    });

    // Bottom hint
    const botBar = this.add
      .rectangle(0, height - 24, width, 24, 0x060d1a, 0.88)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(50);
    botBar.setStrokeStyle(1, PALETTE.BLUE, 0.3);

    this.add
      .text(
        width / 2,
        height - 12,
        "Arrow keys / WASD · [E] Interact · Walk to terminal to validate a claim",
        {
          fontSize: "10px",
          color: "#1d4ed8",
          fontFamily: '"Courier New", monospace',
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(51);
  }

  // ─── Camera ───────────────────────────────────────────────────────────

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
  }
}
