import { Router, type IRouter, type Response } from "express";
import {
  CompanionManager,
  DistrictManager,
  PersonaManager,
  RelationshipEngine,
  RelationshipGovernanceError,
} from "@jennifer/runtime";
import {
  isCompanionId,
  type ApplyRelationshipQuestDecisionInput,
  type CompanionRelationshipLane,
  type CreateRelationshipInput,
  type DeclareRelationshipBoundaryInput,
  type PersonaMode,
} from "@jennifer/shared";

const router: IRouter = Router();
const districtManager = new DistrictManager();
const personaManager = new PersonaManager();
const companionManager = new CompanionManager();
const relationshipEngine = new RelationshipEngine();

const VALID_PERSONAS: PersonaMode[] = [
  "best-friend",
  "mentor",
  "governance-operator",
  "research-assistant",
];

const VALID_COMPANION_LANES: CompanionRelationshipLane[] = [
  "co-builder",
  "mentor",
  "guardian",
  "rival-ally",
  "platonic",
  "romantic",
];

router.get("/districts", (_req, res) => {
  res.json({ districts: districtManager.getAllDistricts() });
});

router.get("/districts/:name", (req, res) => {
  const district = districtManager.getDistrict(req.params.name as never);
  if (!district) {
    res.status(404).json({ error: "District not found" });
    return;
  }
  res.json({ district });
});

router.get("/personas", (_req, res) => {
  res.json({ personas: personaManager.getAllDefinitions() });
});

router.get("/personas/active", (_req, res) => {
  res.json({
    persona: personaManager.getPersona(),
    definition: personaManager.getDefinition(),
  });
});

router.post("/personas/active", (req, res) => {
  const { persona } = req.body as { persona?: PersonaMode };

  if (!persona || !VALID_PERSONAS.includes(persona)) {
    res.status(400).json({
      error: `persona must be one of: ${VALID_PERSONAS.join(", ")}`,
    });
    return;
  }

  personaManager.setPersona(persona);
  res.json({ persona, definition: personaManager.getDefinition(persona) });
});

// ─── Governed companion architecture ─────────────────────────────────────────

router.get("/companions", (_req, res) => {
  res.json({
    companions: companionManager.getCatalog(),
    invariant:
      "A companion is an embodied expression of a governed core logic.",
  });
});

router.get("/companions/active/:userId", (req, res) => {
  const selection = companionManager.getActiveSelection(req.params.userId);
  if (!selection) {
    res.status(404).json({ error: "No active companion for this user" });
    return;
  }

  res.json({
    selection,
    companion: companionManager.getActiveCompanion(req.params.userId),
  });
});

router.get("/companions/receipts/:userId", (req, res) => {
  res.json({ receipts: companionManager.getReceiptsForUser(req.params.userId) });
});

router.get("/companions/:id", (req, res) => {
  const id = req.params.id;
  if (!isCompanionId(id)) {
    res.status(404).json({ error: "Companion not found" });
    return;
  }

  res.json({ companion: companionManager.getDefinition(id) });
});

router.post("/companions/select", (req, res) => {
  const { userId, companionId, relationshipLane, renderMode } = req.body as {
    userId?: string;
    companionId?: string;
    relationshipLane?: CompanionRelationshipLane;
    renderMode?: "core-logic" | "embodied";
  };

  if (!userId?.trim()) {
    res.status(400).json({ error: "userId is required" });
    return;
  }
  if (!companionId || !isCompanionId(companionId)) {
    res.status(400).json({ error: "companionId is invalid" });
    return;
  }
  if (
    !relationshipLane ||
    !VALID_COMPANION_LANES.includes(relationshipLane)
  ) {
    res.status(400).json({
      error: `relationshipLane must be one of: ${VALID_COMPANION_LANES.join(", ")}`,
    });
    return;
  }
  if (renderMode && !["core-logic", "embodied"].includes(renderMode)) {
    res.status(400).json({
      error: "renderMode must be core-logic or embodied",
    });
    return;
  }

  const result = companionManager.select({
    userId: userId.trim(),
    companionId,
    relationshipLane,
    renderMode,
  });

  res.status(result.receipt.result === "PASSED" ? 201 : 422).json(result);
});

// ─── MERN adaptive core + PERN relationship validation spine ─────────────────

router.post("/relationships", async (req, res) => {
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
    const result = await relationshipEngine.createRelationship(
      input as CreateRelationshipInput
    );
    res.status(result.duplicate ? 200 : 201).json(result);
  } catch (error) {
    sendRelationshipError(res, error);
  }
});

router.get("/relationships/:relationshipId", async (req, res) => {
  const snapshot = await relationshipEngine.getSnapshot(
    req.params.relationshipId
  );
  if (!snapshot) {
    res.status(404).json({ error: "Relationship not found" });
    return;
  }
  res.json({ snapshot });
});

router.get("/relationships/:relationshipId/receipts", async (req, res) => {
  try {
    const receipts = await relationshipEngine.getReceipts(
      req.params.relationshipId
    );
    res.json({ receipts });
  } catch (error) {
    sendRelationshipError(res, error);
  }
});

router.post("/relationships/:relationshipId/boundaries", async (req, res) => {
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

  try {
    const result = await relationshipEngine.declareBoundary({
      ...body,
      relationshipId: req.params.relationshipId,
    } as DeclareRelationshipBoundaryInput);
    res.status(result.duplicate ? 200 : 201).json(result);
  } catch (error) {
    sendRelationshipError(res, error);
  }
});

router.post("/relationships/:relationshipId/decisions", async (req, res) => {
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

  try {
    const result = await relationshipEngine.applyQuestDecision({
      ...body,
      relationshipId: req.params.relationshipId,
    } as ApplyRelationshipQuestDecisionInput);
    res.status(result.duplicate ? 200 : 201).json(result);
  } catch (error) {
    sendRelationshipError(res, error);
  }
});

router.post("/relationships/projections/flush", async (_req, res) => {
  const projected = await relationshipEngine.flushProjections();
  res.json({ projected });
});

function sendRelationshipError(res: Response, error: unknown): void {
  if (error instanceof RelationshipGovernanceError) {
    const status = error.code === "RIVM-NOT-FOUND" ? 404 : 422;
    res.status(status).json({ error: error.message, code: error.code });
    return;
  }

  res.status(500).json({
    error: error instanceof Error ? error.message : "Relationship command failed",
  });
}

export { router as runtimeRouter };
