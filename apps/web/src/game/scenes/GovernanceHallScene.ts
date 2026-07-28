import Phaser from "phaser";
import { SCENE_KEYS, SceneManager } from "../SceneManager";
import { REGISTRY_KEYS } from "../registry";
import { PALETTE } from "../AssetManifest";
import { Player } from "../entities/Player";
import { DistrictPortal } from "../entities/DistrictPortal";
import type { DistrictPortalConfig } from "../entities/DistrictPortal";
import { DialogNPC, GUIDE_NPC_CONFIG } from "../entities/DialogNPC";

// ─── World dimensions ────────────────────────────────────────────────────────

const WORLD_W = 1600;
const WORLD_H = 1200;

// ─── District portal layout ───────────────────────────────────────────────────

const PORTAL_CONFIGS: DistrictPortalConfig[] = [
  // Row 1
  { id: "memory-district",               displayName: "Memory District",              emoji: "🧠", x: 280,  y: 280,  status: "active"      },
  { id: "telemetry-tower",               displayName: "Telemetry Tower",              emoji: "📡", x: 640,  y: 240,  status: "coming-soon" },
  { id: "crisis-connect-hq",             displayName: "Crisis Connect HQ",            emoji: "🆘", x: 1000, y: 280,  status: "coming-soon" },
  { id: "collective-ingress-observatory",displayName: "Collective Ingress",           emoji: "🌍", x: 1320, y: 240,  status: "coming-soon" },
  // Row 2
  { id: "hue-institute",                 displayName: "HUE Institute",                emoji: "💙", x: 280,  y: 600,  status: "coming-soon" },
  { id: "financial-exchange",            displayName: "Financial Exchange",           emoji: "💹", x: 640,  y: 640,  status: "coming-soon" },
  { id: "training-grounds",              displayName: "Training Grounds",             emoji: "⚔️", x: 1000, y: 600,  status: "coming-soon" },
  { id: "knowledge-library",             displayName: "Knowledge Library",            emoji: "📚", x: 1320, y: 640,  status: "coming-soon" },
  // Row 3
  { id: "agent-workshop",                displayName: "Agent Workshop",               emoji: "🤖", x: 800,  y: 960,  status: "coming-soon" },
];

/**
 * GovernanceHallScene – the central hub of Jennifer City.
 *
 * Features:
 *   - Top-down exploration with Arcade Physics
 *   - Player spawns at world centre
 *   - Camera follows the player (lerp)
 *   - Nine district portals; Memory District is the only active one
 *   - One NPC guide
 *   - Fixed-to-viewport HUD showing persona, district, interaction hint
 */
export class GovernanceHallScene extends Phaser.Scene {
  private sceneManager!: SceneManager;
  private player!: Player;
  private portals: DistrictPortal[] = [];
  private npcs: DialogNPC[] = [];

