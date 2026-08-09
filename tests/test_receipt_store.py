from __future__ import annotations

import unittest

from project_jennifer.contracts import GovernanceReceipt, ReceiptOutcome
from project_jennifer.telemetry import SQLiteReceiptSink


class SQLiteReceiptSinkTests(unittest.TestCase):
    def test_round_trip_receipt_in_sqlite(self) -> None:
        receipt = GovernanceReceipt(
            run_id="run-1",
            layer="cag",
            action="gate",
            outcome=ReceiptOutcome.PROCEEDED_WITH_RECEIPT,
            subject="communication",
            reason="relevance preserved",
            evidence_ids=("e-1",),
            consequences=("admitted:1",),
            metadata={"offline": True},
        )

        with SQLiteReceiptSink(":memory:") as sink:
            sink.write(receipt)
            restored = sink.list_for_run("run-1")

        self.assertEqual(len(restored), 1)
        self.assertEqual(restored[0].receipt_id, receipt.receipt_id)
        self.assertEqual(restored[0].evidence_ids, ("e-1",))
        self.assertEqual(restored[0].metadata["offline"], True)

    def test_receipts_are_immutable_by_id(self) -> None:
        receipt = GovernanceReceipt(
            run_id="run-1",
            layer="rag",
            action="retrieve",
            outcome=ReceiptOutcome.PROCEEDED_WITH_RECEIPT,
            subject="knowledge",
            reason="retrieved",
        )

        with SQLiteReceiptSink(":memory:") as sink:
            sink.write(receipt)
            with self.assertRaises(Exception):
                sink.write(receipt)


if __name__ == "__main__":
    unittest.main()
