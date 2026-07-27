CREATE TABLE "MemoryRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "kind" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "contentJson" TEXT NOT NULL,
  "tagsJson" TEXT NOT NULL,
  "confidence" REAL NOT NULL,
  "importance" REAL NOT NULL,
  "provenanceJson" TEXT NOT NULL,
  "omegaJson" TEXT NOT NULL,
  "createdAt" BIGINT NOT NULL,
  "accessedAt" BIGINT NOT NULL,
  "expiresAt" BIGINT
);

CREATE TABLE "TelemetryRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "kind" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "payloadJson" TEXT NOT NULL,
  "fidelity" TEXT NOT NULL,
  "contextMode" TEXT NOT NULL,
  "timestamp" BIGINT NOT NULL
);

CREATE TABLE "WorldStateStub" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "snapshotJson" TEXT NOT NULL,
  "createdAt" BIGINT NOT NULL
);
