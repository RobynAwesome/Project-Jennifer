// Project Jennifer adaptive relationship projections.
// Run with: mongosh "$MONGODB_URI" infra/mongodb/0001_relationship_projections.js

const databaseName = process.env.MONGODB_DATABASE || "project_jennifer";
const database = db.getSiblingDB(databaseName);

const relationshipContexts = database.getCollection("relationship_contexts");
relationshipContexts.createIndex(
  { relationshipId: 1 },
  { unique: true, name: "relationship_contexts_relationship_id" }
);
relationshipContexts.createIndex(
  { "participants.actorId": 1, updatedAt: -1 },
  { name: "relationship_contexts_participant_updated" }
);
relationshipContexts.createIndex(
  { activeLane: 1, status: 1 },
  { name: "relationship_contexts_lane_status" }
);
relationshipContexts.createIndex(
  { lastAuthoritativeEventId: 1 },
  { unique: true, name: "relationship_contexts_last_event" }
);

const playerWorldProjections = database.getCollection("player_world_projections");
playerWorldProjections.createIndex(
  { playerId: 1 },
  { unique: true, name: "player_world_projections_player_id" }
);
playerWorldProjections.createIndex(
  { activeRelationshipId: 1 },
  { name: "player_world_projections_relationship" }
);
playerWorldProjections.createIndex(
  { lastAuthoritativeEventId: 1 },
  { unique: true, sparse: true, name: "player_world_projections_last_event" }
);

print(`Project Jennifer relationship projection indexes ready in ${databaseName}.`);
