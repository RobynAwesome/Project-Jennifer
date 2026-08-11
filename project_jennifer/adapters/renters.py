"""Provider-neutral execution adapters for Project Jennifer stateless renters.

Provider SDKs belong behind this seam. Free Mode, CAG, RAG, validation, receipts,
and memory contracts must not depend on a vendor SDK directly.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol


@dataclass(frozen=True, slots=True)
class RenterExecutionRequest:
    run_id: str
    renter_id: str
    prompt: str
    subject: str
    evidence_ids: tuple[str, ...] = ()
    governed_context: tuple[str, ...] = ()
    metadata: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class RenterExecutionResult:
    renter_id: str
    output: str
    evidence_ids_used: tuple[str, ...] = ()
    tool_actions: tuple[str, ...] = ()
    metadata: dict[str, object] = field(default_factory=dict)


class RenterExecutionAdapter(Protocol):
    """One exact runtime/provider execution seam."""

    renter_id: str

    def execute(self, request: RenterExecutionRequest) -> RenterExecutionResult:
        """Execute only the bounded request and return observable results."""


@dataclass(slots=True)
class RenterAdapterRegistry:
    """Registry of adapters keyed by the exact provider:model runtime id."""

    _adapters: dict[str, RenterExecutionAdapter] = field(default_factory=dict)

    def register(self, adapter: RenterExecutionAdapter) -> None:
        self._adapters[adapter.renter_id] = adapter

    def get(self, renter_id: str) -> RenterExecutionAdapter | None:
        return self._adapters.get(renter_id)

    def require(self, renter_id: str) -> RenterExecutionAdapter:
        adapter = self.get(renter_id)
        if adapter is None:
            raise LookupError(f"No execution adapter registered for renter: {renter_id}")
        return adapter

    def list(self) -> tuple[RenterExecutionAdapter, ...]:
        return tuple(self._adapters.values())
