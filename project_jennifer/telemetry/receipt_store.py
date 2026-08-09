"""Receipt sinks, including SQLite offline continuity for Project Jennifer."""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from pathlib import Path

from project_jennifer.contracts import GovernanceReceipt, ReceiptOutcome


class InMemoryReceiptSink:
    """Deterministic receipt sink for tests and transient runs."""

    def __init__(self) -> None:
        self._receipts: list[GovernanceReceipt] = []
        self._ids: set[str] = set()

    def write(self, receipt: GovernanceReceipt) -> None:
        if receipt.receipt_id in self._ids:
            raise ValueError(f"Receipt is immutable and already exists: {receipt.receipt_id}")
        self._ids.add(receipt.receipt_id)
        self._receipts.append(receipt)

    def list_for_run(self, run_id: str) -> tuple[GovernanceReceipt, ...]:
        return tuple(receipt for receipt in self._receipts if receipt.run_id == run_id)


class SQLiteReceiptSink:
    """SQLite-backed offline receipt rail for IdeaPad/local operation.

    SQLite preserves local evidence and replay continuity. It does not promote
    itself above PostgreSQL-governed authority when reconciliation occurs.
    """

    def __init__(self, path: str | Path = ":memory:") -> None:
        self._connection = sqlite3.connect(str(path))
        self._connection.execute("PRAGMA foreign_keys = ON")
        self._connection.execute("PRAGMA journal_mode = WAL")
        self._create_schema()

    def _create_schema(self) -> None:
        self._connection.execute(
            """
            CREATE TABLE IF NOT EXISTS governance_receipts (
                receipt_id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                layer TEXT NOT NULL,
                action TEXT NOT NULL,
                outcome TEXT NOT NULL,
                subject TEXT NOT NULL,
                reason TEXT NOT NULL,
                evidence_ids_json TEXT NOT NULL,
                consequences_json TEXT NOT NULL,
                metadata_json TEXT NOT NULL,
                schema_version TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        self._connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_governance_receipts_run ON governance_receipts(run_id, created_at, receipt_id)"
        )
        self._connection.commit()

    def write(self, receipt: GovernanceReceipt) -> None:
        self._connection.execute(
            """
            INSERT INTO governance_receipts (
                receipt_id,
                run_id,
                layer,
                action,
                outcome,
                subject,
                reason,
                evidence_ids_json,
                consequences_json,
                metadata_json,
                schema_version,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                receipt.receipt_id,
                receipt.run_id,
                receipt.layer,
                receipt.action,
                receipt.outcome.value,
                receipt.subject,
                receipt.reason,
                json.dumps(receipt.evidence_ids),
                json.dumps(receipt.consequences),
                json.dumps(receipt.metadata, sort_keys=True, default=str),
                receipt.schema_version,
                receipt.created_at.isoformat(),
            ),
        )
        self._connection.commit()

    def list_for_run(self, run_id: str) -> tuple[GovernanceReceipt, ...]:
        rows = self._connection.execute(
            """
            SELECT
                receipt_id,
                run_id,
                layer,
                action,
                outcome,
                subject,
                reason,
                evidence_ids_json,
                consequences_json,
                metadata_json,
                schema_version,
                created_at
            FROM governance_receipts
            WHERE run_id = ?
            ORDER BY created_at ASC, receipt_id ASC
            """,
            (run_id,),
        ).fetchall()

        receipts: list[GovernanceReceipt] = []
        for row in rows:
            receipts.append(
                GovernanceReceipt(
                    receipt_id=row[0],
                    run_id=row[1],
                    layer=row[2],
                    action=row[3],
                    outcome=ReceiptOutcome(row[4]),
                    subject=row[5],
                    reason=row[6],
                    evidence_ids=tuple(json.loads(row[7])),
                    consequences=tuple(json.loads(row[8])),
                    metadata=dict(json.loads(row[9])),
                    schema_version=row[10],
                    created_at=datetime.fromisoformat(row[11]),
                )
            )
        return tuple(receipts)

    def close(self) -> None:
        self._connection.close()

    def __enter__(self) -> "SQLiteReceiptSink":
        return self

    def __exit__(self, exc_type: object, exc: object, traceback: object) -> None:
        self.close()
