from __future__ import annotations

import json
import unittest
from dataclasses import dataclass, field
from typing import Any, Sequence

from project_jennifer.contracts import (
    PersistenceRail,
    PersistenceRole,
    RelationalLane,
    StorageRecord,
)
from project_jennifer.retrieval import GovernedRAG
from project_jennifer.storage import (
    AuthorityConflictError,
    OfflineReconciliationService,
    PostgresGovernedAuthorityAdapter,
    SQLiteOfflineEdgeStore,
)


@dataclass
class FakePostgres:
    records: dict[str, dict[str, object]] = field(default_factory=dict)
    commits: int = 0
    rollbacks: int = 0
    closes: int = 0
    fail_next_insert: bool = False
    executed: list[tuple[str, tuple[object, ...]]] = field(default_factory=list)

    def connect(self) -> "FakeConnection":
        return FakeConnection(self)


class FakeConnection:
    def __init__(self, database: FakePostgres) -> None:
        self.database = database

    def cursor(self) -> "FakeCursor":
        return FakeCursor(self.database)

    def commit(self) -> None:
        self.database.commits += 1

    def rollback(self) -> None:
        self.database.rollbacks += 1

    def close(self) -> None:
        self.database.closes += 1


class FakeCursor:
    def __init__(self, database: FakePostgres) -> None:
        self.database = database
        self.rowcount = -1
        self._one: Sequence[object] | None = None
        self._rows: list[Sequence[object]] = []

    def execute(self, query: str, params: Sequence[object] | None = None) -> None:
        values = tuple(params or ())
        normalized = " ".join(query.lower().split())
        self.database.executed.append((normalized, values))
        self._one = None
        self._rows = []

        if normalized.startswith("insert into governed_authority_records"):
            if self.database.fail_next_insert:
                self.database.fail_next_insert = False
                raise RuntimeError("simulated PostgreSQL write failure")

            record_id = str(values[0])
            if record_id in self.database.records:
                self.rowcount = 0
                return

            self.database.records[record_id] = {
                "record_id": record_id,
                "payload_json": str(values[1]),
                "payload_hash": str(values[2]),
                "version": str(values[3]),
                "subject": values[4],
                "content": values[5],
                "source_uri": values[6],
                "authority_scope": values[7],
                "source_lane": values[8],
                "observed_at": values[9],
                "checksum": values[10],
                "metadata_json": str(values[11]),
                "retrieval_enabled": bool(values[12]),
                "created_at": values[13],
                "updated_at": values[14],
            }
            self.rowcount = 1
            self._one = (record_id,)
            return

        if "select payload_hash, version" in normalized:
            record = self.database.records.get(str(values[0]))
            self._one = (
                (str(record["payload_hash"]), str(record["version"]))
                if record is not None
                else None
            )
            return

        if "select payload_json, version" in normalized:
            record = self.database.records.get(str(values[0]))
            self._one = (
                (str(record["payload_json"]), str(record["version"]))
                if record is not None
                else None
            )
            return

        if "from governed_authority_records" in normalized and "retrieval_enabled = true" in normalized:
            search = str(values[0]).strip().lower()
            subject = str(values[4])
            limit = int(values[5])
            candidates: list[tuple[int, float, str, Sequence[object]]] = []
            for record in self.database.records.values():
                if not bool(record["retrieval_enabled"]):
                    continue
                content = str(record["content"] or "")
                record_subject = str(record["subject"] or "")
                searchable = f"{record_subject} {content}".lower()
                if search and not all(term in searchable for term in search.split()):
                    continue
                exact_subject = 0 if record_subject == subject else 1
                score = 0.95 if exact_subject == 0 and search else (0.6 if search else 0.0)
                candidates.append(
                    (
                        exact_subject,
                        -score,
                        str(record["record_id"]),
                        (
                            record["record_id"],
                            content,
                            record["source_uri"],
                            record["authority_scope"],
                            record["source_lane"],
                            record["observed_at"],
                            record["checksum"],
                            record["metadata_json"],
                            record["version"],
                            record["payload_hash"],
                            score,
                        ),
                    )
                )
            candidates.sort(key=lambda item: (item[0], item[1], item[2]))
            self._rows = [item[3] for item in candidates[:limit]]
            return

        raise AssertionError(f"FakePostgres received unexpected SQL: {normalized}")

    def fetchone(self) -> Sequence[object] | None:
        row = self._one
        self._one = None
        return row

    def fetchall(self) -> Sequence[Sequence[object]]:
        return tuple(self._rows)

    def close(self) -> None:
        return None


class MemoryProjectionStore:
    def __init__(self) -> None:
        self.records: dict[str, StorageRecord] = {}

    def read_projection(self, record_id: str) -> StorageRecord | None:
        return self.records.get(record_id)

    def upsert_projection(self, record: StorageRecord) -> None:
        self.records[record.record_id] = record


def authority_record(
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
        rail=PersistenceRail.POSTGRESQL,
        role=PersistenceRole.GOVERNED_AUTHORITY,
        version=version,
    )


