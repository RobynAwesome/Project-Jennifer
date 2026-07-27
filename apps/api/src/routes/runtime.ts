import { Router, type IRouter } from "express";
import { DistrictManager, PersonaManager } from "@jennifer/runtime";
import type { PersonaMode } from "@jennifer/shared";

const router: IRouter = Router();
const districtManager = new DistrictManager();
const personaManager = new PersonaManager();

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

  const valid: PersonaMode[] = [
    "best-friend",
    "mentor",
    "governance-operator",
    "research-assistant",
  ];

  if (!persona || !valid.includes(persona)) {
    res.status(400).json({ error: `persona must be one of: ${valid.join(", ")}` });
    return;
  }

  personaManager.setPersona(persona);
  res.json({ persona, definition: personaManager.getDefinition(persona) });
});

export { router as runtimeRouter };
