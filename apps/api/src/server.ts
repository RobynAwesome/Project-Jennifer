import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { getPernFoundationStatus, InMemoryEventBus } from "@jennifer/shared";
import { TelemetryCollector, TimeTracker, EnvironmentMonitor } from "@jennifer/telemetry";
import { telemetryMiddleware, errorHandler } from "./middleware/index.js";
import { governanceRouter } from "./routes/governance.js";
import { memoryRouter } from "./routes/memory.js";
import { crisisRouter } from "./routes/crisis.js";
import { runtimeRouter } from "./routes/runtime.js";
import { ncmpRouter } from "./routes/ncmp.js";

const PORT = process.env.PORT ?? 3001;

// ─── Shared infrastructure ───────────────────────────────────────────────────

const bus = new InMemoryEventBus();
const telemetry = new TelemetryCollector(bus);
const timeTracker = new TimeTracker();
const envMonitor = new EnvironmentMonitor();

// ─── Express app ─────────────────────────────────────────────────────────────

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(telemetryMiddleware(telemetry));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: timeTracker.uptimeMs(),
    tick: timeTracker.currentTick(),
    environment: envMonitor.snapshot(),
    pern: getPernFoundationStatus(),
    timestamp: new Date().toISOString(),
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────

app.use("/api/governance", governanceRouter);
app.use("/api/memory", memoryRouter);
app.use("/api/crisis", crisisRouter);
app.use("/api/runtime", runtimeRouter);
app.use("/api/ncmp", ncmpRouter);

// Telemetry endpoint
app.get("/api/telemetry", (_req, res) => {
  const limit = 100;
  res.json({ events: telemetry.query({ limit }), total: telemetry.getAll().length });
});

// ─── Error handling ───────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[Jennifer API] Listening on http://localhost:${PORT}`);
  console.log(`[Jennifer API] Environment: ${envMonitor.snapshot().platform}`);
});

export { app };
