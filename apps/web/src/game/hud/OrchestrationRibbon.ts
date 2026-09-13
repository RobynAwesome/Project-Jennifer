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
    const { width } = scene.scale;
    this.panel = scene.add
      .rectangle(0, 32, width, 72, PALETTE.SURFACE, 0.94)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(49)
      .setStrokeStyle(1, PALETTE.PRIMARY, 0.35);

    this.text = scene.add
      .text(width / 2, 68, "Heartbeat idle · enter a portal to run PKA → KPGS", {
        fontSize: "11px",
        color: "#9ca3af",
        fontFamily: '"Courier New", monospace',
        align: "center",
        lineSpacing: 4,
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
  const glm = view.glmSummary ? `GLM ${view.glmSummary}` : "GLM —";
  const ccp = view.ccpReason ? `CCP ${view.ccpReason}` : "CCP —";
  return [
    `${trace}   ${view.status}   ${view.district}`,
    `PKA ${pka}   ·   KPGS ${kpgs}`,
    `${glm}   ·   ${ccp}`,
    `${view.sourceMode} · ${view.summary} · not canon`,
  ].join("\n");
}

export function heartbeatOneLiner(view: DistrictEnterReceiptView): string {
  const pka = view.pkaDisposition ?? "—";
  const kpgs = view.kpgsStatus ?? "—";
  return `${view.status} · PKA ${pka} · KPGS ${kpgs} · not canon`;
}

export function attachHeartbeatLine(scene: Phaser.Scene, raw: unknown): void {
  const stored = readStoredHeartbeat(raw);
  if (!stored) return;
  const { width } = scene.scale;
  scene.add
    .text(width / 2, 40, heartbeatOneLiner(stored), {
      fontSize: "10px",
      color: stored.status === "EXECUTED" ? "#a5b4fc" : "#fbbf24",
      fontFamily: '"Courier New", monospace',
    })
    .setOrigin(0.5, 0)
    .setScrollFactor(0)
    .setDepth(51);
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
