import Phaser from "phaser";
import { SCENE_KEYS, SceneManager } from "../SceneManager";
import { REGISTRY_KEYS } from "../registry";
import { PALETTE } from "../AssetManifest";
import { GovernanceBridge } from "../bridge/GovernanceBridge";
import { ValidationBridge } from "../bridge/ValidationBridge";
import { MemoryBridge } from "../bridge/MemoryBridge";
import type { ValidationReport } from "../bridge/ValidationBridge";

// ─── Demo state machine ───────────────────────────────────────────────────────

type DemoState =
  | "briefing"        // Mission intro + path choice buttons
  | "running"         // Animation running, pipeline executing
  | "verdict";        // Report complete, show result + close button

/**
 * ValidationDemoScene – the POC vs FOC mission.
 *
 * Launched as an overlay on top of MemoryDistrictScene.
 * Uses the REAL ValidationPipeline from @jennifer/validation so every stage
 * result displayed is produced by the actual governance runtime.
 *
 * Flow:
 *   Briefing → player picks "POC Path" or "FOC Path"
 *   → policy stage lights up (300 ms delay)
 *   → confidence stage lights up
 *   → reality stage lights up (if reached)
 *   → verdict shown (PASSED / FAILED + which stage failed)
 *   → "Close Mission" returns to MemoryDistrictScene
 */
export class ValidationDemoScene extends Phaser.Scene {
  private sceneManager!: SceneManager;
  private governanceBridge!: GovernanceBridge;
  private validationBridge!: ValidationBridge;
  private memoryBridge!: MemoryBridge;
  private persona!: string;
  private state: DemoState = "briefing";

  // Stage indicator texts
  private stageTexts: Record<string, Phaser.GameObjects.Text> = {};
  private stageIcons: Record<string, Phaser.GameObjects.Text> = {};

  // Button refs so we can disable them
  private pocBtn!: Phaser.GameObjects.Text;
  private focBtn!: Phaser.GameObjects.Text;

