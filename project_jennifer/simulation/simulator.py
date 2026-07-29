"""Simulation framework contracts for world-state and adversarial exercises."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from project_jennifer.contracts import RunArtifact, RunContext


@dataclass(frozen=True, slots=True)
class SimulationScenario:
    """Replayable simulation input for stress, balance, or adversarial testing."""

    run: RunContext
    scenario_id: str
    parameters: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class SimulationResult:
    """Outcome of a simulator execution."""

    simulator_name: str
    status: str
    artifacts: tuple[RunArtifact, ...] = ()


class Simulator(Protocol):
    """Interface for pluggable simulators."""

    name: str

    def simulate(self, scenario: SimulationScenario) -> SimulationResult:
        """Run a simulation scenario and return its result."""
