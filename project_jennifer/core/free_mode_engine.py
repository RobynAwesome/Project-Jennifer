"""Free Mode engine scaffold for orchestrating supporting frameworks."""

from __future__ import annotations

from dataclasses import dataclass, field

from project_jennifer.contracts import EventBus, EventEnvelope, FrameworkEvent, RunArtifact, RunContext
from project_jennifer.plugins import PluginRegistry


@dataclass(frozen=True, slots=True)
class FreeModeRequest:
    """Input passed into the Free Mode engine."""

    prompt: str
    actor_id: str | None = None
    metadata: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class FreeModeResult:
    """Minimal engine response that preserves artifacts and status."""

    status: str
    summary: str
    artifacts: tuple[RunArtifact, ...] = ()


class FreeModeEngine:
    """Main orchestration point for Free Mode plus supporting frameworks.

    The class intentionally stays light: it documents the main execution seam,
    emits lifecycle events, and leaves framework-specific behavior to plugins
    and adapters added in later milestones.
    """

    def __init__(self, *, event_bus: EventBus, plugins: PluginRegistry | None = None) -> None:
        self._event_bus = event_bus
        self._plugins = plugins or PluginRegistry()

    @property
    def plugins(self) -> PluginRegistry:
        """Access the registered framework plugins."""

        return self._plugins

    def run(self, context: RunContext, request: FreeModeRequest) -> FreeModeResult:
        """Emit the baseline lifecycle and return a placeholder result.

        Future implementations will coordinate validation, evaluation,
        simulation, telemetry, and world-state transitions here.
        """

        self._event_bus.publish(
            EventEnvelope(
                event_type=FrameworkEvent.RUN_STARTED,
                run_id=context.run_id,
                payload={"objective": context.objective, "prompt": request.prompt},
            )
        )

        self._event_bus.publish(
            EventEnvelope(
                event_type=FrameworkEvent.RUN_COMPLETED,
                run_id=context.run_id,
                payload={"status": "scaffolded"},
            )
        )

        return FreeModeResult(
            status="scaffolded",
            summary="Free Mode foundation established; framework plugins can now be layered in.",
        )
