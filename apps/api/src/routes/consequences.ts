import { Router } from "express";

import type { IConsequenceRevealJournal } from "@jennifer/runtime";
import type { TelemetryCollector } from "@jennifer/telemetry";

const REVEAL_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/;

/**
 * Player-safe consequence read bridge.
 *
 * This route never reads internal epistemic/runtime payloads directly. It only
 * exposes the redacted append-only ConsequenceRevealReceipt projection after a
 * governed runtime has made the reveal player-visible.
 */
export function createConsequenceRevealRouter(
  journal: IConsequenceRevealJournal,
  telemetry: TelemetryCollector,
): Router {
  const router = Router();

  router.get("/:revealId", async (req, res, next) => {
    try {
      const revealId = req.params.revealId?.trim() ?? "";
      if (!REVEAL_ID.test(revealId)) {
        return res.status(400).json({ error: "Invalid consequence reveal id." });
      }

      const version = await journal.getLatest(revealId);
      if (!version || version.receipt.state === "LATENT") {
        // A latent reveal is intentionally indistinguishable from an unknown id
        // at the player boundary so hidden causality does not become metadata.
        return res.status(404).json({ error: "Consequence reveal not found." });
      }

      const receipt = version.receipt;
      if (!receipt.runtimeAdmission) {
        return res.status(409).json({
          error: "Consequence reveal is not backed by runtime admission evidence.",
        });
      }

      await telemetry.emit(
        "consequence.reveal.inspected",
        `consequence-reveal:${receipt.revealId}`,
        {
          revealId: receipt.revealId,
          state: receipt.state,
          eventId: receipt.origin.eventId,
          actorId: receipt.origin.actorId,
          source: "authoritative-read-through",
          journalVersion: version.version,
        },
      );

      return res.json({
        source: "authoritative",
        journalVersion: version.version,
        persistedAt: version.persistedAt,
        receipt,
      });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