  // HUD elements (scrollFactor = 0)
  private hudPersona!: Phaser.GameObjects.Text;
  private hudDistrict!: Phaser.GameObjects.Text;
  private hudHint!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.GOVERNANCE_HALL });
  }

  create(): void {
    this.sceneManager = new SceneManager(this);

    const persona =
      (this.registry.get(REGISTRY_KEYS.PLAYER_NAME) as string) ??
      "Jennifer";

    // World + physics bounds
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    this.buildWorld();
    this.buildPortals();
    this.buildNPCs(persona);
    this.buildPlayer(persona);
    this.buildHUD(persona);
    this.setupCamera();

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    this.player.update(delta);
    for (const portal of this.portals) portal.update(delta);
    for (const npc of this.npcs) npc.update(delta);
  }

  // ─── World rendering ────────────────────────────────────────────────────

  private buildWorld(): void {
    const bg = this.add.graphics();

    // Outer fill
    bg.fillStyle(PALETTE.DARK, 1);
    bg.fillRect(0, 0, WORLD_W, WORLD_H);

    // Grid
    bg.lineStyle(1, PALETTE.PRIMARY, 0.05);
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

    // Hall floor
    const hall = this.add.graphics();
    hall.fillStyle(PALETTE.SURFACE_LIGHT, 1);
    hall.fillRect(80, 80, WORLD_W - 160, WORLD_H - 160);
    hall.lineStyle(2, PALETTE.BORDER, 0.9);
    hall.strokeRect(80, 80, WORLD_W - 160, WORLD_H - 160);

    // Corner pillars
    const pillars: [number, number][] = [
      [100, 100], [WORLD_W - 100, 100],
      [100, WORLD_H - 100], [WORLD_W - 100, WORLD_H - 100],
    ];
    for (const [px, py] of pillars) {
      hall.fillStyle(PALETTE.PRIMARY, 0.3);
      hall.fillRect(px - 12, py - 12, 24, 24);
      hall.lineStyle(1, PALETTE.PRIMARY, 0.7);
      hall.strokeRect(px - 12, py - 12, 24, 24);
    }

    // Central compass rose
    const cx = WORLD_W / 2;
    const cy = WORLD_H / 2;
    hall.lineStyle(1, PALETTE.PRIMARY, 0.15);
    hall.strokeCircle(cx, cy, 180);
    hall.lineStyle(1, PALETTE.PRIMARY, 0.08);
    hall.strokeCircle(cx, cy, 120);

    // Hall title (world-space, near top centre)
    this.add
      .text(WORLD_W / 2, 116, "◆ CENTRAL GOVERNANCE HALL ◆", {
        fontSize: "13px",
        color: "#6366f1",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0)
      .setDepth(2);

    this.add
      .text(WORLD_W / 2, 134, "Jennifer City · Governance Before Intelligence", {
        fontSize: "9px",
        color: "#374151",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 0)
      .setDepth(2);
  }

  private buildPortals(): void {
    this.portals = PORTAL_CONFIGS.map((cfg) => {
      const portal = new DistrictPortal(
        this,
        {
          ...cfg,
          onEnter:
            cfg.status === "active"
              ? () => this.enterDistrict(cfg.id)
              : undefined,
        },
        () => ({
          x: this.player.sprite.x,
          y: this.player.sprite.y,
        })
      );
      portal.create();
      return portal;
    });
  }

  private buildNPCs(persona: string): void {
    const guide = new DialogNPC(
      this,
      {
        ...GUIDE_NPC_CONFIG,
        x: WORLD_W / 2 + 120,
        y: WORLD_H / 2,
        dialog: [
          `Welcome, ${persona}!`,
          "The Memory District portal is to the north-west.",
          "Walk close and press [E] to enter.",
          "Governance before Intelligence.",
        ],
      },
      () => ({
        x: this.player.sprite.x,
        y: this.player.sprite.y,
      })
    );
    guide.create();
    this.npcs.push(guide);
  }

  private buildPlayer(persona: string): void {
    this.player = new Player(this, WORLD_W / 2, WORLD_H / 2, persona);
    this.player.create();
  }

  // ─── HUD (fixed to viewport) ──────────────────────────────────────────────

  private buildHUD(persona: string): void {
    const { width, height } = this.scale;

    // Top bar background
    const topBar = this.add
      .rectangle(0, 0, width, 32, PALETTE.SURFACE, 0.92)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(50);
    topBar.setStrokeStyle(1, PALETTE.BORDER);

    this.hudPersona = this.add
      .text(10, 9, `◆ ${persona}`, {
        fontSize: "11px",
        color: "#6366f1",
        fontFamily: '"Courier New", monospace',
      })
      .setScrollFactor(0)
      .setDepth(51);

    this.hudDistrict = this.add
      .text(width / 2, 9, "Central Governance Hall", {
        fontSize: "11px",
        color: "#9ca3af",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(51);

    this.add
      .text(width - 10, 9, "Jennifer City", {
        fontSize: "11px",
        color: "#374151",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(51);

    // Bottom hint bar
    const botBar = this.add
      .rectangle(0, height - 24, width, 24, PALETTE.SURFACE, 0.88)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(50);
    botBar.setStrokeStyle(1, PALETTE.BORDER);

    this.hudHint = this.add
      .text(width / 2, height - 12, "Arrow keys / WASD to move · [E] Interact", {
        fontSize: "10px",
        color: "#4b5563",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(51);
  }

  // ─── Camera ───────────────────────────────────────────────────────────────

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
  }

  // ─── Transitions ─────────────────────────────────────────────────────────

  private enterDistrict(districtId: string): void {
    if (districtId === "memory-district") {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.sceneManager.goTo(SCENE_KEYS.MEMORY_DISTRICT);
      });
    }
  }
}
