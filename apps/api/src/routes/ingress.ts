import { Router, type IRouter } from "express";
import { IngressMonitor } from "@jennifer/collective-ingress";
import { InMemoryEventBus } from "@jennifer/shared";

const router: IRouter = Router();
const monitor = new IngressMonitor(new InMemoryEventBus());

router.get("/", (_req, res) => {
  const events = monitor.getActive();
  res.json({
    sourceMode: "in-memory",
    events,
    count: events.length,
    aggregateSentiment: monitor.aggregateSentiment(),
    behaviourModifier: monitor.getBehaviourModifier(),
    note: "Empty until an ingress event is ingested. No invented weather or markets.",
  });
});

export { router as ingressRouter };
