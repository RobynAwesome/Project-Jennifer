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


LEGACY_TOKEN = "jenniferalphalegacy"
CURRENT_TOKEN = "jenniferomegacurrent"


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

    # MongoDB $text search is tokenized/stemmed rather than exact-phrase or
    # strict-AND search. Unique non-overlapping proof tokens therefore test the
    # intended invariant directly: replacing the projection removes the old
    # projection's unique searchable content from current adaptive context.
    first = _projection(
        "v1",
        f"live mongodb adaptive context {LEGACY_TOKEN}",
    )
    second = _projection(
        "v2",
        f"live mongodb adaptive context {CURRENT_TOKEN}",
    )

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
                query=LEGACY_TOKEN,
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
                query=LEGACY_TOKEN,
                subject="mongodb-adaptive-adapter-proof",
                target_lane=RelationalLane.RESEARCH,
            )
        )
        assert stale == (), "replaced projection's unique token remained searchable"

        current = adapter.retrieve(
            RetrievalQuery(
                query=CURRENT_TOKEN,
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
                    "previous-projection-unique-content-removed",
                    "authority-tier-remains-gsmb-mongodb-2",
                    "fresh-client-read-preserved-projection",
                ],
                "search_semantics": "tokenized-mongodb-text-search; unique proof tokens used",
            },
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
