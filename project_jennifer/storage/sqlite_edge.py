"""SQLite offline edge store for commands, receipts, and replay continuity."""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from project_jennifer.contracts import PersistenceRail, PersistenceRole, StorageRecord


class SQLiteOfflineEdgeStore:
    """Persist offline records until governed reconciliation is available."""

    def __init__(self, path: str | Path = ":memory:") -> None:
        self._connection = sqlite3.connect(str(path))
        self._connection.execute("PRAGMA foreign_keys = ON")
        self._connection.execute("PRAGMA journal_mode = WAL")
        self._create_schema()

    def _create_schema(self) -> None:
        self._connection.execute(
            """
            CREATE TABLE IF NOT EXISTS offline_records (
                sequence_id INTEGER PRIMARY KEY AUTOINCREMENT,
                record_id TEXT NOT NULL UNIQUE,
                payload_json TEXT NOT NULL,
                rail TEXT NOT NULL,
                role TEXT NOT NULL,
                version TEXT NOT NULL,
                reconciled INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        self._connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_offline_records_pending ON offline_records(reconciled, sequence_id)"
        )
        self._connection.commit()

    def append_pending(self, record: StorageRecord) -> None:
        if record.rail != PersistenceRail.SQLITE:
            raise ValueError("SQLiteOfflineEdgeStore only accepts records declared on the SQLite rail.")
        self._connection.execute(
            """
            INSERT INTO offline_records (record_id, payload_json, rail, role, version)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                record.record_id,
                json.dumps(record.payload, sort_keys=True, default=str),
                record.rail.value,
                record.role.value,
                record.version,
            ),
        )
        self._connection.commit()

    def pending(self) -> tuple[StorageRecord, ...]:
        rows = self._connection.execute(
            """
            SELECT record_id, payload_json, rail, role, version
            FROM offline_records
            WHERE reconciled = 0
            ORDER BY sequence_id ASC
            """
        ).fetchall()
        return tuple(
            StorageRecord(
                record_id=row[0],
                payload=dict(json.loads(row[1])),
                rail=PersistenceRail(row[2]),
                role=PersistenceRole(row[3]),
                version=row[4],
            )
            for row in rows
        )

    def mark_reconciled(self, record_id: str) -> None:
        cursor = self._connection.execute(
            "UPDATE offline_records SET reconciled = 1 WHERE record_id = ?",
            (record_id,),
        )
        if cursor.rowcount != 1:
            raise LookupError(f"Offline record not found: {record_id}")
        self._connection.commit()

    def close(self) -> None:
        self._connection.close()

    def __enter__(self) -> "SQLiteOfflineEdgeStore":
        return self

    def __exit__(self, exc_type: object, exc: object, traceback: object) -> None:
        self.close()
