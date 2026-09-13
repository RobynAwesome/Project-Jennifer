import Phaser from "@/game/phaser-runtime";
import { districtHasPlayableScene, isDistrictName } from "@jennifer/shared";
import { DISTRICT_SCENE_KEYS, SCENE_KEYS, SceneManager } from "../SceneManager";
import { REGISTRY_KEYS } from "../registry";
import { PALETTE } from "../AssetManifest";
import { Player } from "../entities/Player";
import { DistrictPortal } from "../entities/DistrictPortal";
import type { DistrictPortalConfig } from "../entities/DistrictPortal";
import { DialogNPC, GUIDE_NPC_CONFIG } from "../entities/DialogNPC";
import { CompanionPresence } from "../entities/CompanionPresence";
import { openConsequenceJournal } from "../open-consequence-journal";
import { WorldBridge } from "../bridge/WorldBridge";
import { fadeToIfLive, sceneIsLive } from "../scene-lifecycle";
import {
  OrchestrationRibbon,
  readStoredHeartbeat,
} from "../hud/OrchestrationRibbon";

// ─── World dimensions ────────────────────────────────────────────────────────

const MIN_WORLD_W = 960;
const MIN_WORLD_H = 640;

// ─── District portal layout (fractions of the hall floor) ─────────────────────

const PORTAL_LAYOUT: Array<
  Omit<DistrictPortalConfig, "status" | "onEnter" | "x" | "y"> & {
    fx: number;
    fy: number;
  }
> = [
  { id: "memory-district", displayName: "Memory District", emoji: "🧠", fx: 0.14, fy: 0.18 },
  { id: "telemetry-tower", displayName: "Telemetry Tower", emoji: "📡", fx: 0.38, fy: 0.16 },
  { id: "crisis-connect-hq", displayName: "Crisis Connect HQ", emoji: "🆘", fx: 0.62, fy: 0.18 },
  { id: "collective-ingress-observatory", displayName: "Collective Ingress", emoji: "🌍", fx: 0.86, fy: 0.16 },
  { id: "hue-institute", displayName: "HUE Institute", emoji: "💙", fx: 0.14, fy: 0.5 },
  { id: "financial-exchange", displayName: "Financial Exchange", emoji: "💹", fx: 0.38, fy: 0.52 },
  { id: "training-grounds", displayName: "Training Grounds", emoji: "⚔️", fx: 0.62, fy: 0.5 },
  { id: "knowledge-library", displayName: "Knowledge Library", emoji: "📚", fx: 0.86, fy: 0.52 },
  { id: "agent-workshop", displayName: "Agent Workshop", emoji: "🤖", fx: 0.5, fy: 0.82 },
];

function portalStatus(id: string): DistrictPortalConfig["status"] {
  return isDistrictName(id) && districtHasPlayableScene(id) ? "active" : "coming-soon";
}

/**
 * GovernanceHallScene – the central hub of Jennifer City.
 *
 * Features:
 *   - Top-down exploration with Arcade Physics
 *   - Player spawns at world centre
 *   - Camera frames the whole hall so every portal stays on screen
 *   - Nine district portals; each opens an admitted observation or dedicated scene
 *   - One NPC guide
 *   - Fixed-to-viewport HUD showing persona, district, interaction hint
 */
export class GovernanceHallScene extends Phaser.Scene {
  private sceneManager!: SceneManager;
  private worldBridge = new WorldBridge();
  private player!: Player;
  private portals: DistrictPortal[] = [];
  private npcs: DialogNPC[] = [];
  private worldW = MIN_WORLD_W;
  private worldH = MIN_WORLD_H;

  // HUD elements (scrollFactor = 0)
  private hudPersona!: Phaser.GameObjects.Text;
  private hudDistrict!: Phaser.GameObjects.Text;
  private hudHint!: Phaser.GameObjects.Text;
  private ribbon!: OrchestrationRibbon;
  private entering = false;
  private companion?: CompanionPresence;

  constructor() {
    super({ key: SCENE_KEYS.GOVERNANCE_HALL });
  }

  create(): void {
    this.sceneManager = new SceneManager(this);

    const persona =
      (this.registry.get(REGISTRY_KEYS.PLAYER_NAME) as string) ??
      "Jennifer";

    this.worldW = Math.max(MIN_WORLD_W, this.scale.width);
    this.worldH = Math.max(MIN_WORLD_H, this.scale.height);
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);

