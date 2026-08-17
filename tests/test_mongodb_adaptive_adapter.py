from __future__ import annotations

import copy
import unittest
from dataclasses import dataclass, field
from typing import Iterable, Mapping, Sequence

from project_jennifer.contracts import (
    PersistenceRail,
    PersistenceRole,
    RelationalLane,
    StorageRecord,
)
from project_jennifer.retrieval import GovernedRAG
from project_jennifer.storage import (
    MongoAdaptiveContextAdapter,
    OfflineReconciliationService,
    SQLiteOfflineEdgeStore,
)


@dataclass
class FakeMongoCollection:
    documents: dict[str, dict[str, object]] = field(default_factory=dict)
    indexes: list[tuple[tuple[tuple[str, object], ...], dict[str, object]]] = field(
        default_factory=list
    )
    fail_next_upsert: bool = False

    def create_index(self, keys: Sequence[tuple[str, object]], **kwargs: object) -> str:
        self.indexes.append((tuple(keys), dict(kwargs)))
        return str(kwargs.get("name", "index"))

    def find_one(
        self,
        filter: Mapping[str, object],
        projection: Mapping[str, object] | None = None,
    ) -> dict[str, object] | None:
        document = self.documents.get(str(filter.get("_id", "")))
        if document is None:
            return None
        if projection is None:
            return copy.deepcopy(document)
        selected: dict[str, object] = {"_id": document["_id"]}
        for key, include in projection.items():
            if include and key in document:
                selected[key] = copy.deepcopy(document[key])
        return selected

    def update_one(
        self,
        filter: Mapping[str, object],
        update: Mapping[str, object],
        *,
        upsert: bool,
    ) -> object:
        if self.fail_next_upsert:
            self.fail_next_upsert = False
            raise RuntimeError("simulated MongoDB projection failure")

        record_id = str(filter.get("_id", ""))
        existing = self.documents.get(record_id)
        if existing is None:
            if not upsert:
                return object()
            existing = {"_id": record_id}
            set_on_insert = update.get("$setOnInsert", {})
            if isinstance(set_on_insert, Mapping):
                existing.update(copy.deepcopy(dict(set_on_insert)))

        set_values = update.get("$set", {})
        if isinstance(set_values, Mapping):
            existing.update(copy.deepcopy(dict(set_values)))
        self.documents[record_id] = existing
        return object()

    def aggregate(self, pipeline: Sequence[Mapping[str, object]]) -> Iterable[dict[str, object]]:
        match = pipeline[0].get("$match", {})
        assert isinstance(match, Mapping)
        search = ""
        text = match.get("$text")
        if isinstance(text, Mapping):
            search = str(text.get("$search", "")).lower().strip()

        subject = ""
        set_stage = pipeline[1].get("$set", {})
        if isinstance(set_stage, Mapping):
            exact = set_stage.get("_subject_exact")
            if isinstance(exact, Mapping):
                cond = exact.get("$cond")
                if isinstance(cond, Sequence) and cond:
                    equality = cond[0]
                    if isinstance(equality, Mapping):
                        operands = equality.get("$eq")
                        if isinstance(operands, Sequence) and len(operands) == 2:
                            subject = str(operands[1])

        limit_stage = next(stage for stage in pipeline if "$limit" in stage)
        limit = int(limit_stage["$limit"])

        candidates: list[dict[str, object]] = []
        for original in self.documents.values():
            if original.get("retrieval_enabled") is not True:
                continue
            searchable = f"{original.get('subject', '')} {original.get('content', '')}".lower()
            if search and not all(term in searchable for term in search.split()):
                continue
            document = copy.deepcopy(original)
            document["_subject_exact"] = 0 if original.get("subject") == subject else 1
            document["_retrieval_score"] = 0.9 if search else 0.0
            candidates.append(document)

        candidates.sort(
            key=lambda document: (
                int(document["_subject_exact"]),
                -float(document["_retrieval_score"]),
                -int(document.get("updated_at", 0)),
                str(document["_id"]),
            )
        )
        return candidates[:limit]


