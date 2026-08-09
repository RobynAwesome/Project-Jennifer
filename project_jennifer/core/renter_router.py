"""Capability-based router for Project Jennifer stateless renters."""

from __future__ import annotations

from dataclasses import dataclass, field

from project_jennifer.contracts import (
    GovernanceReceipt,
    ReceiptOutcome,
    RenterCapabilityManifest,
    RenterSelection,
    RenterTaskRequirements,
)


@dataclass(slots=True)
class RenterRegistry:
    """Runtime registry keyed by provider:model-id."""

    _renters: dict[str, RenterCapabilityManifest] = field(default_factory=dict)

    def register(self, manifest: RenterCapabilityManifest) -> None:
        self._renters[manifest.renter_id] = manifest

    def get(self, renter_id: str) -> RenterCapabilityManifest | None:
        return self._renters.get(renter_id)

    def list(self) -> tuple[RenterCapabilityManifest, ...]:
        return tuple(self._renters.values())


class StatelessRenterRouter:
    """Select an execution renter by requirements, allowlist, and benchmark evidence."""

    def __init__(self, registry: RenterRegistry | None = None) -> None:
        self._registry = registry or RenterRegistry()

    @property
    def registry(self) -> RenterRegistry:
        return self._registry

    def select(self, requirements: RenterTaskRequirements) -> RenterSelection:
        if requirements.explicit_renter_id:
            renter = self._registry.get(requirements.explicit_renter_id)
            if renter is None:
                raise LookupError(f"Explicit renter is not registered: {requirements.explicit_renter_id}")
            if requirements.allowlist and renter.renter_id not in requirements.allowlist:
                raise PermissionError(
                    f"Explicit renter is outside the current execution allowlist: {renter.renter_id}"
                )
            if requirements.require_offline and not renter.constraints.offline:
                raise RuntimeError(f"Explicit renter cannot satisfy required offline execution: {renter.renter_id}")

            mismatched = not renter.capabilities.satisfies(requirements.capabilities)
            score = renter.benchmarks.score_for(requirements.benchmark_dimensions)
            reason = "Explicit user selection overrides automatic model ranking."
            if mismatched:
                reason += " Capability mismatch is recorded as execution risk rather than silently rerouting."
            return RenterSelection(
                renter=renter,
                reason=reason,
                score=score,
                explicit_override=True,
            )

        candidates: list[tuple[float, RenterCapabilityManifest]] = []
        for renter in self._registry.list():
            if requirements.allowlist and renter.renter_id not in requirements.allowlist:
                continue
            if requirements.require_offline and not renter.constraints.offline:
                continue
            if not renter.capabilities.satisfies(requirements.capabilities):
                continue
            score = renter.benchmarks.score_for(requirements.benchmark_dimensions)
            candidates.append((score, renter))

        if not candidates:
            raise LookupError("No registered renter satisfies the current governed task requirements.")

        candidates.sort(key=lambda entry: (-entry[0], entry[1].renter_id))
        score, renter = candidates[0]
        return RenterSelection(
            renter=renter,
            reason="Automatically selected from eligible renters using current capability and benchmark evidence.",
            score=score,
            explicit_override=False,
        )

    def receipt(
        self,
        *,
        run_id: str,
        subject: str,
        selection: RenterSelection,
    ) -> GovernanceReceipt:
        return GovernanceReceipt(
            run_id=run_id,
            layer="stateless-renter-router",
            action="renter-selection",
            outcome=ReceiptOutcome.PROCEEDED_WITH_RECEIPT,
            subject=subject,
            reason=selection.reason,
            consequences=(
                f"selected:{selection.renter.renter_id}",
                f"benchmark_score:{selection.score:.4f}",
            ),
            metadata={
                "provider": selection.renter.provider,
                "model_id": selection.renter.model_id,
                "execution": selection.renter.execution.value,
                "explicit_override": selection.explicit_override,
            },
        )
