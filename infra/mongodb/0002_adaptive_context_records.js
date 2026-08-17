// Project Jennifer governed adaptive-context retrieval indexes.
// Run with: mongosh "$MONGODB_URI" infra/mongodb/0002_adaptive_context_records.js

const databaseName = process.env.MONGODB_DATABASE || "project_jennifer";
const database = db.getSiblingDB(databaseName);
const adaptiveContexts = database.getCollection("adaptive_context_records");

adaptiveContexts.createIndex(
  { subject: 1, updated_at: -1 },
  {
    name: "adaptive_context_subject_updated",
    partialFilterExpression: { retrieval_enabled: true },
  }
);

adaptiveContexts.createIndex(
  { source_lane: 1, updated_at: -1 },
  {
    name: "adaptive_context_lane_updated",
    partialFilterExpression: { retrieval_enabled: true },
  }
);

adaptiveContexts.createIndex(
  { subject: "text", content: "text" },
  {
    name: "adaptive_context_text",
    weights: { subject: 5, content: 1 },
  }
);

print(`Project Jennifer adaptive-context indexes ready in ${databaseName}.`);
