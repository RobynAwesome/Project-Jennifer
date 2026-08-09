from __future__ import annotations

import unittest

from project_jennifer.contracts import PersistenceRail, PersistenceRole, StorageRecord
from project_jennifer.storage import SQLiteOfflineEdgeStore


class SQLiteOfflineEdgeStoreTests(unittest.TestCase):
    def test_pending_records_survive_until_marked_reconciled(self) -> None:
        record = StorageRecord(
            record_id="offline-1",
            payload={"match": "local", "result": "pending"},
            rail=PersistenceRail.SQLITE,
            role=PersistenceRole.OFFLINE_EDGE,
        )

        with SQLiteOfflineEdgeStore(":memory:") as store:
            store.append_pending(record)
            self.assertEqual(store.pending(), (record,))
            store.mark_reconciled("offline-1")
            self.assertEqual(store.pending(), ())


if __name__ == "__main__":
    unittest.main()
