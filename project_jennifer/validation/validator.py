"""Validation framework contracts for correctness, safety, and integrity checks."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from project_jennifer.contracts import RunContext


@dataclass(frozen=True, slots=True)
class ValidationContext:
    """Inputs required to validate a Free Mode turn or background action."""

    run: RunContext
    subject: str
    evidence: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class ValidationResult:
    """Outcome from a validation pass."""

    passed: bool
    validator_name: str
    reasons: tuple[str, ...] = ()
    score: float | None = None


class Validator(Protocol):
    """Interface for pluggable validators."""

    name: str

    def validate(self, context: ValidationContext) -> ValidationResult:
        """Return a validation result for the supplied context."""
