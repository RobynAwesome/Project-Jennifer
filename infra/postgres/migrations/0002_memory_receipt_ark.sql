BEGIN;

-- Durable Memory Receipt Ark
--
-- The receipt is written before a consequential mutation is permitted to run.
-- Runtime action IDs are unique so separate runtime processes cannot both
-- reserve the same action for execution.

CREATE TABLE IF NOT EXISTS memory_receipts (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  concept_state TEXT NOT NULL,
  admission TEXT NOT NULL CHECK (admission IN ('admitted', 'deferred', 'quarantined')),
  receipt_json JSONB NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS memory_receipts_by_subject
  ON memory_receipts (subject, created_at DESC);

CREATE INDEX IF NOT EXISTS memory_receipts_by_admission
  ON memory_receipts (admission, created_at DESC);

CREATE TABLE IF NOT EXISTS runtime_gate_actions (
  action_id TEXT PRIMARY KEY,
  decision TEXT NOT NULL CHECK (decision IN ('ACCEPT', 'HOLD', 'REJECT')),
  state TEXT NOT NULL CHECK (state IN ('blocked', 'prepared', 'applied', 'failed')),
  reasons_json JSONB NOT NULL,
  evaluation_json JSONB NOT NULL,
  receipt_id TEXT NOT NULL UNIQUE REFERENCES memory_receipts(id),
  mutation_applied BOOLEAN NOT NULL DEFAULT FALSE,
  output_json JSONB,
  error_message TEXT,
  prepared_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  CONSTRAINT runtime_gate_applied_requires_mutation
    CHECK (state <> 'applied' OR mutation_applied = TRUE),
  CONSTRAINT runtime_gate_blocked_forbids_mutation
    CHECK (state <> 'blocked' OR mutation_applied = FALSE)
);

CREATE INDEX IF NOT EXISTS runtime_gate_actions_by_state
  ON runtime_gate_actions (state, updated_at, action_id);

CREATE INDEX IF NOT EXISTS runtime_gate_actions_by_receipt
  ON runtime_gate_actions (receipt_id);

COMMIT;
