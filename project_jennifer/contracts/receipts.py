"""Generic receipts for CAG, RAG, renter routing, and memory promotion."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from typing import Protocol
from uuid import uuid4


class ReceiptOutcome(StrEnum):
    OBSERVED = "observed"
    PROCEEDED = "proceeded"
    PROCEEDED_WITH_RECEIPT = "proceeded-with-receipt"
    REQUIRES_HUMAN_PROMOTION = "requires-human-promotion"
    STOPPED_IMMUTABLE_BOUNDARY = "stopped-immutable-boundary"
    FAILED_VALIDATION = "failed-validation"
    REPAIRED = "repaired"


@dataclass(frozen=True, slots=True)
class GovernanceReceipt:
    """Immutable application-level record of a consequential governance event."""

    run_id: str
    layer: str
    action: str
    outcome: ReceiptOutcome
    subject: str
    reason: str
    evidence_ids: tuple[str, ...] = ()
    consequences: tuple[str, ...] = ()
    metadata: dict[str, object] = field(default_factory=dict)
    schema_version: str = "v1"
    receipt_id: str = field(default_factory=lambda: str(uuid4()))
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class ReceiptSink(Protocol):
    """Durable or in-memory sink for governance receipts."""

    def write(self, receipt: GovernanceReceipt) -> None:
        """Persist a receipt without silently changing its semantics."""

    def list_for_run(self, run_id: str) -> tuple[GovernanceReceipt, ...]:
        """Return receipts for one governed run in deterministic order."""


@dataclass(frozen=True, slots=True)
class PreferencePromotionCandidate:
    """Feedback artifact that may later enter DPO/RLHF/RLAIF/fine-tune pipelines."""

    prompt_id: str
    chosen: str
    rejected: str
    source_receipt_ids: tuple[str, ...]
    rationale: str
    human_validated: bool = False
    reviewer_id: str | None = None

    @property
    def promotable(self) -> bool:
        """Training promotion requires explicit human validation."""

        return self.human_validated
