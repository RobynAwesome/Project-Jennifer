import { Router, type IRouter } from "express";
import { PolicyEngine, PermissionManager } from "@jennifer/governance";
import { generateId } from "@jennifer/shared";

const router: IRouter = Router();
const policyEngine = new PolicyEngine(true);
const permissionManager = new PermissionManager();

router.get("/policies", (_req, res) => {
  res.json({ policies: policyEngine.getPolicies() });
});

router.post("/evaluate", (req, res) => {
  const { context } = req.body as { context?: Record<string, unknown> };
  if (!context) {
    res.status(400).json({ error: "context is required" });
    return;
  }

  const decision = policyEngine.evaluate(
    {
      id: generateId(),
      action: String(context.action ?? "unspecified"),
      resource: typeof context.resource === "string" ? context.resource : undefined,
      payload: context,
    },
    context
  );
  res.json({ decision });
});

router.get("/permissions/:subject", (req, res) => {
  const permissions = permissionManager.listPermissions(req.params.subject ?? "");
  res.json({ permissions });
});

export { router as governanceRouter };
