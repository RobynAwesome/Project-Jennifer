import type Phaser from "phaser";
import { PALETTE } from "../AssetManifest";
import type { DistrictEnterReceiptView } from "../bridge/WorldBridge";

/**
 * Player-safe view of the world-event heartbeat.
 * EP / PKA / KPGS are shown as observation. Not canon.
 */
export class OrchestrationRibbon {
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    this.panel = scene.add
      .rectangle(0, height - 92, width, 68, PALETTE.SURFACE, 0.94)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(49)
      .setStrokeStyle(1, PALETTE.PRIMARY, 0.35);

    this.text = scene.add
      .text(width / 2, height - 58, "Heartbeat idle · enter a portal to run PKA → KPGS", {
        fontSize: "11px",
        color: "#9ca3af",
        fontFamily: '"Courier New", monospace',
        align: "center",
        lineSpacing: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(51);
  }

  show(view: DistrictEnterReceiptView): void {
    this.text.setText(formatHeartbeat(view));
    this.text.setColor(view.status === "EXECUTED" ? "#a5b4fc" : "#fbbf24");
  }
}

export function formatHeartbeat(view: DistrictEnterReceiptView): string {
  const trace = view.epTrace.length > 0 ? view.epTrace.join(" ") : "—";
  const pka = [view.pkaDisposition, view.pkaState].filter(Boolean).join(" · ") || "PKA n/a";
  const kpgs = [view.kpgsStatus, view.kpgsAuthority].filter(Boolean).join(" · ") || "KPGS n/a";
  return [
    `${trace}   ${view.status}   ${view.district}`,
    `PKA ${pka}`,
    `KPGS ${kpgs}`,
    `${view.sourceMode} · ${view.summary} · not canon`,
  ].join("\n");
}

export function readStoredHeartbeat(
  raw: unknown,
): DistrictEnterReceiptView | null {
  if (typeof raw !== "string" || raw.length === 0) return null;
  try {
    const parsed = JSON.parse(raw) as DistrictEnterReceiptView;
    if (!parsed.status || !parsed.district) return null;
    return parsed;
  } catch {
    return null;
  }
}