    this.buildWorld();
    this.buildPortals();
    this.buildNPCs(persona);
    this.buildPlayer(persona);
    this.companion = new CompanionPresence(this, () => ({
      x: this.player.sprite.x,
      y: this.player.sprite.y,
    }));
    this.companion.create(this.player.sprite.x - 36, this.player.sprite.y + 28);
    this.buildHUD(persona);
    this.input.keyboard?.on("keydown-J", () => openConsequenceJournal());
    this.setupCamera();
    this.scale.on("resize", this.fitHallCamera, this);
    this.events.once("shutdown", () => {
      this.scale.off("resize", this.fitHallCamera, this);
    });

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      const index = Number(event.key);
      if (!Number.isInteger(index) || index < 1 || index > PORTAL_LAYOUT.length) {
        return;
      }
      const portal = PORTAL_LAYOUT[index - 1];
      if (portal) void this.enterDistrict(portal.id);
    });

    this.cameras.main?.fadeIn(400, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    if (!sceneIsLive(this)) return;
    this.player.update(delta);
    for (const portal of this.portals) portal.update(delta);
    for (const npc of this.npcs) npc.update(delta);
    this.companion?.update();
  }

  // ─── World rendering ────────────────────────────────────────────────────

  private buildWorld(): void {
    const bg = this.add.graphics();

    // Outer fill
    bg.fillStyle(PALETTE.DARK, 1);
    bg.fillRect(0, 0, this.worldW, this.worldH);

    // Grid
    bg.lineStyle(1, PALETTE.PRIMARY, 0.05);
    for (let x = 0; x <= this.worldW; x += 40) {
      bg.beginPath();
      bg.moveTo(x, 0);
      bg.lineTo(x, this.worldH);
      bg.strokePath();
    }
    for (let y = 0; y <= this.worldH; y += 40) {
      bg.beginPath();
      bg.moveTo(0, y);
      bg.lineTo(this.worldW, y);
      bg.strokePath();
    }

    // Hall floor
    const hall = this.add.graphics();
    hall.fillStyle(PALETTE.SURFACE_LIGHT, 1);
    hall.fillRect(80, 80, this.worldW - 160, this.worldH - 160);
    hall.lineStyle(2, PALETTE.BORDER, 0.9);
    hall.strokeRect(80, 80, this.worldW - 160, this.worldH - 160);

    // Corner pillars
    const pillars: [number, number][] = [
      [100, 100], [this.worldW - 100, 100],
      [100, this.worldH - 100], [this.worldW - 100, this.worldH - 100],
    ];
    for (const [px, py] of pillars) {
      hall.fillStyle(PALETTE.PRIMARY, 0.3);
      hall.fillRect(px - 12, py - 12, 24, 24);
      hall.lineStyle(1, PALETTE.PRIMARY, 0.7);
      hall.strokeRect(px - 12, py - 12, 24, 24);
    }

    // Central compass rose
    const cx = this.worldW / 2;
    const cy = this.worldH / 2;
    hall.lineStyle(1, PALETTE.PRIMARY, 0.15);
    hall.strokeCircle(cx, cy, 180);
    hall.lineStyle(1, PALETTE.PRIMARY, 0.08);
    hall.strokeCircle(cx, cy, 120);

    // Hall title (world-space, near top centre)
    this.add
      .text(this.worldW / 2, 116, "◆ CENTRAL GOVERNANCE HALL ◆", {
        fontSize: "13px",
        color: "#6366f1",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0)
      .setDepth(2);

    this.add
      .text(this.worldW / 2, 134, "Jennifer City · Governance Before Intelligence", {
        fontSize: "9px",
        color: "#374151",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 0)
      .setDepth(2);
  }

  private buildPortals(): void {
    this.portals = PORTAL_LAYOUT.map((cfg) => {
      const status = portalStatus(cfg.id);
      const portal = new DistrictPortal(
        this,
        {
          id: cfg.id,
          displayName: cfg.displayName,
          emoji: cfg.emoji,
          x: 80 + cfg.fx * (this.worldW - 160),
          y: 80 + cfg.fy * (this.worldH - 160),
          status,
          onEnter:
            status === "active"
              ? () => {
                  void this.enterDistrict(cfg.id);
                }
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
        x: this.worldW / 2 + 120,
        y: this.worldH / 2,
        dialog: [
          `Welcome, ${persona}.`,
          "Start in Memory District — the amber Signal Breach is the love loop.",
          "Your companion walks with you. J opens the consequence journal.",
          "Other portals are observation boards. They are not the whole game.",
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
    this.player = new Player(this, this.worldW / 2, this.worldH / 2, persona);
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
      .text(width / 2, height - 12, "1-9 enter a portal · WASD · [E] enter · J journal", {
        fontSize: "10px",
        color: "#4b5563",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(51);

    this.ribbon = new OrchestrationRibbon(this);
    const stored = readStoredHeartbeat(
      this.registry.get(REGISTRY_KEYS.LAST_WORLD_RECEIPT),
    );
    if (stored) this.ribbon.show(stored);
  }

  // ─── Camera ───────────────────────────────────────────────────────────────

  private setupCamera(): void {
    this.fitHallCamera();
  }

  private fitHallCamera(): void {
    const camera = this.cameras.main;
    if (!camera) return;
    camera.setBounds(0, 0, this.worldW, this.worldH);
    camera.stopFollow();
    const zoom = Math.min(
      camera.width / this.worldW,
      camera.height / this.worldH,
      1,
    );
    camera.setZoom(zoom);
    camera.centerOn(this.worldW / 2, this.worldH / 2);
  }

  // ─── Transitions ─────────────────────────────────────────────────────────

  private async enterDistrict(districtId: string): Promise<void> {
    if (this.entering) return;
    if (!isDistrictName(districtId) || !districtHasPlayableScene(districtId)) {
      return;
    }

    this.entering = true;
    const actorId =
      (this.registry.get(REGISTRY_KEYS.PLAYER_NAME) as string) ?? "player";
    const receipt = await this.worldBridge.enterDistrict(actorId, districtId);

    if (!sceneIsLive(this)) return;

    this.registry.set(REGISTRY_KEYS.LAST_WORLD_RECEIPT, JSON.stringify(receipt));
    if (this.hudHint.active) {
      this.hudHint.setText(
        `${receipt.status} · ${receipt.sourceMode} · ${receipt.summary}`,
      );
    }
    this.ribbon.show(receipt);

    const sceneKey = DISTRICT_SCENE_KEYS[districtId];
    if (!sceneKey) {
      this.entering = false;
      return;
    }

    this.time.delayedCall(800, () => {
      fadeToIfLive(this, () => {
        this.sceneManager.goTo(sceneKey, { district: districtId });
      });
    });
  }
}
