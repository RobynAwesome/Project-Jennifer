import { Router, type IRouter, type Response } from "express";

import {
  RelationshipAuthorityDuplicateError,
  RelationshipEngine,
  RelationshipGovernanceError,
  type RelationshipProjectionRebuildResult,
} from "@jennifer/runtime";
import type {
  ApplyRelationshipQuestDecisionInput,
  CompanionRelationshipLane,
  CreateRelationshipInput,
  DeclareRelationshipBoundaryInput,
} from "@jennifer/shared";

const VALID_COMPANION_LANES: CompanionRelationshipLane[] = [
  "co-builder",
  "mentor",
  "guardian",
  "rival-ally",
  "platonic",
  "romantic",
];

export interface RelationshipAuthorityRouterOptions {
  rebuildProjections?: () => Promise<RelationshipProjectionRebuildResult>;
}

/**
 * Canonical relationship authority routes.
 *
 * Mounted before the legacy runtime router so every relationship mutation and
 * read resolves through the explicitly composed authority engine.
 */
export function createRelationshipAuthorityRouter(
  relationshipEngine: RelationshipEngine,
  options: RelationshipAuthorityRouterOptions = {},
): IRouter {
  const router: IRouter = Router();

  router.post("/projections/rebuild", async (_req, res) => {
    if (!options.rebuildProjections) {
      res.status(409).json({
        error:
          "Relationship projection rebuild requires PostgreSQL authority with MongoDB projection mode.",
      });
      return;
    }

    try {
      const rebuild = await options.rebuildProjections();
      res.json({ rebuild });
    } catch (error) {
      sendRelationshipError(res, error);
    }
  });

  router.post("/projections/flush", async (_req, res) => {
    const projected = await relationshipEngine.flushProjections();
    res.json({ projected });
  });

  router.post("/", async (req, res) => {
    const input = req.body as Partial<CreateRelationshipInput>;
    if (
      !input.relationshipType?.trim() ||
      !input.createdByActorId?.trim() ||
      !input.idempotencyKey?.trim() ||
      !input.lane ||
      !VALID_COMPANION_LANES.includes(input.lane) ||
      !Array.isArray(input.actors)
    ) {
      res.status(400).json({
        error:
          "relationshipType, createdByActorId, idempotencyKey, a valid lane and actors are required",
      });
      return;
    }

    try {
      const result = await executeIdempotent(() =>
        relationshipEngine.createRelationship(input as CreateRelationshipInput),
      );
      res.status(result.duplicate ? 200 : 201).json(result);
    } catch (error) {
      sendRelationshipError(res, error);
    }
  });

  router.get("/:relationshipId/receipts", async (req, res) => {
    try {
      const receipts = await relationshipEngine.getReceipts(
        req.params.relationshipId,
      );
      res.json({ receipts });
    } catch (error) {
      sendRelationshipError(res, error);
    }
  });

  router.post("/:relationshipId/boundaries", async (req, res) => {
    const body = req.body as Partial<DeclareRelationshipBoundaryInput>;
    if (
      !body.declaredByActorId?.trim() ||
      !body.boundaryType?.trim() ||
      !body.boundaryValue?.trim() ||
      !body.idempotencyKey?.trim()
    ) {
      res.status(400).json({
        error:
          "declaredByActorId, boundaryType, boundaryValue and idempotencyKey are required",
      });
      return;
    }

    const input = {
      ...body,
      relationshipId: req.params.relationshipId,
    } as DeclareRelationshipBoundaryInput;

    try {
      const result = await executeIdempotent(() =>
        relationshipEngine.declareBoundary(input),
      );
      res.status(result.duplicate ? 200 : 201).json(result);
    } catch (error) {
      sendRelationshipError(res, error);
    }
  });

  router.post("/:relationshipId/decisions", async (req, res) => {
    const body = req.body as Partial<ApplyRelationshipQuestDecisionInput>;
    if (
      !body.questInstanceId?.trim() ||
      !body.sourceActorId?.trim() ||
      !body.decisionType?.trim() ||
      !body.selectedOption?.trim() ||
      !body.idempotencyKey?.trim()
    ) {
      res.status(400).json({
        error:
          "questInstanceId, sourceActorId, decisionType, selectedOption and idempotencyKey are required",
      });
      return;
    }

    const input = {
      ...body,
      relationshipId: req.params.relationshipId,
    } as ApplyRelationshipQuestDecisionInput;

    try {
      const result = await executeIdempotent(() =>
        relationshipEngine.applyQuestDecision(input),
      );
      res.status(result.duplicate ? 200 : 201).json(result);
    } catch (error) {
      sendRelationshipError(res, error);
    }
  });

  router.get("/:relationshipId", async (req, res) => {
    try {
      const snapshot = await relationshipEngine.getSnapshot(
        req.params.relationshipId,
      );
      if (!snapshot) {
        res.status(404).json({ error: "Relationship not found" });
        return;
      }
      res.json({ snapshot });
    } catch (error) {
      sendRelationshipError(res, error);
    }
  });

  return router;
}

async function executeIdempotent<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof RelationshipAuthorityDuplicateError) {
      // The competing commit already won. Re-enter once so the engine resolves
      // the persisted event + receipt through its normal duplicate path.
      return operation();
    }
    throw error;
  }
}

function sendRelationshipError(res: Response, error: unknown): void {
  if (error instanceof RelationshipGovernanceError) {
    const status = error.code === "RIVM-NOT-FOUND" ? 404 : 422;
    res.status(status).json({ error: error.message, code: error.code });
    return;
  }

  res.status(500).json({
    error:
      error instanceof Error ? error.message : "Relationship command failed",
  });
}
