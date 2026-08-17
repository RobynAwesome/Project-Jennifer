#!/usr/bin/env python3
"""Live PostgreSQL proof for the Project Jennifer authority/retrieval adapter.

This script is intentionally small and deterministic. It expects the repository
PostgreSQL migrations to have already been applied to DATABASE_URL.
"""

from __future__ import annotations

import json
import os

from project_jennifer.contracts import (
    PersistenceRail,
    PersistenceRole,
    RelationalLane,
    RetrievalQuery,
    StorageRecord,
)
from project_jennifer.storage import AuthorityConflictError, PostgresGovernedAuthorityAdapter


def main() -> None:
    dsn = os.environ.get("DATABASE_URL", "").strip()
    if not dsn:
        raise SystemExit("DATABASE_URL is required for PostgreSQL authority proof")

    record_id = "ci-postgres-authority-adapter-proof"
    canonical = StorageRecord(
        record_id=record_id,
        payload={
            "proof": "postgres-authority-adapter",
            "jennifer_retrieval": {
                "enabled": True,
                "subject": "postgres-authority-adapter-proof",
                "content": "live postgres governed authority retrieval proof",
                "authority_scope": "ci.live-postgres",
                "source_lane": "research",
                "metadata": {"proof_state": "POC", "environment": "github-actions"},
            },
        },
        rail=PersistenceRail.POSTGRESQL,
        role=PersistenceRole.GOVERNED_AUTHORITY,
        version="v1",
    )

    adapter = PostgresGovernedAuthorityAdapter.from_dsn(dsn)
    adapter.append_authoritative(canonical)
    adapter.append_authoritative(canonical)

    first_read = adapter.read_authoritative(record_id)
    assert first_read == canonical, "authoritative round-trip changed payload/version"

    evidence = adapter.retrieve(
        RetrievalQuery(
            query="live postgres governed authority retrieval proof",
            subject="postgres-authority-adapter-proof",
            target_lane=RelationalLane.RESEARCH,
            metadata={"limit": 5},
        )
    )
    assert len(evidence) == 1, f"expected one retrieval item, got {len(evidence)}"
    assert evidence[0].evidence_id == record_id
    assert evidence[0].authority_tier.value == 0
    assert evidence[0].source_lane == RelationalLane.RESEARCH
    assert evidence[0].metadata["proof_state"] == "POC"

    conflict_rejected = False
    try:
        adapter.append_authoritative(
            StorageRecord(
                record_id=record_id,
                payload={"proof": "conflicting-overwrite"},
                rail=PersistenceRail.POSTGRESQL,
                role=PersistenceRole.GOVERNED_AUTHORITY,
                version="v2",
            )
        )
    except AuthorityConflictError:
        conflict_rejected = True

    assert conflict_rejected, "conflicting authoritative overwrite was not rejected"

    # Fresh adapter + fresh DB connections prove that the preserved authority is
    # in PostgreSQL, not process-local adapter state.
    restarted_adapter = PostgresGovernedAuthorityAdapter.from_dsn(dsn)
    after_conflict = restarted_adapter.read_authoritative(record_id)
    assert after_conflict == canonical, "conflict changed canonical PostgreSQL authority"

    print(
        json.dumps(
            {
                "status": "PASSED",
                "adapter": "PostgresGovernedAuthorityAdapter",
                "record_id": record_id,
                "checks": [
                    "live-postgres-write",
                    "idempotent-replay",
                    "authoritative-round-trip",
                    "governed-retrieval",
                    "conflicting-overwrite-rejected",
                    "fresh-adapter-read-preserved-authority",
                ],
            },
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
