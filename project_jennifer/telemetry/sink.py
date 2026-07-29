"""Telemetry contracts for capturing runtime, evaluation, and simulation events."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Protocol


@dataclass(frozen=True, slots=True)
class TelemetryRecord:
    """Normalized telemetry event emitted by any framework."""

    category: str
    message: str
    attributes: dict[str, object] = field(default_factory=dict)
    recorded_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class TelemetrySink(Protocol):
    """Interface for telemetry sinks such as JSONL, analytics DBs, or dashboards."""

    def write(self, record: TelemetryRecord) -> None:
        """Persist a telemetry record."""
