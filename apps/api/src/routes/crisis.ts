import { Router, type IRouter } from "express";
import { CrisisManager } from "@jennifer/crisis-connect";
import { InMemoryEventBus } from "@jennifer/shared";

const router: IRouter = Router();
const bus = new InMemoryEventBus();
const crisisManager = new CrisisManager(bus);

router.get("/", (_req, res) => {
  res.json({ crises: crisisManager.getActive() });
});

router.get("/dashboard", (_req, res) => {
  res.json(crisisManager.dashboard());
});

router.post("/report", async (req, res) => {
  const body = req.body as Parameters<typeof crisisManager.report>[0];

  if (!body.category || !body.severity || !body.title || !body.affectedRegion) {
    res.status(400).json({ error: "category, severity, title, and affectedRegion are required" });
    return;
  }

  const record = await crisisManager.report(body);
  res.status(201).json({ record });
});

router.post("/:id/resolve", async (req, res) => {
  const record = await crisisManager.resolve(req.params.id ?? "");
  if (!record) {
    res.status(404).json({ error: "Crisis not found" });
    return;
  }
  res.json({ record });
});

export { router as crisisRouter };
