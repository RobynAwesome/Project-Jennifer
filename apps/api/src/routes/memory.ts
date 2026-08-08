import { Router, type IRouter } from "express";
import {
  ARPM_RESEARCH_PROFILE,
  InMemoryGSMB,
  MEMORY_RECEIPT_INVARIANTS,
  MemoryReceiptEngine,
  RELATIONAL_FAILURE_VECTORS,
  type MemoryReceiptInput,
} from "@jennifer/memory";
import { FOC_CATEGORIES, type MemoryQuery } from "@jennifer/shared";

const router: IRouter = Router();
const gsmb = new InMemoryGSMB();
const memoryReceiptEngine = new MemoryReceiptEngine();

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

router.post("/query", async (req, res) => {
  const query = req.body as MemoryQuery;
  const entries = await gsmb.query(query);
  res.json({ entries, count: entries.length });
});

// ─── Memory Receipt Engine ───────────────────────────────────────────────────

router.get("/receipts/schema", (_req, res) => {
  res.json({
    vectors: RELATIONAL_FAILURE_VECTORS,
    invariants: MEMORY_RECEIPT_INVARIANTS,
    research: ARPM_RESEARCH_PROFILE,
    matrixSemantics:
      "Diagonal cells are observed vector strength; off-diagonal cells preserve co-presence using min(a,b) without asserting causality.",
  });
});

router.get("/receipts", (_req, res) => {
  const receipts = memoryReceiptEngine.list();
  res.json({ receipts, count: receipts.length });
});

router.get("/receipts/:id", (req, res) => {
  const receipt = memoryReceiptEngine.get(req.params.id ?? "");
  if (!receipt) {
    res.status(404).json({ error: "Memory receipt not found" });
    return;
  }
  res.json({ receipt });
});

router.post("/receipts/evaluate", (req, res) => {
  const body = req.body as Partial<MemoryReceiptInput>;

  if (
    !body.subject?.trim() ||
    !body.claim?.trim() ||
    !Array.isArray(body.evidenceRefs) ||
    !body.provenance ||
    !body.temporal ||
    !body.retrieval ||
    typeof body.confidence !== "number" ||
    !body.conceptState
  ) {
    res.status(400).json({
      error:
        "subject, claim, evidenceRefs, conceptState, confidence, provenance, temporal and retrieval are required",
    });
    return;
  }

  const validConceptState =
    body.conceptState === "proof-of-concept" ||
    body.conceptState === "maybe" ||
    FOC_CATEGORIES.includes(body.conceptState as (typeof FOC_CATEGORIES)[number]);

  if (!validConceptState) {
    res.status(400).json({ error: "conceptState is not a recognized POC/FOC/MAYBE state" });
    return;
  }

  const receipt = memoryReceiptEngine.issue(body as MemoryReceiptInput);
  res.status(receipt.admission === "quarantined" ? 422 : 201).json({ receipt });
});

router.get("/:id", async (req, res) => {
  const entry = await gsmb.retrieve(req.params.id ?? "");
  if (!entry) {
    res.status(404).json({ error: "Memory entry not found" });
    return;
  }
  res.json({ entry });
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
