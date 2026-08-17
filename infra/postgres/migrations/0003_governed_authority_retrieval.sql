BEGIN;

-- Governed authority + retrieval rail
--
-- PostgreSQL remains authoritative. The full JSON payload is preserved for
-- governed reads/reconciliation while a bounded retrieval projection is
-- materialized into typed columns. A record is never retrieval-visible unless
-- retrieval_enabled is explicitly true and both subject/content are present.

CREATE TABLE IF NOT EXISTS governed_authority_records (
  record_id TEXT PRIMARY KEY,
  payload_json JSONB NOT NULL,
  payload_hash TEXT NOT NULL,
  version TEXT NOT NULL,

  subject TEXT,
  content TEXT,
  source_uri TEXT,
  authority_scope TEXT NOT NULL DEFAULT 'project-jennifer',
  source_lane TEXT NOT NULL DEFAULT 'other'
    CHECK (source_lane IN (
      'private',
      'intimate-fiction',
      'colleague',
      'player',
      'companion',
      'customer',
      'research',
      'crisis',
      'public',
      'other'
    )),
  observed_at TEXT,
  checksum TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  retrieval_enabled BOOLEAN NOT NULL DEFAULT FALSE,

  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,

  CONSTRAINT governed_authority_retrieval_requires_content
    CHECK (
      retrieval_enabled = FALSE
      OR (subject IS NOT NULL AND content IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS governed_authority_records_by_subject
  ON governed_authority_records (subject, updated_at DESC, record_id)
  WHERE retrieval_enabled = TRUE;

CREATE INDEX IF NOT EXISTS governed_authority_records_by_lane
  ON governed_authority_records (source_lane, updated_at DESC, record_id)
  WHERE retrieval_enabled = TRUE;

CREATE INDEX IF NOT EXISTS governed_authority_records_search
  ON governed_authority_records
  USING GIN (
    to_tsvector(
      'simple',
      coalesce(subject, '') || ' ' || coalesce(content, '')
    )
  )
  WHERE retrieval_enabled = TRUE;

COMMIT;
