BEGIN;

CREATE TABLE IF NOT EXISTS relationship_actors (
  id TEXT PRIMARY KEY,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('human-player', 'companion', 'npc', 'system')),
  canonical_name TEXT NOT NULL,
  companion_id TEXT,
  external_identity_ref TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS relationship_instances (
  id TEXT PRIMARY KEY,
  relationship_type TEXT NOT NULL,
  active_lane TEXT NOT NULL CHECK (active_lane IN ('co-builder', 'mentor', 'guardian', 'rival-ally', 'platonic', 'romantic')),
  status TEXT NOT NULL CHECK (status IN ('proposed', 'active', 'strained', 'separated', 'restored', 'completed')),
  created_by_actor_id TEXT NOT NULL REFERENCES relationship_actors(id),
  version INTEGER NOT NULL CHECK (version > 0),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS relationship_participants (
  relationship_id TEXT NOT NULL REFERENCES relationship_instances(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL REFERENCES relationship_actors(id),
  participant_role TEXT NOT NULL,
  joined_at BIGINT NOT NULL,
  left_at BIGINT,
  PRIMARY KEY (relationship_id, actor_id)
);

CREATE TABLE IF NOT EXISTS relationship_boundaries (
  id TEXT PRIMARY KEY,
  relationship_id TEXT NOT NULL REFERENCES relationship_instances(id) ON DELETE CASCADE,
  boundary_type TEXT NOT NULL,
  boundary_value TEXT NOT NULL,
  declared_by_actor_id TEXT NOT NULL REFERENCES relationship_actors(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'superseded', 'revoked')),
  effective_at BIGINT NOT NULL,
  supersedes_boundary_id TEXT REFERENCES relationship_boundaries(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS relationship_boundaries_one_active_type
  ON relationship_boundaries (relationship_id, boundary_type)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS relationship_events (
  id TEXT PRIMARY KEY,
  relationship_id TEXT NOT NULL REFERENCES relationship_instances(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_version INTEGER NOT NULL DEFAULT 1,
  source_actor_id TEXT NOT NULL REFERENCES relationship_actors(id),
  correlation_id TEXT NOT NULL,
  causation_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  payload_json JSONB NOT NULL,
  occurred_at BIGINT NOT NULL,
  recorded_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS relationship_events_by_aggregate
  ON relationship_events (relationship_id, recorded_at, id);

CREATE TABLE IF NOT EXISTS relationship_state_transitions (
  id TEXT PRIMARY KEY,
  relationship_id TEXT NOT NULL REFERENCES relationship_instances(id) ON DELETE CASCADE,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  trigger_event_id TEXT NOT NULL UNIQUE REFERENCES relationship_events(id),
  governance_result TEXT NOT NULL CHECK (governance_result IN ('PASSED', 'FAILED', 'DEFERRED')),
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS relationship_validation_receipts (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE REFERENCES relationship_events(id) ON DELETE CASCADE,
  relationship_id TEXT NOT NULL REFERENCES relationship_instances(id) ON DELETE CASCADE,
  protocol TEXT NOT NULL,
  protocol_version TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('PASSED', 'FAILED', 'DEFERRED')),
  checks_json JSONB NOT NULL,
  warnings_json JSONB NOT NULL,
  failure_codes_json JSONB NOT NULL,
  evidence_refs_json JSONB NOT NULL,
  human_validated BOOLEAN NOT NULL DEFAULT FALSE,
  integrity_hash TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS relationship_quest_decisions (
  id TEXT PRIMARY KEY,
  quest_instance_id TEXT NOT NULL,
  relationship_id TEXT NOT NULL REFERENCES relationship_instances(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL,
  selected_option TEXT NOT NULL,
  trigger_event_id TEXT NOT NULL UNIQUE REFERENCES relationship_events(id),
  receipt_id TEXT NOT NULL UNIQUE REFERENCES relationship_validation_receipts(id),
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS relationship_outbox_events (
  id TEXT PRIMARY KEY,
  aggregate_type TEXT NOT NULL CHECK (aggregate_type = 'relationship'),
  aggregate_id TEXT NOT NULL REFERENCES relationship_instances(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  published_at BIGINT,
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_error TEXT,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS relationship_outbox_pending
  ON relationship_outbox_events (created_at, id)
  WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS relationship_sync_checkpoints (
  consumer_name TEXT PRIMARY KEY,
  last_event_id TEXT,
  updated_at BIGINT NOT NULL
);

COMMIT;