  // Report panel refs
  private reasonLines!: Phaser.GameObjects.Text;
  private verdictText!: Phaser.GameObjects.Text;
  private closeBtn!: Phaser.GameObjects.Text;
  private statusLabel!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.VALIDATION_DEMO });
  }

  init(data: Record<string, unknown>): void {
    // data.returnScene is set by MemoryDistrictScene
    this.data.set("returnScene", data.returnScene ?? SCENE_KEYS.MEMORY_DISTRICT);
  }

  create(): void {
    this.sceneManager = new SceneManager(this);
    this.governanceBridge = new GovernanceBridge();
    this.validationBridge = new ValidationBridge(this.governanceBridge);
    this.memoryBridge = new MemoryBridge();
    this.persona =
      (this.registry.get(REGISTRY_KEYS.PLAYER_NAME) as string) ?? "Jennifer";

    const { width, height } = this.scale;

    this.buildOverlay(width, height);
    this.buildMissionPanel(width, height);

    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  // ─── Overlay dim ─────────────────────────────────────────────────────────

  private buildOverlay(w: number, h: number): void {
    this.add
      .rectangle(w / 2, h / 2, w, h, 0x000000, 0.7)
      .setDepth(60);
  }

  // ─── Mission panel ────────────────────────────────────────────────────────

  private buildMissionPanel(w: number, h: number): void {
    const panelW = 520;
    const panelH = 400;
    const cx = w / 2;
    const cy = h / 2;

    // Panel background
    const panelBg = this.add
      .rectangle(cx, cy, panelW, panelH, PALETTE.SURFACE, 0.98)
      .setDepth(61);
    panelBg.setStrokeStyle(2, PALETTE.PRIMARY, 1);

    // ── Title ──
    this.add
      .text(cx, cy - panelH / 2 + 18, "◆ VALIDATION MISSION ◆", {
        fontSize: "14px",
        color: "#6366f1",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(62);

    // ── Sub-title ──
    this.add
      .text(cx, cy - panelH / 2 + 38, "POC vs FOC · Memory District Signal", {
        fontSize: "10px",
        color: "#6b7280",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setDepth(62);

    // ── Divider ──
    const divGfx = this.add.graphics().setDepth(62);
    divGfx.lineStyle(1, PALETTE.BORDER, 0.8);
    divGfx.beginPath();
    divGfx.moveTo(cx - 220, cy - panelH / 2 + 54);
    divGfx.lineTo(cx + 220, cy - panelH / 2 + 54);
    divGfx.strokePath();

    // ── Claim text ──
    this.add
      .text(
        cx,
        cy - panelH / 2 + 72,
        '"Public sentiment has shifted positively\nfollowing the Memory District governance update."',
        {
          fontSize: "11px",
          color: "#e5e7eb",
          fontFamily: '"Courier New", monospace',
          align: "center",
          wordWrap: { width: 460 },
          lineSpacing: 4,
        }
      )
      .setOrigin(0.5, 0)
      .setDepth(62);

    // ── Pipeline stage indicators ──
    this.buildPipelineIndicators(cx, cy);

    // ── Reason / result lines ──
    this.reasonLines = this.add
      .text(cx, cy + 48, "", {
        fontSize: "10px",
        color: "#6b7280",
        fontFamily: '"Courier New", monospace',
        align: "center",
        wordWrap: { width: 460 },
        lineSpacing: 3,
      })
      .setOrigin(0.5, 0)
      .setDepth(62);

    // ── Status label (running indicator) ──
    this.statusLabel = this.add
      .text(cx, cy + 90, "", {
        fontSize: "10px",
        color: "#9ca3af",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setDepth(62);

    // ── Verdict text (hidden initially) ──
    this.verdictText = this.add
      .text(cx, cy + 110, "", {
        fontSize: "18px",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(62)
      .setAlpha(0);

    // ── Path choice buttons ──
    this.buildPathButtons(cx, cy, panelH);

    // ── Close button (hidden initially) ──
    this.closeBtn = this.add
      .text(cx, cy + panelH / 2 - 22, "✕  Close Mission", {
        fontSize: "12px",
        color: "#9ca3af",
        fontFamily: '"Courier New", monospace',
        backgroundColor: "#1f2937",
        padding: { x: 20, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(62)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true });

    this.closeBtn.on("pointerover", () =>
      this.closeBtn.setStyle({ color: "#e5e7eb" })
    );
    this.closeBtn.on("pointerout", () =>
      this.closeBtn.setStyle({ color: "#9ca3af" })
    );
    this.closeBtn.on("pointerdown", () => this.closeMission());
  }

  private buildPipelineIndicators(cx: number, cy: number): void {
    const stages = [
      { key: "policy",     label: "POLICY",     x: cx - 160 },
      { key: "confidence", label: "CONFIDENCE", x: cx       },
      { key: "reality",    label: "REALITY",    x: cx + 160 },
    ];

    // Connector lines
    const lineGfx = this.add.graphics().setDepth(62);
    lineGfx.lineStyle(1, PALETTE.BORDER, 0.6);
    lineGfx.beginPath();
    lineGfx.moveTo(cx - 130, cy - 10);
    lineGfx.lineTo(cx - 30,  cy - 10);
    lineGfx.strokePath();
    lineGfx.beginPath();
    lineGfx.moveTo(cx + 30,  cy - 10);
    lineGfx.lineTo(cx + 130, cy - 10);
    lineGfx.strokePath();

    for (const stage of stages) {
      // Stage icon (●)
      this.stageIcons[stage.key] = this.add
        .text(stage.x, cy - 22, "●", {
          fontSize: "16px",
          color: "#374151",
          fontFamily: '"Courier New", monospace',
        })
        .setOrigin(0.5)
        .setDepth(63);

      // Stage label
      this.stageTexts[stage.key] = this.add
        .text(stage.x, cy - 4, stage.label, {
          fontSize: "9px",
          color: "#4b5563",
          fontFamily: '"Courier New", monospace',
        })
        .setOrigin(0.5, 0)
        .setDepth(63);
    }
  }

  private buildPathButtons(cx: number, cy: number, panelH: number): void {
    const btnY = cy + panelH / 2 - 54;

    this.pocBtn = this.add
      .text(cx - 120, btnY, "✓  POC Path", {
        fontSize: "13px",
        color: "#10b981",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        backgroundColor: "#064e3b",
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(62)
      .setInteractive({ useHandCursor: true });

    this.pocBtn.on("pointerover", () =>
      this.pocBtn.setStyle({ color: "#6ee7b7" })
    );
    this.pocBtn.on("pointerout", () =>
      this.pocBtn.setStyle({ color: "#10b981" })
    );
    this.pocBtn.on("pointerdown", () => {
      if (this.state !== "briefing") return;
      void this.runValidation("poc");
    });

    this.focBtn = this.add
      .text(cx + 120, btnY, "✗  FOC Path", {
        fontSize: "13px",
        color: "#ef4444",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        backgroundColor: "#450a0a",
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(62)
      .setInteractive({ useHandCursor: true });

    this.focBtn.on("pointerover", () =>
      this.focBtn.setStyle({ color: "#fca5a5" })
    );
    this.focBtn.on("pointerout", () =>
      this.focBtn.setStyle({ color: "#ef4444" })
    );
    this.focBtn.on("pointerdown", () => {
      if (this.state !== "briefing") return;
      void this.runValidation("foc");
    });
  }

  // ─── Validation run ──────────────────────────────────────────────────────

  private async runValidation(path: "poc" | "foc"): Promise<void> {
    this.state = "running";
    this.setButtonsEnabled(false);
    this.statusLabel.setText("Running validation pipeline…");

    const decision =
      path === "poc"
        ? ValidationBridge.buildPocDecision()
        : ValidationBridge.buildFocDecision();

    const context =
      path === "poc"
        ? ValidationBridge.buildPocContext(
            this.registry.get(REGISTRY_KEYS.PERSONA) as string ?? "mentor"
          )
        : ValidationBridge.buildFocContext(
            this.registry.get(REGISTRY_KEYS.PERSONA) as string ?? "mentor"
          );

    // Run the actual ValidationPipeline
    const report = await this.validationBridge.run(decision, context);

    // Animate each stage result
    for (const stage of report.stages) {
      await this.sleep(320);
      this.highlightStage(stage.stage, stage.status);
    }

    // Save to registry and memory bridge
    this.registry.set(
      REGISTRY_KEYS.LAST_VALIDATION_REPORT,
      JSON.stringify(report)
    );

    if (report.status === "PASSED") {
      this.registry.set(REGISTRY_KEYS.MISSION_COMPLETE, true);
      this.memoryBridge.store({
        kind: "episodic",
        subject: "validation.mission",
        content: `Claim validated as POC by ${this.persona}.`,
        tags: ["mission", "poc", "validation"],
        confidence: report.confidenceScore,
        importance: 0.9,
        provenance: { decisionId: report.decisionId },
      });
    }

    await this.sleep(400);
    this.showVerdict(report);
  }

  private highlightStage(
    stage: "policy" | "confidence" | "reality",
    status: "PASSED" | "FAILED" | "DEFERRED"
  ): void {
    const icon = this.stageIcons[stage];
    const label = this.stageTexts[stage];
    if (!icon || !label) return;

    if (status === "PASSED") {
      icon.setStyle({ color: "#10b981" });
      label.setStyle({ color: "#10b981" });
      icon.setText("✓");
    } else if (status === "FAILED") {
      icon.setStyle({ color: "#ef4444" });
      label.setStyle({ color: "#ef4444" });
      icon.setText("✗");
    } else {
      icon.setStyle({ color: "#f59e0b" });
      label.setStyle({ color: "#f59e0b" });
      icon.setText("~");
    }
  }

  private showVerdict(report: ValidationReport): void {
    this.state = "verdict";
    this.statusLabel.setText("");

    const passed = report.status === "PASSED";

    // Verdict text
    this.verdictText.setText(passed ? "◆  POC CONFIRMED" : "✗  FOC DETECTED");
    this.verdictText.setStyle({
      color: passed ? "#10b981" : "#ef4444",
    });
    this.tweens.add({
      targets: this.verdictText,
      alpha: 1,
      duration: 300,
    });

    // Reason summary
    const failStage = report.failed?.stage;
    const reasonText = passed
      ? [
          `Confidence: ${(report.confidenceScore * 100).toFixed(0)}%`,
          "All 3 pipeline stages passed.",
          "Claim is a Proof of Concept (POC).",
        ]
      : [
          `Failed at: ${failStage?.toUpperCase() ?? "UNKNOWN"} stage`,
          ...(report.failed?.reasons?.slice(0, 2) ?? []).map((r: string) =>
            r.length > 56 ? r.slice(0, 53) + "…" : r
          ),
          "Claim is a Failure of Concept (FOC). Rejected.",
        ];

    this.reasonLines.setText(reasonText.join("\n"));
    this.reasonLines.setStyle({
      color: passed ? "#6ee7b7" : "#fca5a5",
    });

    // Show close button
    this.tweens.add({
      targets: this.closeBtn,
      alpha: 1,
      duration: 300,
      delay: 200,
    });
  }

  private setButtonsEnabled(enabled: boolean): void {
    this.pocBtn.setAlpha(enabled ? 1 : 0.35);
    this.focBtn.setAlpha(enabled ? 1 : 0.35);
  }

  // ─── Close mission ───────────────────────────────────────────────────────

  private closeMission(): void {
    const returnScene =
      (this.data.get("returnScene") as string) ?? SCENE_KEYS.MEMORY_DISTRICT;

    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.sceneManager.closeOverlay(returnScene as Parameters<SceneManager["closeOverlay"]>[0]);
    });
  }

  // ─── Helper ─────────────────────────────────────────────────────────────

  private sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.time.delayedCall(ms, resolve);
    });
  }
}
