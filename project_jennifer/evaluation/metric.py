"""Evaluation framework contracts for regression tracking and offline scoring."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from project_jennifer.contracts import RunContext


@dataclass(frozen=True, slots=True)
class EvaluationContext:
    """Offline evaluation inputs linked to a run or benchmark scenario."""

    run: RunContext
    candidate_output: str
    reference_artifacts: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class MetricResult:
    """Score emitted by a deterministic or model-judge metric."""

    metric_name: str
    value: float
    rationale: str = ""


class Metric(Protocol):
    """Interface for evaluation metrics."""

    name: str

    def score(self, context: EvaluationContext) -> MetricResult:
        """Score the supplied evaluation context."""
