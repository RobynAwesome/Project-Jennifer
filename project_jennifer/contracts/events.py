"""Event contracts shared across Free Mode and supporting frameworks."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from typing import Protocol
from uuid import uuid4


class FrameworkEvent(StrEnum):
    """Stable event names emitted across the multi-framework runtime."""

    RUN_STARTED = "run.started"
    RUN_COMPLETED = "run.completed"

    CAG_PRE_INFERENCE = "cag.pre_inference"
    CAG_INTERRUPTION_GATE = "cag.interruption_gate"
    CAG_POST_INFERENCE = "cag.post_inference"

    RAG_REQUESTED = "rag.requested"
    RAG_COMPLETED = "rag.completed"

    RENTER_ROUTING_REQUESTED = "renter.routing_requested"
    RENTER_SELECTED = "renter.selected"

    VALIDATION_REQUESTED = "validation.requested"
    VALIDATION_COMPLETED = "validation.completed"
    EVALUATION_RECORDED = "evaluation.recorded"
    SIMULATION_REQUESTED = "simulation.requested"
    SIMULATION_COMPLETED = "simulation.completed"
    TELEMETRY_RECORDED = "telemetry.recorded"
    RECEIPT_RECORDED = "receipt.recorded"
    MEMORY_PROMOTION_REQUESTED = "memory.promotion_requested"
    MEMORY_PROMOTION_COMPLETED = "memory.promotion_completed"


@dataclass(frozen=True, slots=True)
class EventEnvelope:
    """Versioned event wrapper used as the shared event-bus spine."""

    event_type: FrameworkEvent
    run_id: str
    payload: dict[str, object] = field(default_factory=dict)
    schema_version: str = "v1"
    emitted_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    event_id: str = field(default_factory=lambda: str(uuid4()))


class EventSubscriber(Protocol):
    """Protocol implemented by framework components that react to events."""

    def __call__(self, event: EventEnvelope) -> None:
        """Handle an emitted event."""


class EventBus(Protocol):
    """Publish/subscribe contract that keeps frameworks decoupled."""

    def publish(self, event: EventEnvelope) -> None:
        """Publish an event to all subscribers."""

    def subscribe(self, event_type: FrameworkEvent, subscriber: EventSubscriber) -> None:
        """Register a subscriber for a specific event type."""


class InMemoryEventBus:
    """Minimal in-memory event bus suitable for local scaffolding and tests."""

    def __init__(self) -> None:
        self._subscribers: dict[FrameworkEvent, list[EventSubscriber]] = {}
        self._history: list[EventEnvelope] = []

    @property
    def history(self) -> tuple[EventEnvelope, ...]:
        """Expose published events for inspection and replay experiments."""

        return tuple(self._history)

    def publish(self, event: EventEnvelope) -> None:
        self._history.append(event)
        for subscriber in self._subscribers.get(event.event_type, []):
            subscriber(event)

    def subscribe(self, event_type: FrameworkEvent, subscriber: EventSubscriber) -> None:
        self._subscribers.setdefault(event_type, []).append(subscriber)
