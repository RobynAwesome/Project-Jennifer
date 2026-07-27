import { Router, type IRouter } from "express";
import { InMemoryGSMB } from "@jennifer/memory";
import type { MemoryQuery } from "@jennifer/shared";

const router: IRouter = Router();
const gsmb = new InMemoryGSMB();

router.post("/store", async (req, res) => {
  const body = req.body as Partial<Parameters<typeof gsmb.store>[0]>;

  if (!body.kind || !body.subject || !body.content) {
    res.status(400).json({ error: "kind, subject, and content are required" });
    return;
  }

  const entry = await gsmb.store({
    kind: body.kind,
    subject: body.subject,
    content: body.content,
    tags: body.tags ?? [],
    confidence: body.confidence ?? 1.0,
    importance: body.importance ?? 0.5,
    expiresAt: body.expiresAt,
  });

  res.status(201).json({ entry });
});

router.get("/:id", async (req, res) => {
  const entry = await gsmb.retrieve(req.params.id ?? "");
  if (!entry) {
    res.status(404).json({ error: "Memory entry not found" });
    return;
  }
  res.json({ entry });
});

router.post("/query", async (req, res) => {
  const query = req.body as MemoryQuery;
  const entries = await gsmb.query(query);
  res.json({ entries, count: entries.length });
});

router.delete("/:id", async (req, res) => {
  const removed = await gsmb.forget(req.params.id ?? "");
  if (!removed) {
    res.status(404).json({ error: "Memory entry not found" });
    return;
  }
  res.json({ success: true });
});

export { router as memoryRouter };
