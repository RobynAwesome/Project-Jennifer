import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import { InProcessEventBus } from "@jennifer/shared";
import { TelemetryCollector } from "@jennifer/telemetry";

import { PrismaGSMB } from "./gsmb.js";

async function createDbPath(name: string): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "jennifer-gsmb-"));
  return path.join(dir, `${name}.db`);
}

test("GSMB serialized write queue keeps concurrent writes safe", async () => {
  const dbPath = await createDbPath("queue");
  const prisma = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } },
  });

  const gsmb = new PrismaGSMB(prisma);

  const writes = Array.from({ length: 40 }, (_, index) =>
    gsmb.enqueueWrite({
      kind: "episodic",
      subject: `subject-${index}`,
      content: { index },
      tags: ["queue"],
      confidence: 0.9,
      importance: 0.5,
      provenance: { source: "test" },
      omegaContext: { personal: 0.34, workEdu: 0.33, relational: 0.33 },
    })
  );

  const results = await Promise.all(writes);
  await gsmb.flush();

  const rows = await gsmb.read({ tags: ["queue"] });

  assert.equal(results.length, 40);
  assert.equal(new Set(results.map((result) => result.id)).size, 40);
  assert.equal(rows.length, 40);

  await prisma.$disconnect();
});

test("resurrection reload is byte-identical after GSMB + telemetry persistence", async () => {
  const dbPath = await createDbPath("resurrection");

  const prismaA = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } },
  });

  const bus = new InProcessEventBus();
  const gsmbA = new PrismaGSMB(prismaA, bus);
  const telemetryA = new TelemetryCollector(bus);

  const unsubscribe = bus.subscribe("jennifer.telemetry", async (event) => {
    await prismaA.telemetryRecord.create({
      data: {
        id: event.id,
        kind: event.kind,
        source: event.source,
        payloadJson: JSON.stringify(event.payload),
        fidelity: String(event.payload.fidelity ?? "full"),
        contextMode: String(event.payload.contextMode ?? "operational"),
        timestamp: BigInt(event.timestamp),
      },
    });
  });

  await gsmbA.enqueueWrite({
    kind: "semantic",
    subject: "governance-rule",
    content: { allow: ["read"] },
    tags: ["resurrection", "governance"],
    confidence: 1,
    importance: 0.9,
    provenance: { source: "integration-test", actor: "user-1" },
    omegaContext: { personal: 0.2, workEdu: 0.7, relational: 0.1 },
  });

  await telemetryA.emit(
    "runtime.event",
    "integration-test",
    { phase: "warmup" },
    {
      mode: "crisis",
      omega: { personal: 0.2, workEdu: 0.7, relational: 0.1 },
    }
  );

  await gsmbA.flush();

  const snapshotA = {
    memory: await gsmbA.read({ tags: ["resurrection"] }),
    telemetry: (await prismaA.telemetryRecord.findMany({ orderBy: { timestamp: "asc" } })).map(
      (row) => ({ ...row, timestamp: Number(row.timestamp) })
    ),
  };

  const encodedA = JSON.stringify(snapshotA);

  unsubscribe();
  await prismaA.$disconnect();

  const prismaB = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } },
  });
  const gsmbB = new PrismaGSMB(prismaB);

  const snapshotB = {
    memory: await gsmbB.read({ tags: ["resurrection"] }),
    telemetry: (await prismaB.telemetryRecord.findMany({ orderBy: { timestamp: "asc" } })).map(
      (row) => ({ ...row, timestamp: Number(row.timestamp) })
    ),
  };

  const encodedB = JSON.stringify(snapshotB);

  assert.equal(encodedB, encodedA);

  await prismaB.$disconnect();
});
