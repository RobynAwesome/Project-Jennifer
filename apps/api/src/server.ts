import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { getPernFoundationStatus, InMemoryEventBus } from "@jennifer/shared";
import {
  EnvironmentMonitor,
  TelemetryCollector,
  TimeTracker,
} from "@jennifer/telemetry";

import { errorHandler, telemetryMiddleware } from "./middleware/index.js";
import { initializePersistence } from "./persistence.js";
import { crisisRouter } from "./routes/crisis.js";
import { governanceRouter } from "./routes/governance.js";
import { memoryRouter } from "./routes/memory.js";
import { ncmpRouter } from "./routes/ncmp.js";
import { createRelationshipAuthorityRouter } from "./routes/relationships.js";
import { runtimeRouter } from "./routes/runtime.js";

const PORT = process.env.PORT ?? 3001;

// ─── Shared infrastructure ───────────────────────────────────────────────────

const bus = new InMemoryEventBus();
const telemetry = new TelemetryCollector(bus);
const timeTracker = new TimeTracker();
const envMonitor = new EnvironmentMonitor();
const persistence = await initializePersistence({
  env: process.env,
  telemetry,
});

envMonitor.setMetadata("persistenceMode", persistence.mode);
envMonitor.setMetadata("projectionMode", persistence.projectionMode);

// ─── Express app ─────────────────────────────────────────────────────────────

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(telemetryMiddleware(telemetry));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/health", async (_req, res) => {
  const persistenceHealth = await persistence.health();
  const authorityReady =
    persistenceHealth.mode !== "postgres" ||
    persistenceHealth.database === "ready";
  const projectionReady =
    persistenceHealth.projection.mode !== "mongodb" ||
    persistenceHealth.projection.database === "ready";
  const ready = authorityReady && projectionReady;

  res.status(ready ? 200 : 503).json({
    status: ready ? "ok" : "degraded",
    uptime: timeTracker.uptimeMs(),
    tick: timeTracker.currentTick(),
    environment: envMonitor.snapshot(),
    persistence: persistenceHealth,
    pern: getPernFoundationStatus(),
    timestamp: new Date().toISOString(),
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────

app.use("/api/governance", governanceRouter);
app.use("/api/memory", memoryRouter);
app.use("/api/crisis", crisisRouter);

// Relationship authority is mounted first so the canonical relationship paths
// cannot fall through to the legacy runtime router.
app.use(
  "/api/runtime/relationships",
  createRelationshipAuthorityRouter(persistence.relationshipEngine, {
    rebuildProjections:
      persistence.projectionMode === "mongodb"
        ? () => persistence.rebuildRelationshipProjections()
        : undefined,
  }),
);
app.use("/api/runtime", runtimeRouter);
app.use("/api/ncmp", ncmpRouter);

app.get("/api/telemetry", (_req, res) => {
  const limit = 100;
  res.json({
    events: telemetry.query({ limit }),
    total: telemetry.getAll().length,
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start / governed shutdown ────────────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log(`[Jennifer API] Listening on http://localhost:${PORT}`);
  console.log(`[Jennifer API] Environment: ${envMonitor.snapshot().platform}`);
  console.log(`[Jennifer API] Persistence: ${persistence.mode}`);
  console.log(`[Jennifer API] Projection: ${persistence.projectionMode}`);
});

let shuttingDown = false;
async function shutdown(signal: "SIGINT" | "SIGTERM"): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[Jennifer API] ${signal} received; closing governed resources`);

  try {
    await closeServer();
    await persistence.close();
    process.exitCode = 0;
  } catch (error) {
    console.error("[Jennifer API] Shutdown failure", error);
    process.exitCode = 1;
  }
}

function closeServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});
process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

export { app, persistence, server };
