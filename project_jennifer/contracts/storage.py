"""Persistence rail contracts for governed authority, adaptation, and offline continuity."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from typing import Protocol


class PersistenceRail(StrEnum):
    POSTGRESQL = "postgresql"
    MONGODB = "mongodb"
    SQLITE = "sqlite"
    LOCAL_FILE = "local-file"
    EXTERNAL = "external"


class PersistenceRole(StrEnum):
    GOVERNED_AUTHORITY = "governed-authority"
    ADAPTIVE_CONTEXT = "adaptive-context"
    OFFLINE_EDGE = "offline-edge"
    KNOWLEDGE_SOURCE = "knowledge-source"


@dataclass(frozen=True, slots=True)
class StorageRecord:
    record_id: str
    payload: dict[str, object]
    rail: PersistenceRail
    role: PersistenceRole
    version: str = "v1"


class GovernedAuthorityStore(Protocol):
    """PostgreSQL-shaped authority boundary."""

    def read_authoritative(self, record_id: str) -> StorageRecord | None:
        """Read a governed authoritative record."""

    def append_authoritative(self, record: StorageRecord) -> None:
        """Append/admit a governed authoritative record transactionally."""


class AdaptiveContextStore(Protocol):
    """MongoDB-shaped adaptive projection boundary."""

    def read_projection(self, record_id: str) -> StorageRecord | None:
        """Read mutable/adaptive context."""

    def upsert_projection(self, record: StorageRecord) -> None:
        """Update a rebuildable projection without overriding authority."""


class OfflineEdgeStore(Protocol):
    """SQLite-shaped local continuity and replay boundary."""

    def append_pending(self, record: StorageRecord) -> None:
        """Persist an offline command/event/receipt for later reconciliation."""

    def pending(self) -> tuple[StorageRecord, ...]:
        """Return pending offline records in deterministic order."""

    def mark_reconciled(self, record_id: str) -> None:
        """Mark one local record reconciled only after governed admission/conflict handling."""
