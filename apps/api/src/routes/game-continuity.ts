import { Router, type IRouter } from "express";
import type { ConsequenceRevealReceipt } from "@jennifer/shared";

import { parseTrustedActorId, VisitRateGate } from "../zero-trust.js";

export interface GameContinuitySnapshot {
  schemaVersion: 1;
  sessionId: string;
  persona?: string;
  playerName?: string;
  companionId?: string;
  companionName?: string;
  companionLogic?: string;
  companionLane?: string;
  companionRenderMode?: string;
  companionReceipt?: unknown;
  relationshipId?: string;
  questInstanceId?: string;
  questComplete?: boolean;
  questChoice?: string;
  episodeRevealId?: string;
  updatedAt: number;
}

interface ContinuityRecord {
  snapshot: GameContinuitySnapshot;
  reveals: ConsequenceRevealReceipt[];
}

const MAX_REVEALS_PER_SESSION = 32;
const MAX_STRING = 256;

/**
 * In-process continuity store for Jennifer City love loop.
 *
 * Zero-trust law (RTC / KPGS bowl):
 * - UNTRUSTED INPUT → parse sessionId → rate limit → admit to in-memory store
 * - In-memory store is NOT hosted production authority
 * - Never label responses as "authoritative" (loved ≠ proven; SUBMITTED ≠ ADMITTED)
 */
export function createGameContinuityRouter(): IRouter {
  const router: IRouter = Router();
  const store = new Map<string, ContinuityRecord>();
  const writeGate = new VisitRateGate(60_000, 40);
  const readGate = new VisitRateGate(60_000, 120);

  router.post("/", (req, res) => {
    const body = req.body as Partial<GameContinuitySnapshot>;
    if (body.schemaVersion !== 1) {
      res.status(400).json({
        error: "schemaVersion 1 is required",
        proofState: "game-continuity-in-memory",
      });
      return;
    }

    const sessionId = parseTrustedActorId(body.sessionId);
    if (!sessionId) {
      res.status(400).json({
        error: "sessionId must match trusted actor id pattern",
        proofState: "game-continuity-in-memory",
      });
      return;
    }

    if (!writeGate.allow(`continuity-write:${sessionId}`)) {
      res.status(429).json({
        error: "continuity write rate limited",
        proofState: "game-continuity-in-memory",
      });
      return;
    }

    const existing = store.get(sessionId);
    const relationshipId = clipOptional(body.relationshipId);
    const snapshot: GameContinuitySnapshot = {
      schemaVersion: 1,
      sessionId,
      persona: clipOptional(body.persona),
      playerName: clipOptional(body.playerName),
      companionId: clipOptional(body.companionId),
      companionName: clipOptional(body.companionName),
      companionLogic: clipOptional(body.companionLogic),
      companionLane: clipOptional(body.companionLane),
      companionRenderMode: clipOptional(body.companionRenderMode),
      companionReceipt: clipCompanionReceipt(body.companionReceipt),
      // PERN HOLD: never collapse relationship namespace into sessionId
      relationshipId:
        relationshipId && relationshipId !== sessionId
          ? relationshipId
          : undefined,
      questInstanceId: clipOptional(body.questInstanceId),
      questComplete: Boolean(body.questComplete),
      questChoice: clipOptional(body.questChoice),
      episodeRevealId: clipOptional(body.episodeRevealId),
      updatedAt: Date.now(),
    };

    store.set(sessionId, {
      snapshot,
      reveals: existing?.reveals ?? [],
    });

    res.status(201).json({
      snapshot,
      sourceMode: "continuity-store",
      proofState: "game-continuity-in-memory",
      trustBoundary:
        "In-memory POC continuity. Not relationship authority. Not Memory Receipt admission.",
    });
  });

  router.get("/:sessionId", (req, res) => {
    const sessionId = parseTrustedActorId(req.params.sessionId);
    if (!sessionId) {
      res.status(400).json({ error: "sessionId invalid" });
      return;
    }
    if (!readGate.allow(`continuity-read:${sessionId}`)) {
      res.status(429).json({ error: "continuity read rate limited" });
      return;
    }

    const record = store.get(sessionId);
    if (!record) {
      res.status(404).json({ error: "No continuity for session" });
      return;
    }
    res.json({
      snapshot: record.snapshot,
      sourceMode: "continuity-store",
      proofState: "game-continuity-in-memory",
      trustBoundary:
        "In-memory POC continuity. Not hosted production authority.",
    });
  });

  router.post("/:sessionId/reveals", (req, res) => {
    const sessionId = parseTrustedActorId(req.params.sessionId);
    if (!sessionId) {
      res.status(400).json({ error: "sessionId invalid" });
      return;
    }
    if (!writeGate.allow(`continuity-reveal:${sessionId}`)) {
      res.status(429).json({ error: "continuity reveal rate limited" });
      return;
    }

    const existing = store.get(sessionId);
    if (!existing) {
      res.status(404).json({
        error: "Create continuity snapshot before posting reveals",
        proofState: "game-continuity-in-memory",
      });
      return;
    }

    const receipt = (req.body as { receipt?: ConsequenceRevealReceipt }).receipt;
    if (!receipt?.revealId || receipt.schemaVersion !== 1) {
      res.status(400).json({
        error: "A schemaVersion 1 ConsequenceRevealReceipt is required",
      });
      return;
    }
    if (typeof receipt.revealId !== "string" || receipt.revealId.length > MAX_STRING) {
      res.status(400).json({ error: "revealId invalid" });
      return;
    }

    const without = existing.reveals.filter(
      (entry) => entry.revealId !== receipt.revealId,
    );
    without.push(receipt);
    existing.reveals = without.slice(-MAX_REVEALS_PER_SESSION);
    existing.snapshot.episodeRevealId = receipt.revealId.slice(0, MAX_STRING);
    existing.snapshot.updatedAt = Date.now();
    store.set(sessionId, existing);

    res.status(201).json({
      receipt,
      sourceMode: "continuity-store",
      proofState: "game-continuity-in-memory",
      trustBoundary:
        "Player-safe reveal mirrored in continuity store. Journal must still label local vs admitted.",
    });
  });

  router.get("/:sessionId/reveals", (req, res) => {
    const sessionId = parseTrustedActorId(req.params.sessionId);
    if (!sessionId) {
      res.status(400).json({ error: "sessionId invalid" });
      return;
    }
    if (!readGate.allow(`continuity-reveals:${sessionId}`)) {
      res.status(429).json({ error: "continuity read rate limited" });
      return;
    }

    const record = store.get(sessionId);
    res.json({
      receipts: record?.reveals ?? [],
      sourceMode: record ? "continuity-store" : "empty",
      proofState: "game-continuity-in-memory",
    });
  });

  return router;
}

function clipOptional(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_STRING);
}

/** Bound untrusted companion receipt blobs (DoS / memory FOC). */
function clipCompanionReceipt(value: unknown): unknown | undefined {
  if (value == null) return undefined;
  try {
    const encoded = JSON.stringify(value);
    if (!encoded || encoded.length > 4_096) return undefined;
    return JSON.parse(encoded) as unknown;
  } catch {
    return undefined;
  }
}
