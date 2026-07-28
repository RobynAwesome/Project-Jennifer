import Phaser from "phaser";
import { GameEntity, type IComponent } from "./Entity";
import { TEXTURE_KEYS, PALETTE } from "../AssetManifest";

export type PortalStatus = "active" | "locked" | "coming-soon";

export interface DistrictPortalConfig {
  id: string;
  displayName: string;
  emoji: string;
  x: number;
  y: number;
  status: PortalStatus;
  onEnter?: () => void;
}

// ─── Component: Interaction zone ─────────────────────────────────────────────

class InteractionZoneComponent implements IComponent {
  private label!: Phaser.GameObjects.Text;
  private wasNear = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly portalX: number,
    private readonly portalY: number,
    private readonly getPlayerPos: () => { x: number; y: number },
    private readonly onEnter: () => void,
    private readonly status: PortalStatus
  ) {
    this.label = scene.add
      .text(portalX, portalY + 54, "", {
        fontSize: "10px",
        color: "#22d3ee",
        fontFamily: '"Courier New", monospace',
        backgroundColor: "#0f0f1a",
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5, 0)
      .setDepth(12)
      .setAlpha(0);
  }

  update(_delta: number): void {
    if (this.status !== "active") return;

    const pos = this.getPlayerPos();
    const dist = Phaser.Math.Distance.Between(
      pos.x,
      pos.y,
      this.portalX,
      this.portalY
    );
    const isNear = dist < 80;

    if (isNear && !this.wasNear) {
      this.label.setText("[E] Enter district");
      this.scene.tweens.add({
        targets: this.label,
        alpha: 1,
        duration: 200,
      });
    } else if (!isNear && this.wasNear) {
      this.scene.tweens.add({
        targets: this.label,
        alpha: 0,
        duration: 200,
      });
    }
    this.wasNear = isNear;

    // Trigger entry on scene interact event while near
    if (isNear) {
      this.scene.events.once("player:interact", () => {
        if (this.wasNear) this.onEnter();
      });
    }
  }

  destroy(): void {
    this.label?.destroy();
  }
}

// ─── DistrictPortal entity ───────────────────────────────────────────────────

export class DistrictPortal extends GameEntity {
  private visual!: Phaser.GameObjects.Image;
  private emojiText!: Phaser.GameObjects.Text;
  private nameText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private glowRect!: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    private readonly config: DistrictPortalConfig,
    private readonly getPlayerPos: () => { x: number; y: number }
  ) {
    super(scene, config.x, config.y);
  }

  create(): void {
    const { x, y, status, displayName, emoji, onEnter } = this.config;
    const textureKey =
      status === "active" ? TEXTURE_KEYS.PORTAL_ACTIVE : TEXTURE_KEYS.PORTAL_LOCKED;

    // Active portal gets a background glow rectangle
    if (status === "active") {
      this.glowRect = this.scene.add
        .rectangle(x, y, 100, 100, PALETTE.BLUE, 0.12)
        .setDepth(3);

      this.scene.tweens.add({
        targets: this.glowRect,
        scaleX: 1.15,
        scaleY: 1.15,
        alpha: 0.06,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // Portal body
    this.visual = this.scene.add.image(x, y, textureKey).setDepth(4);
    if (status === "active") {
      this.scene.tweens.add({
        targets: this.visual,
        y: y - 4,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // Emoji icon
    this.emojiText = this.scene.add
      .text(x, y - 8, emoji, { fontSize: "24px" })
      .setOrigin(0.5)
      .setDepth(5);

    // District name
    const nameColor =
      status === "active" ? "#60a5fa" : status === "locked" ? "#4b5563" : "#374151";
    this.nameText = this.scene.add
      .text(x, y + 50, displayName, {
        fontSize: "10px",
        color: nameColor,
        fontFamily: '"Courier New", monospace',
        wordWrap: { width: 90 },
        align: "center",
      })
      .setOrigin(0.5, 0)
      .setDepth(5);

    // Status badge
    const statusLabel =
      status === "active"
        ? "● OPEN"
        : status === "locked"
        ? "🔒 LOCKED"
        : "⌛ SOON";
    const statusColor =
      status === "active" ? "#10b981" : status === "locked" ? "#6b7280" : "#4b5563";

    this.statusText = this.scene.add
      .text(x, y + 62, statusLabel, {
        fontSize: "9px",
        color: statusColor,
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 0)
      .setDepth(5);

    // Interaction component (only meaningful for active portals)
    if (status === "active" && onEnter) {
      this.addComponent(
        "interaction",
        new InteractionZoneComponent(
          this.scene,
          x,
          y,
          this.getPlayerPos,
          onEnter,
          status
        )
      );
    }
  }

  protected override onDestroy(): void {
    this.visual?.destroy();
    this.emojiText?.destroy();
    this.nameText?.destroy();
    this.statusText?.destroy();
    this.glowRect?.destroy();
  }
}
