"""Run artifact contracts that emphasize replayability and reproducibility."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass(frozen=True, slots=True)
class ArtifactPointer:
    """Reference to a persisted run artifact."""

    name: str
    uri: str
    media_type: str = "application/json"


@dataclass(frozen=True, slots=True)
class ReproducibilityManifest:
    """Minimal manifest needed to replay or compare a framework run."""

    seed: int | None = None
    scenario_id: str | None = None
    dataset_version: str | None = None
    runtime_version: str = "v0"
    contract_version: str = "v1"
    notes: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class RunArtifact:
    """Single artifact produced by the engine or a supporting framework."""

    framework: str
    kind: str
    pointer: ArtifactPointer
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(frozen=True, slots=True)
class RunContext:
    """Shared execution identity carried across engine, validators, and metrics."""

    run_id: str
    objective: str
    manifest: ReproducibilityManifest = field(default_factory=ReproducibilityManifest)
    tags: tuple[str, ...] = ()
