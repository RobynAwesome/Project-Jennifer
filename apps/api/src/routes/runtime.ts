import { Router, type IRouter } from "express";
import {
  CompanionManager,
  DistrictManager,
  ForgeRoleEngine,
  PersonaManager,
} from "@jennifer/runtime";
import {
  FORGE_CLAIM_STAGES,
  isCompanionId,
  type CompanionRelationshipLane,
  type ForgeBootstrapInput,
  type ForgeClaimPromotionInput,
  type PersonaMode,
} from "@jennifer/shared";

const router: IRouter = Router();
const districtManager = new DistrictManager();
const personaManager = new PersonaManager();
const companionManager = new CompanionManager();
const forgeRoleEngine = new ForgeRoleEngine();

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

// ─── Forge mini-GSMB role bootstrap ───────────────────────────────────────────

router.get("/forge-role", (_req, res) => {
  res.json({ contract: forgeRoleEngine.getContract() });
});

router.post("/forge-role/bootstrap", (req, res) => {
  const body = req.body as Partial<ForgeBootstrapInput>;

  if (
    !body.targetRepository?.trim() ||
    !body.currentInstruction?.trim() ||
    typeof body.contextRootLoaded !== "boolean" ||
    typeof body.targetRepositoryInspected !== "boolean"
  ) {
    res.status(400).json({
      error:
        "targetRepository, currentInstruction, contextRootLoaded and targetRepositoryInspected are required",
    });
    return;
  }

  res.json({
    bootstrap: forgeRoleEngine.bootstrap(body as ForgeBootstrapInput),
  });
});

router.post("/forge-role/claims/promote", (req, res) => {
  const body = req.body as Partial<ForgeClaimPromotionInput>;

  if (
    !body.from ||
    !FORGE_CLAIM_STAGES.includes(body.from) ||
    !body.to ||
    !FORGE_CLAIM_STAGES.includes(body.to) ||
    !Array.isArray(body.evidenceSources)
  ) {
    res.status(400).json({
      error:
        "from, to and evidenceSources are required; from/to must be valid Forge claim stages",
    });
    return;
  }

  const result = forgeRoleEngine.evaluateClaimPromotion(
    body as ForgeClaimPromotionInput,
  );
  res.status(result.allowed ? 200 : 422).json({ promotion: result });
});

// Relationship authority intentionally does not live in this legacy router.
// `server.ts` mounts the dependency-injected canonical relationship router at
// `/api/runtime/relationships`, preserving one source-level authority surface.

export { router as runtimeRouter };
