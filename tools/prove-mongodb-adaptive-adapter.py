#!/usr/bin/env python3
"""Live MongoDB proof for Project Jennifer adaptive-context storage/retrieval."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from project_jennifer.contracts import (  # noqa: E402
    PersistenceRail,
    PersistenceRole,
    RelationalLane,
    RetrievalQuery,
    StorageRecord,
)
from project_jennifer.storage import MongoAdaptiveContextAdapter  # noqa: E402


def _projection(version: str, content: str) -> StorageRecord:
    return StorageRecord(
        record_id="ci-mongodb-adaptive-adapter-proof",
        payload={
            "state": {"version": version, "source": "github-actions"},
            "jennifer_retrieval": {
                "enabled": True,
                "subject": "mongodb-adaptive-adapter-proof",
                "content": content,
                "authority_scope": "ci.live-mongodb.adaptive-context",
                "source_lane": "research",
                "metadata": {
                    "projection_state": "adaptive",
                    "proof_state": "POC",
                },
            },
        },
        rail=PersistenceRail.MONGODB,
        role=PersistenceRole.ADAPTIVE_CONTEXT,
        version=version,
    )


def main() -> None:
    uri = os.environ.get("MONGODB_URI", "").strip()
    database = os.environ.get("MONGODB_DATABASE", "project_jennifer_ci").strip()
    if not uri:
        raise SystemExit("MONGODB_URI is required for MongoDB adaptive proof")

    first = _projection("v1", "live mongodb adaptive context first projection")
    second = _projection("v2", "live mongodb adaptive context updated projection")

    with MongoAdaptiveContextAdapter.from_uri(
        uri,
        database,
        serverSelectionTimeoutMS=10_000,
    ) as adapter:
        adapter.ensure_indexes()
        adapter.upsert_projection(first)
        assert adapter.read_projection(first.record_id) == first

        first_evidence = adapter.retrieve(
            RetrievalQuery(
                query="live mongodb adaptive context first projection",
                subject="mongodb-adaptive-adapter-proof",
                target_lane=RelationalLane.RESEARCH,
                metadata={"limit": 5},
            )
        )
        assert len(first_evidence) == 1
        assert first_evidence[0].authority_tier.value == 2
        assert first_evidence[0].source_lane == RelationalLane.RESEARCH
        assert first_evidence[0].metadata["proof_state"] == "POC"

        adapter.upsert_projection(second)
        assert adapter.read_projection(second.record_id) == second

        stale = adapter.retrieve(
            RetrievalQuery(
                query="first projection",
                subject="mongodb-adaptive-adapter-proof",
                target_lane=RelationalLane.RESEARCH,
            )
        )
        assert stale == (), "replaced projection remained searchable as current context"

        current = adapter.retrieve(
            RetrievalQuery(
                query="updated projection",
                subject="mongodb-adaptive-adapter-proof",
                target_lane=RelationalLane.RESEARCH,
            )
        )
        assert len(current) == 1
        assert current[0].metadata["storage_version"] == "v2"

    # A fresh client proves the state lives in MongoDB, not the adapter process.
    with MongoAdaptiveContextAdapter.from_uri(
        uri,
        database,
        serverSelectionTimeoutMS=10_000,
    ) as restarted:
        restarted.ensure_indexes()
        after_restart = restarted.read_projection(second.record_id)
        assert after_restart == second

    print(
        json.dumps(
            {
                "status": "PASSED",
                "adapter": "MongoAdaptiveContextAdapter",
                "record_id": second.record_id,
                "checks": [
                    "live-mongodb-write",
                    "adaptive-upsert",
                    "adaptive-retrieval",
                    "previous-projection-replaced",
                    "authority-tier-remains-gsmb-mongodb-2",
                    "fresh-client-read-preserved-projection",
                ],
            },
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
