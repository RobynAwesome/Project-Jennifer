"""Governed reconciliation across SQLite, PostgreSQL-shaped authority, and MongoDB-shaped projection rails."""

from __future__ import annotations

from dataclasses import dataclass

from project_jennifer.contracts import (
    AdaptiveContextStore,
    GovernanceReceipt,
    GovernedAuthorityStore,
    OfflineEdgeStore,
    PersistenceRail,
    PersistenceRole,
    ReceiptOutcome,
    StorageRecord,
)


@dataclass(frozen=True, slots=True)
class ReconciliationResult:
    processed: int
    admitted: int
    idempotent: int
    conflicts: int
    failed: int
    receipts: tuple[GovernanceReceipt, ...]

    @property
    def complete(self) -> bool:
        return self.failed == 0


class OfflineReconciliationService:
    """Admit offline edge records without letting SQLite silently become authority.

    Sequence:
      SQLite pending evidence
      -> authority/idempotency check
      -> PostgreSQL-shaped admission OR governed conflict
      -> MongoDB-shaped projection refresh
      -> mark local record reconciled
      -> receipt
    """

    def __init__(
        self,
        *,
        offline: OfflineEdgeStore,
        authority: GovernedAuthorityStore,
        projection: AdaptiveContextStore,
    ) -> None:
        self._offline = offline
        self._authority = authority
        self._projection = projection

    def reconcile(self, *, run_id: str, subject: str = "offline-reconciliation") -> ReconciliationResult:
        receipts: list[GovernanceReceipt] = []
        admitted = 0
        idempotent = 0
        conflicts = 0
        failed = 0
        pending = self._offline.pending()

        for local in pending:
            try:
                existing = self._authority.read_authoritative(local.record_id)

                if existing is None:
                    authoritative = StorageRecord(
                        record_id=local.record_id,
                        payload=dict(local.payload),
                        rail=PersistenceRail.POSTGRESQL,
                        role=PersistenceRole.GOVERNED_AUTHORITY,
                        version=local.version,
                    )
                    self._authority.append_authoritative(authoritative)
                    self._projection.upsert_projection(self._as_projection(authoritative))
                    self._offline.mark_reconciled(local.record_id)
                    admitted += 1
                    receipts.append(
                        GovernanceReceipt(
                            run_id=run_id,
                            layer="offline-reconciliation",
                            action="admit-offline-record",
                            outcome=ReceiptOutcome.PROCEEDED_WITH_RECEIPT,
                            subject=subject,
                            reason="Offline SQLite record admitted to governed authority and projected to adaptive context.",
                            evidence_ids=(local.record_id,),
                            consequences=("postgres-admitted", "mongo-projected", "sqlite-reconciled"),
                            metadata={"record_id": local.record_id, "version": local.version},
                        )
                    )
                    continue

                if existing.payload == local.payload and existing.version == local.version:
                    self._projection.upsert_projection(self._as_projection(existing))
                    self._offline.mark_reconciled(local.record_id)
                    idempotent += 1
                    receipts.append(
                        GovernanceReceipt(
                            run_id=run_id,
                            layer="offline-reconciliation",
                            action="confirm-idempotent-record",
                            outcome=ReceiptOutcome.PROCEEDED_WITH_RECEIPT,
                            subject=subject,
                            reason="Authoritative record already existed with the same governed payload/version.",
                            evidence_ids=(local.record_id,),
                            consequences=("no-duplicate-authority-write", "mongo-projected", "sqlite-reconciled"),
                            metadata={"record_id": local.record_id, "version": local.version},
                        )
                    )
                    continue

                # A conflict is a governed outcome, not an exception to hide. The local
                # event remains evidence, while existing authority keeps precedence.
                self._projection.upsert_projection(self._as_projection(existing))
                self._offline.mark_reconciled(local.record_id)
                conflicts += 1
                receipts.append(
                    GovernanceReceipt(
                        run_id=run_id,
                        layer="offline-reconciliation",
                        action="record-authority-conflict",
                        outcome=ReceiptOutcome.FAILED_VALIDATION,
                        subject=subject,
                        reason="Offline payload conflicted with an existing authoritative record; authority was preserved.",
                        evidence_ids=(local.record_id,),
                        consequences=(
                            "postgres-authority-preserved",
                            "offline-conflict-receipted",
                            "mongo-refreshed-from-authority",
                            "sqlite-reconciled",
                        ),
                        metadata={
                            "record_id": local.record_id,
                            "offline_version": local.version,
                            "authority_version": existing.version,
                            "offline_payload": dict(local.payload),
                            "authority_payload": dict(existing.payload),
                        },
                    )
                )
            except Exception as exc:
                # Do not mark the record reconciled. It must remain pending for replay.
                failed += 1
                receipts.append(
                    GovernanceReceipt(
                        run_id=run_id,
                        layer="offline-reconciliation",
                        action="reconciliation-attempt",
                        outcome=ReceiptOutcome.FAILED_VALIDATION,
                        subject=subject,
                        reason=f"Reconciliation failed and the SQLite record remains pending: {exc}",
                        evidence_ids=(local.record_id,),
                        consequences=("sqlite-remains-pending",),
                        metadata={"record_id": local.record_id, "exception_type": type(exc).__name__},
                    )
                )

        return ReconciliationResult(
            processed=len(pending),
            admitted=admitted,
            idempotent=idempotent,
            conflicts=conflicts,
            failed=failed,
            receipts=tuple(receipts),
        )

    @staticmethod
    def _as_projection(record: StorageRecord) -> StorageRecord:
        return StorageRecord(
            record_id=record.record_id,
            payload=dict(record.payload),
            rail=PersistenceRail.MONGODB,
            role=PersistenceRole.ADAPTIVE_CONTEXT,
            version=record.version,
        )
