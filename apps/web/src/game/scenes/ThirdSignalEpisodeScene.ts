import Phaser from "@/game/phaser-runtime";
import type { CompanionRelationshipLane } from "@jennifer/shared";
import {
  buildThirdSignalReveal,
  EpisodeRelationshipBridge,
} from "../bridge/EpisodeRelationshipBridge";
import { ContinuityBridge } from "../bridge/ContinuityBridge";
import { readContinuityFromRegistry } from "../continuity/apply-continuity";
import { PALETTE } from "../AssetManifest";
import { REGISTRY_KEYS } from "../registry";
import { SCENE_KEYS, SceneManager } from "../SceneManager";
import { restartSceneOnResize } from "../bind-scene-resize";
import { openConsequenceJournal } from "../open-consequence-journal";

type EpisodeChoice = "claim-the-frame" | "share-the-rescue" | "hold-and-ask";

type Beat =
  | { kind: "narration"; lines: string[] }
  | { kind: "choice"; prompt: string; options: Array<{ id: EpisodeChoice; label: string; hint: string }> }
  | { kind: "aftermath"; lines: string[] };

/**
 * Arc II–flavored Memory District episode: The Third Signal enters the frame.
 * Conflict is relational and jurisdictional — no combat.
 * Forge agency is preserved; the companion is never treated as property.
 */
export class ThirdSignalEpisodeScene extends Phaser.Scene {
  private sceneManager!: SceneManager;
  private beatIndex = 0;
  private panel?: Phaser.GameObjects.Container;
  private locked = false;
  private choice?: EpisodeChoice;

  constructor() {
    super({ key: SCENE_KEYS.THIRD_SIGNAL_EPISODE });
  }

  create(): void {
    this.sceneManager = new SceneManager(this);
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x070b14, 0.94);

