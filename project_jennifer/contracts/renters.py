"""Provider-neutral contracts for Project Jennifer stateless renters."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from typing import Mapping


class ExecutionMode(StrEnum):
    LOCAL = "local"
    CLOUD = "cloud"
    HYBRID = "hybrid"


class GovernanceRequirement(StrEnum):
    REQUIRED = "required"
    OPTIONAL = "optional"
    CONDITIONAL = "conditional"
    GATED = "gated"
    DISABLED = "disabled"


@dataclass(frozen=True, slots=True)
class CapabilitySet:
    reasoning: bool = False
    coding: bool = False
    multimodal: bool = False
    tool_use: bool = False
    structured_output: bool = False
    retrieval: bool = False
    long_context: bool = False

    def satisfies(self, required: "CapabilitySet") -> bool:
        for field_name in self.__dataclass_fields__:  # type: ignore[attr-defined]
            if getattr(required, field_name) and not getattr(self, field_name):
                return False
        return True


@dataclass(frozen=True, slots=True)
class GovernanceProfile:
    cag: GovernanceRequirement = GovernanceRequirement.REQUIRED
    rag: GovernanceRequirement = GovernanceRequirement.OPTIONAL
    rivm: GovernanceRequirement = GovernanceRequirement.CONDITIONAL
    receipts: GovernanceRequirement = GovernanceRequirement.REQUIRED
    memory_write: GovernanceRequirement = GovernanceRequirement.GATED


@dataclass(frozen=True, slots=True)
class RenterConstraints:
    data_egress: str = "unknown"
    offline: bool = False
    private_lane_allowed: bool = False
    notes: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class RenterBenchmarks:
    extraction: float | None = None
    planning: float | None = None
    retrieval_grounding: float | None = None
    coding: float | None = None
    communication_attention: float | None = None

    def score_for(self, names: tuple[str, ...]) -> float:
        values: list[float] = []
        for name in names:
            value = getattr(self, name, None)
            if isinstance(value, (int, float)):
                values.append(float(value))
        return sum(values) / len(values) if values else 0.0


@dataclass(frozen=True, slots=True)
class RenterCapabilityManifest:
    provider: str
    model_id: str
    execution: ExecutionMode
    capabilities: CapabilitySet = field(default_factory=CapabilitySet)
    governance: GovernanceProfile = field(default_factory=GovernanceProfile)
    constraints: RenterConstraints = field(default_factory=RenterConstraints)
    benchmarks: RenterBenchmarks = field(default_factory=RenterBenchmarks)
    metadata: dict[str, object] = field(default_factory=dict)

    @property
    def renter_id(self) -> str:
        return f"{self.provider}:{self.model_id}"

    @classmethod
    def from_mapping(cls, payload: Mapping[str, object]) -> "RenterCapabilityManifest":
        """Build a manifest from parsed JSON/YAML without depending on a YAML library."""

        def mapping(name: str) -> Mapping[str, object]:
            value = payload.get(name, {})
            return value if isinstance(value, Mapping) else {}

        capabilities_payload = mapping("capabilities")
        governance_payload = mapping("governance")
        constraints_payload = mapping("constraints")
        benchmarks_payload = mapping("benchmarks")

        def bool_value(source: Mapping[str, object], key: str, default: bool = False) -> bool:
            value = source.get(key, default)
            return bool(value) if isinstance(value, bool) else default

        def float_or_none(source: Mapping[str, object], key: str) -> float | None:
            value = source.get(key)
            return float(value) if isinstance(value, (int, float)) else None

        def governance_value(key: str, default: GovernanceRequirement) -> GovernanceRequirement:
            value = governance_payload.get(key, default.value)
            try:
                return GovernanceRequirement(str(value))
            except ValueError:
                return default

        execution_raw = str(payload.get("execution", ExecutionMode.CLOUD.value))
        try:
            execution = ExecutionMode(execution_raw)
        except ValueError:
            execution = ExecutionMode.CLOUD

        notes_value = constraints_payload.get("notes", ())
        notes = tuple(str(item) for item in notes_value) if isinstance(notes_value, (list, tuple)) else ()

        return cls(
            provider=str(payload.get("provider", "unknown")),
            model_id=str(payload.get("model_id", "unknown")),
            execution=execution,
            capabilities=CapabilitySet(
                reasoning=bool_value(capabilities_payload, "reasoning"),
                coding=bool_value(capabilities_payload, "coding"),
                multimodal=bool_value(capabilities_payload, "multimodal"),
                tool_use=bool_value(capabilities_payload, "tool_use"),
                structured_output=bool_value(capabilities_payload, "structured_output"),
                retrieval=bool_value(capabilities_payload, "retrieval"),
                long_context=bool_value(capabilities_payload, "long_context"),
            ),
            governance=GovernanceProfile(
                cag=governance_value("cag", GovernanceRequirement.REQUIRED),
                rag=governance_value("rag", GovernanceRequirement.OPTIONAL),
                rivm=governance_value("rivm", GovernanceRequirement.CONDITIONAL),
                receipts=governance_value("receipts", GovernanceRequirement.REQUIRED),
                memory_write=governance_value("memory_write", GovernanceRequirement.GATED),
            ),
            constraints=RenterConstraints(
                data_egress=str(constraints_payload.get("data_egress", "unknown")),
                offline=bool_value(constraints_payload, "offline"),
                private_lane_allowed=bool_value(constraints_payload, "private_lane_allowed"),
                notes=notes,
            ),
            benchmarks=RenterBenchmarks(
                extraction=float_or_none(benchmarks_payload, "extraction"),
                planning=float_or_none(benchmarks_payload, "planning"),
                retrieval_grounding=float_or_none(benchmarks_payload, "retrieval_grounding"),
                coding=float_or_none(benchmarks_payload, "coding"),
                communication_attention=float_or_none(benchmarks_payload, "communication_attention"),
            ),
            metadata=dict(mapping("metadata")),
        )


@dataclass(frozen=True, slots=True)
class RenterTaskRequirements:
    capabilities: CapabilitySet = field(default_factory=CapabilitySet)
    benchmark_dimensions: tuple[str, ...] = ()
    allowlist: tuple[str, ...] = ()
    explicit_renter_id: str | None = None
    require_offline: bool = False
    metadata: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class RenterSelection:
    renter: RenterCapabilityManifest
    reason: str
    score: float
    explicit_override: bool = False
