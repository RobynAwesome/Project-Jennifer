import { Router, type IRouter } from "express";
import { HumanStateAbstractor } from "@jennifer/hue";

const router: IRouter = Router();
const abstractor = new HumanStateAbstractor();

router.get("/", (req, res) => {
  const userId =
    typeof req.query.userId === "string" && req.query.userId.trim()
      ? req.query.userId.trim()
      : "observer";

  res.json({
    sourceMode: "in-memory",
    userId,
    state: abstractor.getState(userId),
    note: "Default observer state until a human state is written. Not a profile claim.",
  });
});

export { router as hueRouter };
