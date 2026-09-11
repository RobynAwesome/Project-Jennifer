-- Player-safe consequence reveal projection.
--
-- This table is NOT causal authority. The epistemic receipt + admitted runtime
-- Memory Receipt remain authoritative evidence. Each row is an append-only
-- version of a redacted ConsequenceRevealReceipt suitable for player read-through.

CREATE TABLE IF NOT EXISTS consequence_reveal_versions (
  reveal_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  origin_epistemic_receipt_id TEXT NOT NULL,
  origin_event_id TEXT NOT NULL,
  origin_actor_id TEXT NOT NULL,
  origin_rule_id TEXT NOT NULL,
  reveal_state TEXT NOT NULL CHECK (
    reveal_state IN ('LATENT', 'EFFECT_VISIBLE', 'CAUSE_PARTIAL', 'CAUSE_REVEALED', 'REVISED')
  ),
  receipt_json JSONB NOT NULL,
  persisted_at BIGINT NOT NULL,
  PRIMARY KEY (reveal_id, version),
  CHECK ((receipt_json ->> 'revealId') = reveal_id),
  CHECK ((receipt_json ->> 'canonical') = 'false'),
  CHECK ((receipt_json ->> 'proofState') = 'player-safe-causal-reveal'),
  CHECK ((receipt_json -> 'origin' ->> 'epistemicReceiptId') = origin_epistemic_receipt_id),
  CHECK ((receipt_json -> 'origin' ->> 'eventId') = origin_event_id),
  CHECK ((receipt_json -> 'origin' ->> 'actorId') = origin_actor_id),
  CHECK ((receipt_json -> 'origin' ->> 'consequenceRuleId') = origin_rule_id)
);

CREATE INDEX IF NOT EXISTS consequence_reveal_versions_latest_idx
  ON consequence_reveal_versions (reveal_id, version DESC);

CREATE INDEX IF NOT EXISTS consequence_reveal_versions_event_idx
  ON consequence_reveal_versions (origin_event_id, origin_actor_id);

COMMENT ON TABLE consequence_reveal_versions IS
  'Append-only non-authoritative player-safe projection of governed consequence reveal receipts.';