class MemoryAuthorityStore:
    def __init__(self, records: Mapping[str, StorageRecord] | None = None) -> None:
        self.records = dict(records or {})

    def read_authoritative(self, record_id: str) -> StorageRecord | None:
        return self.records.get(record_id)

    def append_authoritative(self, record: StorageRecord) -> None:
        self.records[record.record_id] = record


def projection_record(
    record_id: str,
    value: str,
    *,
    version: str = "v1",
    retrieval: dict[str, object] | None = None,
) -> StorageRecord:
    payload: dict[str, object] = {"value": value}
    if retrieval is not None:
        payload["jennifer_retrieval"] = retrieval
    return StorageRecord(
        record_id=record_id,
        payload=payload,
        rail=PersistenceRail.MONGODB,
        role=PersistenceRole.ADAPTIVE_CONTEXT,
        version=version,
    )


class MongoAdaptiveContextAdapterTests(unittest.TestCase):
    def setUp(self) -> None:
        self.collection = FakeMongoCollection()
        self.adapter = MongoAdaptiveContextAdapter(self.collection)

    def test_indexes_cover_subject_lane_and_full_text_retrieval(self) -> None:
        self.adapter.ensure_indexes()
        names = {str(kwargs.get("name")) for _, kwargs in self.collection.indexes}
        self.assertEqual(
            names,
            {
                "adaptive_context_subject_updated",
                "adaptive_context_lane_updated",
                "adaptive_context_text",
            },
        )

    def test_projection_is_mutable_and_latest_version_replaces_previous_projection(self) -> None:
        self.adapter.upsert_projection(projection_record("projection-1", "first"))
        self.adapter.upsert_projection(
            projection_record("projection-1", "second", version="v2")
        )

        stored = self.adapter.read_projection("projection-1")
        self.assertEqual(
            stored,
            projection_record("projection-1", "second", version="v2"),
        )
        self.assertEqual(len(self.collection.documents), 1)

    def test_projection_is_not_retrieval_visible_without_explicit_envelope(self) -> None:
        self.adapter.upsert_projection(projection_record("projection-2", "adaptive-secret"))
        rag = GovernedRAG(sources=(self.adapter,))
        bundle = rag.retrieve(rag.plan(query="adaptive-secret", subject="projection-2"))
        self.assertEqual(bundle.evidence, ())
        self.assertFalse(bundle.grounding_complete)

    def test_retrieval_projection_emits_current_gsmb_mongodb_tier_and_provenance(self) -> None:
        self.adapter.upsert_projection(
            projection_record(
                "adaptive-evidence-1",
                "mutable-full-payload",
                retrieval={
                    "enabled": True,
                    "subject": "adaptive-root-routing",
                    "content": "adaptive root routing context",
                    "source_uri": "mongodb://adaptive/adaptive-evidence-1",
                    "authority_scope": "project-jennifer.adaptive-root-routing",
                    "source_lane": "research",
                    "observed_at": "2026-08-17T17:40:00+02:00",
                    "checksum": "mongo-checksum-1",
                    "metadata": {"projection_state": "adaptive"},
                },
            )
        )

        rag = GovernedRAG(sources=(self.adapter,))
        bundle = rag.retrieve(
            rag.plan(
                query="adaptive root routing context",
                subject="adaptive-root-routing",
                target_lane=RelationalLane.RESEARCH,
                metadata={"limit": 10},
            )
        )

        self.assertTrue(bundle.grounding_complete)
        self.assertEqual(len(bundle.evidence), 1)
        evidence = bundle.evidence[0]
        self.assertEqual(evidence.evidence_id, "adaptive-evidence-1")
        self.assertEqual(evidence.source_id, "mongodb-adaptive-context")
        self.assertEqual(evidence.authority_tier.value, 2)
        self.assertEqual(
            evidence.authority_scope,
            "project-jennifer.adaptive-root-routing",
        )
        self.assertEqual(evidence.source_lane, RelationalLane.RESEARCH)
        self.assertEqual(evidence.checksum, "mongo-checksum-1")
        self.assertEqual(evidence.metadata["projection_state"], "adaptive")
        self.assertEqual(evidence.metadata["persistence_rail"], "mongodb")

    def test_private_projection_is_suppressed_in_public_lane(self) -> None:
        self.adapter.upsert_projection(
            projection_record(
                "private-adaptive",
                "full-private-projection",
                retrieval={
                    "enabled": True,
                    "subject": "private-adaptive-memory",
                    "content": "private adaptive memory",
                    "source_lane": "private",
                },
            )
        )
        rag = GovernedRAG(sources=(self.adapter,))
        bundle = rag.retrieve(
            rag.plan(
                query="private adaptive memory",
                subject="private-adaptive-memory",
                target_lane=RelationalLane.PUBLIC,
            )
        )

        self.assertEqual(bundle.evidence, ())
        self.assertIn(
            ("private-adaptive", "suppressed-by-privacy"),
            tuple((item_id, disposition.value) for item_id, disposition in bundle.suppressed),
        )

    def test_invalid_retrieval_envelope_is_rejected_before_upsert(self) -> None:
        with self.assertRaisesRegex(ValueError, "content is required"):
            self.adapter.upsert_projection(
                projection_record(
                    "invalid-envelope",
                    "payload",
                    retrieval={
                        "enabled": True,
                        "subject": "missing-content",
                        "source_lane": "research",
                    },
                )
            )
        self.assertNotIn("invalid-envelope", self.collection.documents)

    def test_reconciliation_projects_authoritative_payload_into_mongodb(self) -> None:
        authority = StorageRecord(
            record_id="offline-mongo-1",
            payload={"value": "postgres-authority"},
            rail=PersistenceRail.POSTGRESQL,
            role=PersistenceRole.GOVERNED_AUTHORITY,
            version="v3",
        )
        authority_store = MemoryAuthorityStore({authority.record_id: authority})
        local = StorageRecord(
            record_id=authority.record_id,
            payload={"value": "offline-candidate"},
            rail=PersistenceRail.SQLITE,
            role=PersistenceRole.OFFLINE_EDGE,
            version="v1",
        )

        with SQLiteOfflineEdgeStore() as offline:
            offline.append_pending(local)
            result = OfflineReconciliationService(
                offline=offline,
                authority=authority_store,
                projection=self.adapter,
            ).reconcile(run_id="mongo-projection-proof")

            self.assertTrue(result.complete)
            self.assertEqual(offline.pending(), ())
            projected = self.adapter.read_projection(authority.record_id)
            self.assertIsNotNone(projected)
            assert projected is not None
            self.assertEqual(projected.payload, authority.payload)
            self.assertEqual(projected.version, "v3")
            self.assertEqual(projected.rail, PersistenceRail.MONGODB)
            self.assertEqual(projected.role, PersistenceRole.ADAPTIVE_CONTEXT)

    def test_projection_failure_leaves_sqlite_pending(self) -> None:
        authority_store = MemoryAuthorityStore()
        self.collection.fail_next_upsert = True
        local = StorageRecord(
            record_id="offline-mongo-failure",
            payload={"value": "candidate"},
            rail=PersistenceRail.SQLITE,
            role=PersistenceRole.OFFLINE_EDGE,
            version="v1",
        )

        with SQLiteOfflineEdgeStore() as offline:
            offline.append_pending(local)
            result = OfflineReconciliationService(
                offline=offline,
                authority=authority_store,
                projection=self.adapter,
            ).reconcile(run_id="mongo-projection-failure")

            self.assertFalse(result.complete)
            self.assertEqual(result.failed, 1)
            self.assertEqual(
                tuple(record.record_id for record in offline.pending()),
                ("offline-mongo-failure",),
            )
            self.assertIn(
                "sqlite-remains-pending",
                result.receipts[0].consequences,
            )

    def test_projection_payload_must_be_finite_json_safe_data(self) -> None:
        bad = StorageRecord(
            record_id="nan-projection",
            payload={"value": float("nan")},
            rail=PersistenceRail.MONGODB,
            role=PersistenceRole.ADAPTIVE_CONTEXT,
        )
        with self.assertRaisesRegex(ValueError, "finite JSON-safe"):
            self.adapter.upsert_projection(bad)


if __name__ == "__main__":
    unittest.main()
