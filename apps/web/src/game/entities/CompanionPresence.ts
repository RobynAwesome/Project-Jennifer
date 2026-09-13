import Phaser from "@/game/phaser-runtime";
import { getCompanionDefinition, isCompanionId } from "@jennifer/shared";
import { TEXTURE_KEYS } from "../AssetManifest";
import { REGISTRY_KEYS } from "../registry";

/**
 * Walkable stand-in for the already-selected companion.
 * Not a second companion. Not KPGSthree art. Phaser token only.
 */
export class CompanionPresence {
  private sprite?: Phaser.GameObjects.Image;
  private label?: Phaser.GameObjects.Text;
  private glow?: Phaser.GameObjects.Ellipse;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly getPlayerPos: () => { x: number; y: number },
  ) {}

  create(x: number, y: number): void {
    const id = this.scene.registry.get(REGISTRY_KEYS.COMPANION_ID);
    const name = this.scene.registry.get(REGISTRY_KEYS.COMPANION_NAME);
    if (typeof id !== "string" || !id || typeof name !== "string" || !name) {
      return;
    }

    const catalog = isCompanionId(id) ? getCompanionDefinition(id) : undefined;
    const tint = hexToNumber(catalog?.visual.primaryColor ?? "#a855f7");

    this.glow = this.scene.add
      .ellipse(x, y, 40, 40, tint, 0.16)
      .setDepth(8);
    this.sprite = this.scene.add
      .image(x, y, TEXTURE_KEYS.NPC_GUIDE)
      .setTint(tint)
      .setDepth(9);
    this.label = this.scene.add
      .text(x, y - 22, name, {
        fontSize: "10px",
        color: "#e9d5ff",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 1)
      .setDepth(10);
  }

  update(): void {
    if (!this.sprite || !this.label || !this.glow) return;
    const player = this.getPlayerPos();
    const targetX = player.x - 36;
    const targetY = player.y + 28;
    this.sprite.x += (targetX - this.sprite.x) * 0.08;
    this.sprite.y += (targetY - this.sprite.y) * 0.08;
    this.glow.setPosition(this.sprite.x, this.sprite.y);
    this.label.setPosition(this.sprite.x, this.sprite.y - 20);
  }

  destroy(): void {
    this.sprite?.destroy();
    this.label?.destroy();
    this.glow?.destroy();
  }
}

function hexToNumber(hex: string): number {
  const cleaned = hex.replace("#", "");
  const parsed = Number.parseInt(cleaned, 16);
  return Number.isFinite(parsed) ? parsed : 0xa855f7;
}
