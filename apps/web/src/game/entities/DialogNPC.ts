import Phaser from "phaser";
import { GameEntity, PingPongPatrolComponent } from "./Entity";
import { PALETTE } from "../AssetManifest";

export interface DialogNPCConfig {
  textureKey: string;
  name: string;
  role: string;
  dialog: string[];
  x: number;
  y: number;
  patrolRange?: number;
}

// ─── DialogNPC entity ─────────────────────────────────────────────────────────

export class DialogNPC extends GameEntity {
  private sprite!: Phaser.Physics.Arcade.Image;
  private nameLabel!: Phaser.GameObjects.Text;
  private roleLabel!: Phaser.GameObjects.Text;
  private bubble!: Phaser.GameObjects.Text;
  private currentDialogIndex = 0;
  private isNear = false;

  constructor(
    scene: Phaser.Scene,
    private readonly config: DialogNPCConfig,
    private readonly getPlayerPos: () => { x: number; y: number }
  ) {
    super(scene, config.x, config.y);
  }

  create(): void {
    const { x, y, textureKey, name, role, patrolRange = 60 } = this.config;

    // Physics sprite for patrol
    this.sprite = this.scene.physics.add.image(x, y, textureKey).setDepth(8);
    this.sprite.setImmovable(true);

    // Name label
    this.nameLabel = this.scene.add
      .text(x, y - 26, name, {
        fontSize: "10px",
        color: "#fcd34d",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 1)
      .setDepth(9);

    // Role label
    this.roleLabel = this.scene.add
      .text(x, y - 16, role, {
        fontSize: "9px",
        color: "#6b7280",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 1)
      .setDepth(9);

    // Dialog bubble (hidden until player is near)
    this.bubble = this.scene.add
      .text(x, y - 44, "", {
        fontSize: "10px",
        color: "#e5e7eb",
        fontFamily: '"Courier New", monospace',
        backgroundColor: "#1a1a2e",
        padding: { x: 6, y: 4 },
        wordWrap: { width: 160 },
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setDepth(10)
      .setAlpha(0);

    // Patrol component
    this.addComponent(
      "patrol",
      new PingPongPatrolComponent(
        this.sprite.body as Phaser.Physics.Arcade.Body,
        x - patrolRange,
        x + patrolRange,
        40
      )
    );

    // Listen for interact events while the player is near this NPC
    this.scene.events.on("player:interact", this.handleInteract, this);
  }

  override update(delta: number): void {
    super.update(delta);

    // Sync labels to sprite
    this.nameLabel.setPosition(this.sprite.x, this.sprite.y - 20);
    this.roleLabel.setPosition(this.sprite.x, this.sprite.y - 11);
    this.bubble.setPosition(this.sprite.x, this.sprite.y - 44);

    // Show bubble when player is close
    const pos = this.getPlayerPos();
    const dist = Phaser.Math.Distance.Between(
      pos.x,
      pos.y,
      this.sprite.x,
      this.sprite.y
    );
    const near = dist < 90;

    if (near && !this.isNear) {
      this.bubble.setText(
        this.config.dialog[this.currentDialogIndex] ?? ""
      );
      this.scene.tweens.add({ targets: this.bubble, alpha: 1, duration: 200 });
    } else if (!near && this.isNear) {
      this.scene.tweens.add({ targets: this.bubble, alpha: 0, duration: 200 });
    }
    this.isNear = near;
  }

  private handleInteract(): void {
    if (!this.isNear) return;
    // Cycle through dialog lines
    this.currentDialogIndex =
      (this.currentDialogIndex + 1) % this.config.dialog.length;
    this.bubble.setText(this.config.dialog[this.currentDialogIndex] ?? "");
  }

  protected override onDestroy(): void {
    this.scene.events.off("player:interact", this.handleInteract, this);
    this.sprite?.destroy();
    this.nameLabel?.destroy();
    this.roleLabel?.destroy();
    this.bubble?.destroy();
  }
}

// ─── NPC configurations for the vertical slice ───────────────────────────────

import { TEXTURE_KEYS } from "../AssetManifest";

export const GUIDE_NPC_CONFIG: Omit<DialogNPCConfig, "x" | "y"> = {
  textureKey: TEXTURE_KEYS.NPC_GUIDE,
  name: "Ariel",
  role: "City Guide",
  dialog: [
    "Welcome to Jennifer City.",
    "Head to the Memory District portal.",
    "Walk close and press [E] to enter.",
    "Governance before Intelligence.",
  ],
  patrolRange: 50,
};

export const ARCHIVIST_NPC_CONFIG: Omit<DialogNPCConfig, "x" | "y"> = {
  textureKey: TEXTURE_KEYS.NPC_ARCHIVIST,
  name: "Mira",
  role: "Memory Archivist",
  dialog: [
    "The GSMB stores all runtime state.",
    "Every memory is scored by importance.",
    "Validate a claim at the terminal.",
    "POC = Proof of Concept. FOC = Failure.",
  ],
  patrolRange: 40,
};