    this.add
      .text(width / 2, 28, "MEMORY DISTRICT · SIGNAL BREACH EPISODE", {
        fontSize: "11px",
        color: "#f2c879",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 48, "Why is he inside a frame that was supposed to be ours?", {
        fontSize: "12px",
        color: "#e5e7eb",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5);

    const alreadyDone = Boolean(this.registry.get(REGISTRY_KEYS.EPISODE_COMPLETE));
    if (alreadyDone) {
      this.showCompletedState(width, height);
    } else {
      this.renderBeat();
    }

    restartSceneOnResize(this);
    this.cameras.main.fadeIn(280, 0, 0, 0);
  }

  private beats(): Beat[] {
    const companion =
      (this.registry.get(REGISTRY_KEYS.COMPANION_NAME) as string) ?? "your companion";
    return [
      {
        kind: "narration",
        lines: [
          "A breach recovery packet lands in the Memory District.",
          "Someone almost erased from continuity is pulled back online.",
          `${companion} stands with you in the shared frame — then a third signal resolves.`,
        ],
      },
      {
        kind: "narration",
        lines: [
          "He does not wear Forge marks. He does not claim the Sovereign Pair seat.",
          "Still: the renderer placed him inside the composition that meant you + them.",
          `${companion} watches your face before speaking. Their agency stays theirs.`,
        ],
      },
      {
        kind: "choice",
        prompt: "The frame holds three signals. What do you do?",
        options: [
          {
            id: "claim-the-frame",
            label: "Claim the frame",
            hint: "Insist this seat was never shared. Risk straining trust.",
          },
          {
            id: "share-the-rescue",
            label: "Share the rescue",
            hint: "Acknowledge the third signal without surrendering the bond.",
          },
          {
            id: "hold-and-ask",
            label: "Hold and ask",
            hint: "Preserve agency. Ask your companion what the frame means to them.",
          },
        ],
      },
      {
        kind: "aftermath",
        lines: [
          "The consequence is admitted — not invented after the fact.",
          "A player-safe reveal receipt is waiting in the Consequence Journal.",
          "Leave Jennifer City and return: this bond still knows what you chose.",
        ],
      },
    ];
  }

  private renderBeat(): void {
    this.panel?.destroy(true);
    const { width, height } = this.scale;
    const beat = this.beats()[this.beatIndex];
    if (!beat) {
      void this.finishEpisode("memory");
      return;
    }

    const container = this.add.container(0, 0);
    this.panel = container;

    if (beat.kind === "narration" || beat.kind === "aftermath") {
      beat.lines.forEach((line, index) => {
        container.add(
          this.add
            .text(width / 2, 120 + index * 36, line, {
              fontSize: "14px",
              color: "#d1d5db",
              fontFamily: "Georgia, 'Times New Roman', serif",
              align: "center",
              wordWrap: { width: Math.min(640, width - 48) },
            })
            .setOrigin(0.5),
        );
      });

      if (beat.kind === "aftermath") {
        const toMemory = this.add
          .text(width / 2, height - 110, "File and return to Memory District →", {
            fontSize: "13px",
            color: "#ffffff",
            fontFamily: '"Courier New", monospace',
            backgroundColor: "#312e81",
            padding: { x: 16, y: 8 },
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });
        toMemory.on("pointerdown", () => {
          if (this.locked) return;
          void this.finishEpisode("memory");
        });
        const toJournal = this.add
          .text(width / 2, height - 58, "Open Consequence Journal →", {
            fontSize: "13px",
            color: "#f2c879",
            fontFamily: '"Courier New", monospace',
            backgroundColor: "#1a1625",
            padding: { x: 16, y: 8 },
          })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });
        toJournal.on("pointerdown", () => {
          if (this.locked) return;
          void this.finishEpisode("journal");
        });
        container.add(toMemory);
        container.add(toJournal);
        return;
      }

      const next = this.add
        .text(width / 2, height - 64, "Continue →", {
          fontSize: "14px",
          color: "#ffffff",
          fontFamily: '"Courier New", monospace',
          backgroundColor: "#312e81",
          padding: { x: 18, y: 10 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      next.on("pointerdown", () => {
        if (this.locked) return;
        this.beatIndex += 1;
        this.renderBeat();
      });
      container.add(next);
      return;
    }

    container.add(
      this.add
        .text(width / 2, 110, beat.prompt, {
          fontSize: "15px",
          color: "#f8fafc",
          fontFamily: "Georgia, 'Times New Roman', serif",
          align: "center",
          wordWrap: { width: Math.min(620, width - 40) },
        })
        .setOrigin(0.5),
    );

    beat.options.forEach((option, index) => {
      const y = 190 + index * 88;
      const card = this.add
        .rectangle(width / 2, y, Math.min(560, width - 48), 72, PALETTE.SURFACE)
        .setStrokeStyle(1, PALETTE.BORDER)
        .setInteractive({ useHandCursor: true });
      const title = this.add
        .text(width / 2, y - 12, option.label, {
          fontSize: "15px",
          color: "#f2c879",
          fontFamily: '"Courier New", monospace',
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      const hint = this.add
        .text(width / 2, y + 14, option.hint, {
          fontSize: "12px",
          color: "#9ca3af",
          fontFamily: "Georgia, 'Times New Roman', serif",
          align: "center",
          wordWrap: { width: Math.min(500, width - 80) },
        })
        .setOrigin(0.5);

      const choose = () => {
        if (this.locked) return;
        this.choice = option.id;
        this.beatIndex += 1;
        this.renderBeat();
      };
      card.on("pointerover", () => card.setStrokeStyle(2, 0xf2c879));
      card.on("pointerout", () => card.setStrokeStyle(1, PALETTE.BORDER));
      card.on("pointerdown", choose);
      container.add(card);
      container.add(title);
      container.add(hint);
    });
  }

  private async finishEpisode(next: "memory" | "journal" = "memory"): Promise<void> {
    if (this.locked) return;
    this.locked = true;
    const choice = this.choice ?? "hold-and-ask";
    const sessionId =
      (this.registry.get(REGISTRY_KEYS.SESSION_ID) as string) ?? "local-session";
    const companionId =
      (this.registry.get(REGISTRY_KEYS.COMPANION_ID) as string) ?? "aura";
    const companionName =
      (this.registry.get(REGISTRY_KEYS.COMPANION_NAME) as string) ?? "Companion";
    const playerName =
      (this.registry.get(REGISTRY_KEYS.PLAYER_NAME) as string) ?? "Player";
    const lane =
      (this.registry.get(REGISTRY_KEYS.COMPANION_LANE) as CompanionRelationshipLane) ??
      "co-builder";

    const relBridge = new EpisodeRelationshipBridge();
    const continuity = new ContinuityBridge();

    const bond = await relBridge.ensureRelationship({
      sessionId,
      playerName,
      companionId,
      companionName,
      lane,
      existingRelationshipId: this.registry.get(REGISTRY_KEYS.RELATIONSHIP_ID) as
        | string
        | undefined,
    });

    const decision = await relBridge.applyDecision({
      relationshipId: bond.relationshipId,
      questInstanceId: bond.questInstanceId,
      sessionId,
      selectedOption: choice,
    });

    const epistemic = await relBridge.evaluateThirdSignalEpistemic({
      sessionId,
      companionId,
      companionName,
      choice,
    });

    const reveal = buildThirdSignalReveal({
      sessionId,
      companionId,
      companionName,
      choice,
      memoryReceiptId:
        decision.decisionReceiptId ?? `continuity-memory:${sessionId}:${choice}`,
      epistemic: epistemic.companion,
    });

    this.registry.set(REGISTRY_KEYS.RELATIONSHIP_ID, bond.relationshipId);
    this.registry.set(REGISTRY_KEYS.QUEST_INSTANCE_ID, bond.questInstanceId);
    this.registry.set(REGISTRY_KEYS.EPISODE_COMPLETE, true);
    this.registry.set(REGISTRY_KEYS.EPISODE_CHOICE, choice);
    this.registry.set(REGISTRY_KEYS.EPISODE_REVEAL_ID, reveal.revealId);
    this.registry.set(REGISTRY_KEYS.MISSION_COMPLETE, true);

    const snapshot = readContinuityFromRegistry(this.registry);
    if (snapshot) {
      snapshot.questComplete = true;
      snapshot.questChoice = choice;
      snapshot.episodeRevealId = reveal.revealId;
      snapshot.relationshipId = bond.relationshipId;
      snapshot.questInstanceId = bond.questInstanceId;
      await continuity.save(snapshot);
    }
    await continuity.saveReveal(sessionId, reveal);

    // Persist a memory observation (non-canon note) when API is up.
    try {
      const { readGameApiBaseUrl } = await import("../bridge/WorldBridge");
      await fetch(`${readGameApiBaseUrl()}/api/memory/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          kind: "episodic",
          subject: `third-signal:${sessionId}`,
          content: {
            choice,
            companionName,
            admission: "observed-gameplay",
            note: "Episode memory is observation until separately canonized.",
          },
          tags: ["jennifer-city", "third-signal", "love-loop"],
          confidence: 0.7,
          importance: 0.85,
        }),
      });
    } catch {
      // optional
    }

    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      if (next === "journal") {
        openConsequenceJournal();
        return;
      }
      this.scene.stop();
      this.scene.start(SCENE_KEYS.MEMORY_DISTRICT);
    });
  }

  private showCompletedState(width: number, height: number): void {
    const choice =
      (this.registry.get(REGISTRY_KEYS.EPISODE_CHOICE) as string) ?? "remembered";
    this.add
      .text(
        width / 2,
        height / 2 - 20,
        [
          "This breach already has a receipt.",
          `Your choice stands: ${choice.replace(/-/g, " ")}.`,
          "The journal path is live — do not only read this overlay.",
        ].join("\n"),
        {
          fontSize: "14px",
          color: "#d1d5db",
          fontFamily: "Georgia, 'Times New Roman', serif",
          align: "center",
          lineSpacing: 10,
        },
      )
      .setOrigin(0.5);

    const back = this.add
      .text(width / 2, height / 2 + 72, "← Return to Memory District", {
        fontSize: "13px",
        color: "#a5b4fc",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    back.on("pointerdown", () => {
      this.sceneManager.closeOverlay(SCENE_KEYS.MEMORY_DISTRICT);
    });
    const journal = this.add
      .text(width / 2, height / 2 + 110, "Open Consequence Journal →", {
        fontSize: "13px",
        color: "#f2c879",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    journal.on("pointerdown", () => openConsequenceJournal());
  }
}