class PostgresAuthorityAdapterTests(unittest.TestCase):
    def setUp(self) -> None:
        self.database = FakePostgres()
        self.adapter = PostgresGovernedAuthorityAdapter(self.database.connect)

    def test_append_is_idempotent_but_conflicting_authority_fails_closed(self) -> None:
        first = authority_record("authority-1", "canonical")
        self.adapter.append_authoritative(first)
        self.adapter.append_authoritative(first)

        self.assertEqual(len(self.database.records), 1)
        self.assertEqual(self.adapter.read_authoritative("authority-1"), first)

        with self.assertRaises(AuthorityConflictError):
            self.adapter.append_authoritative(
                authority_record("authority-1", "conflicting", version="v2")
            )

        stored = self.adapter.read_authoritative("authority-1")
        self.assertIsNotNone(stored)
        assert stored is not None
        self.assertEqual(stored.payload, {"value": "canonical"})
        self.assertEqual(stored.version, "v1")
        self.assertGreaterEqual(self.database.rollbacks, 1)

    def test_generic_authority_record_is_not_retrieval_visible_by_default(self) -> None:
        self.adapter.append_authoritative(authority_record("authority-2", "private-state"))
        rag = GovernedRAG(sources=(self.adapter,))
        bundle = rag.retrieve(rag.plan(query="private-state", subject="authority-2"))
        self.assertEqual(bundle.evidence, ())
        self.assertFalse(bundle.grounding_complete)

    def test_retrieval_projection_emits_postgres_authority_with_provenance(self) -> None:
        self.adapter.append_authoritative(
            authority_record(
                "evidence-1",
                "full-authority-payload",
                retrieval={
                    "enabled": True,
                    "subject": "root-node-routing",
                    "content": "validated root node routing receipt",
                    "source_uri": "postgres://authority/evidence-1",
                    "authority_scope": "project-jennifer.root-routing",
                    "source_lane": "research",
                    "observed_at": "2026-08-17T17:40:00+02:00",
                    "checksum": "checksum-1",
                    "metadata": {"receipt_state": "POC"},
                },
            )
        )

        rag = GovernedRAG(sources=(self.adapter,))
        bundle = rag.retrieve(
            rag.plan(
                query="validated root routing",
                subject="root-node-routing",
                target_lane=RelationalLane.RESEARCH,
                metadata={"limit": 10},
            )
        )

        self.assertTrue(bundle.grounding_complete)
        self.assertEqual(len(bundle.evidence), 1)
        evidence = bundle.evidence[0]
        self.assertEqual(evidence.evidence_id, "evidence-1")
        self.assertEqual(evidence.source_id, "postgres-governed-authority")
        self.assertEqual(evidence.authority_tier.value, 0)
        self.assertEqual(evidence.authority_scope, "project-jennifer.root-routing")
        self.assertEqual(evidence.source_lane, RelationalLane.RESEARCH)
        self.assertEqual(evidence.checksum, "checksum-1")
        self.assertEqual(evidence.metadata["receipt_state"], "POC")
        self.assertEqual(evidence.metadata["persistence_rail"], "postgresql")

    def test_private_item_is_suppressed_by_governed_rag_without_cross_lane_authorization(self) -> None:
        self.adapter.append_authoritative(
            authority_record(
                "private-evidence",
                "full-private-payload",
                retrieval={
                    "enabled": True,
                    "subject": "private-memory",
                    "content": "private governed memory",
                    "source_lane": "private",
                },
            )
        )
        rag = GovernedRAG(sources=(self.adapter,))
        public_query = rag.plan(
            query="private governed memory",
            subject="private-memory",
            target_lane=RelationalLane.PUBLIC,
        )
        bundle = rag.retrieve(public_query)

        self.assertEqual(bundle.evidence, ())
        self.assertIn(
            ("private-evidence", "suppressed-by-privacy"),
            tuple((item_id, disposition.value) for item_id, disposition in bundle.suppressed),
        )

    def test_invalid_retrieval_envelope_is_rejected_before_database_write(self) -> None:
        with self.assertRaisesRegex(ValueError, "subject is required"):
            self.adapter.append_authoritative(
                authority_record(
                    "bad-retrieval",
                    "payload",
                    retrieval={
                        "enabled": True,
                        "content": "missing subject",
                        "source_lane": "research",
                    },
                )
            )
        self.assertNotIn("bad-retrieval", self.database.records)

    def test_database_failure_during_reconciliation_leaves_sqlite_record_pending(self) -> None:
        projection = MemoryProjectionStore()
        self.database.fail_next_insert = True
        local = StorageRecord(
            record_id="offline-1",
            payload={"value": "offline"},
            rail=PersistenceRail.SQLITE,
            role=PersistenceRole.OFFLINE_EDGE,
            version="v1",
        )

        with SQLiteOfflineEdgeStore() as offline:
            offline.append_pending(local)
            result = OfflineReconciliationService(
                offline=offline,
                authority=self.adapter,
                projection=projection,
            ).reconcile(run_id="postgres-adapter-failure")

            self.assertFalse(result.complete)
            self.assertEqual(result.failed, 1)
            self.assertEqual(tuple(record.record_id for record in offline.pending()), ("offline-1",))
            self.assertEqual(projection.records, {})
            self.assertIn("sqlite-remains-pending", result.receipts[0].consequences)

    def test_payload_must_be_finite_json_safe_data(self) -> None:
        bad = StorageRecord(
            record_id="nan-record",
            payload={"value": float("nan")},
            rail=PersistenceRail.POSTGRESQL,
            role=PersistenceRole.GOVERNED_AUTHORITY,
        )
        with self.assertRaisesRegex(ValueError, "finite JSON-safe"):
            self.adapter.append_authoritative(bad)


if __name__ == "__main__":
    unittest.main()
