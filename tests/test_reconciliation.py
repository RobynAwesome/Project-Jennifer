from __future__ import annotations

import unittest

from project_jennifer.contracts import PersistenceRail, PersistenceRole, StorageRecord
from project_jennifer.storage import OfflineReconciliationService, SQLiteOfflineEdgeStore


class MemoryAuthorityStore:
    def __init__(self) -> None:
        self.records: dict[str, StorageRecord] = {}

    def read_authoritative(self, record_id: str) -> StorageRecord | None:
        return self.records.get(record_id)

    def append_authoritative(self, record: StorageRecord) -> None:
        if record.record_id in self.records:
            raise RuntimeError(f"duplicate authoritative record: {record.record_id}")
        if record.rail != PersistenceRail.POSTGRESQL:
            raise ValueError("authority records must use the PostgreSQL rail")
        self.records[record.record_id] = record


class MemoryProjectionStore:
    def __init__(self) -> None:
        self.records: dict[str, StorageRecord] = {}

    def read_projection(self, record_id: str) -> StorageRecord | None:
        return self.records.get(record_id)

    def upsert_projection(self, record: StorageRecord) -> None:
        if record.rail != PersistenceRail.MONGODB:
            raise ValueError("projections must use the MongoDB rail")
        self.records[record.record_id] = record


class ReconciliationTests(unittest.TestCase):
    def make_local(self, record_id: str, value: str, version: str = "v1") -> StorageRecord:
        return StorageRecord(
            record_id=record_id,
            payload={"value": value},
            rail=PersistenceRail.SQLITE,
            role=PersistenceRole.OFFLINE_EDGE,
            version=version,
        )

    def test_admission_projects_and_clears_pending(self) -> None:
        authority = MemoryAuthorityStore()
        projection = MemoryProjectionStore()
        with SQLiteOfflineEdgeStore() as offline:
            offline.append_pending(self.make_local("evt-1", "offline"))
            result = OfflineReconciliationService(
                offline=offline,
                authority=authority,
                projection=projection,
            ).reconcile(run_id="run-1")

            self.assertTrue(result.complete)
            self.assertEqual(result.admitted, 1)
            self.assertEqual(result.conflicts, 0)
            self.assertEqual(offline.pending(), ())
            self.assertEqual(authority.records["evt-1"].rail, PersistenceRail.POSTGRESQL)
            self.assertEqual(projection.records["evt-1"].rail, PersistenceRail.MONGODB)
            self.assertEqual(projection.records["evt-1"].payload, {"value": "offline"})

    def test_idempotent_existing_authority_does_not_duplicate(self) -> None:
        authority = MemoryAuthorityStore()
        authority.records["evt-2"] = StorageRecord(
            record_id="evt-2",
            payload={"value": "same"},
            rail=PersistenceRail.POSTGRESQL,
            role=PersistenceRole.GOVERNED_AUTHORITY,
        )
        projection = MemoryProjectionStore()
        with SQLiteOfflineEdgeStore() as offline:
            offline.append_pending(self.make_local("evt-2", "same"))
            result = OfflineReconciliationService(
                offline=offline,
                authority=authority,
                projection=projection,
            ).reconcile(run_id="run-2")

            self.assertTrue(result.complete)
            self.assertEqual(result.idempotent, 1)
            self.assertEqual(len(authority.records), 1)
            self.assertEqual(offline.pending(), ())

    def test_conflict_preserves_authority_and_receipts_consequence(self) -> None:
        authority = MemoryAuthorityStore()
        authority.records["evt-3"] = StorageRecord(
            record_id="evt-3",
            payload={"value": "authoritative"},
            rail=PersistenceRail.POSTGRESQL,
            role=PersistenceRole.GOVERNED_AUTHORITY,
        )
        projection = MemoryProjectionStore()
        with SQLiteOfflineEdgeStore() as offline:
            offline.append_pending(self.make_local("evt-3", "offline-conflict"))
            result = OfflineReconciliationService(
                offline=offline,
                authority=authority,
                projection=projection,
            ).reconcile(run_id="run-3")

            self.assertTrue(result.complete)
            self.assertEqual(result.conflicts, 1)
            self.assertEqual(authority.records["evt-3"].payload, {"value": "authoritative"})
            self.assertEqual(projection.records["evt-3"].payload, {"value": "authoritative"})
            self.assertEqual(offline.pending(), ())
            self.assertIn("postgres-authority-preserved", result.receipts[0].consequences)


if __name__ == "__main__":
    unittest.main()
