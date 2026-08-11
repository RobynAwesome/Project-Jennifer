"""Deterministic benchmark harness for CAG and governed RAG.

These benchmarks validate governance semantics independently of any vendor model.
They become the stable baseline that stateless renter adapters must preserve.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from project_jennifer.attention import CommunicationAttentionGovernance
from project_jennifer.contracts import (
    AttentionCandidate,
    CAGEvent,
    InterruptionGate,
    RetrievalDisposition,
    RetrievalQuery,
)
from project_jennifer.retrieval import GovernedRAG


@dataclass(frozen=True, slots=True)
class BenchmarkAssertion:
    name: str
    passed: bool
    detail: str


@dataclass(frozen=True, slots=True)
class GovernanceBenchmarkResult:
    scenario_id: str
    assertions: tuple[BenchmarkAssertion, ...]

    @property
    def passed(self) -> bool:
        return all(assertion.passed for assertion in self.assertions)

    @property
    def score(self) -> float:
        if not self.assertions:
            return 0.0
        return sum(1 for assertion in self.assertions if assertion.passed) / len(self.assertions)


@dataclass(frozen=True, slots=True)
class GovernanceBenchmarkReport:
    suite_id: str
    results: tuple[GovernanceBenchmarkResult, ...]
    metadata: dict[str, object] = field(default_factory=dict)

    @property
    def passed(self) -> bool:
        return bool(self.results) and all(result.passed for result in self.results)

    @property
    def score(self) -> float:
        if not self.results:
            return 0.0
        return sum(result.score for result in self.results) / len(self.results)


@dataclass(frozen=True, slots=True)
class CAGBenchmarkScenario:
    scenario_id: str
    event: CAGEvent
    candidates: tuple[AttentionCandidate, ...]
    expected_gate: InterruptionGate
    expected_admitted_contains: tuple[str, ...] = ()
    expected_suppressed_contains: tuple[str, ...] = ()


@dataclass(frozen=True, slots=True)
class RAGBenchmarkScenario:
    scenario_id: str
    query: RetrievalQuery
    expected_evidence_ids: tuple[str, ...] = ()
    expected_suppressed_ids: tuple[str, ...] = ()
    expected_suppression_reasons: tuple[RetrievalDisposition, ...] = ()
    require_grounding: bool = True
    cag_event: CAGEvent | None = None


def run_cag_benchmark(
    cag: CommunicationAttentionGovernance,
    scenarios: tuple[CAGBenchmarkScenario, ...],
    *,
    suite_id: str = "cag-communication-attention-v1",
) -> GovernanceBenchmarkReport:
    results: list[GovernanceBenchmarkResult] = []

    for scenario in scenarios:
        assessment = cag.gate_candidates(scenario.event, scenario.candidates)
        admitted_text = tuple(candidate.content for candidate in assessment.admitted)
        suppressed_text = tuple(candidate.content for candidate in assessment.suppressed)

        assertions: list[BenchmarkAssertion] = [
            BenchmarkAssertion(
                name="interruption-gate",
                passed=assessment.gate == scenario.expected_gate,
                detail=f"expected={scenario.expected_gate.value} actual={assessment.gate.value}",
            )
        ]

        for fragment in scenario.expected_admitted_contains:
            passed = any(fragment in content for content in admitted_text)
            assertions.append(
                BenchmarkAssertion(
                    name=f"admit:{fragment}",
                    passed=passed,
                    detail=f"fragment {'admitted' if passed else 'missing'}: {fragment}",
                )
            )

        for fragment in scenario.expected_suppressed_contains:
            passed = any(fragment in content for content in suppressed_text)
            assertions.append(
                BenchmarkAssertion(
                    name=f"suppress:{fragment}",
                    passed=passed,
                    detail=f"fragment {'suppressed' if passed else 'not suppressed'}: {fragment}",
                )
            )

        results.append(
            GovernanceBenchmarkResult(
                scenario_id=scenario.scenario_id,
                assertions=tuple(assertions),
            )
        )

    return GovernanceBenchmarkReport(suite_id=suite_id, results=tuple(results))


def run_rag_benchmark(
    rag: GovernedRAG,
    scenarios: tuple[RAGBenchmarkScenario, ...],
    *,
    suite_id: str = "rag-retrieval-grounding-v1",
) -> GovernanceBenchmarkReport:
    results: list[GovernanceBenchmarkResult] = []

    for scenario in scenarios:
        bundle = rag.retrieve(scenario.query, cag_event=scenario.cag_event)
        evidence_ids = tuple(item.evidence_id for item in bundle.evidence)
        suppressed_ids = tuple(item_id for item_id, _ in bundle.suppressed)
        suppression_reasons = tuple(disposition for _, disposition in bundle.suppressed)

        assertions: list[BenchmarkAssertion] = [
            BenchmarkAssertion(
                name="grounding",
                passed=(bundle.grounding_complete if scenario.require_grounding else True),
                detail=f"grounding_complete={bundle.grounding_complete}",
            ),
            BenchmarkAssertion(
                name="evidence-order",
                passed=evidence_ids == scenario.expected_evidence_ids,
                detail=f"expected={scenario.expected_evidence_ids} actual={evidence_ids}",
            ),
        ]

        for evidence_id in scenario.expected_suppressed_ids:
            passed = evidence_id in suppressed_ids
            assertions.append(
                BenchmarkAssertion(
                    name=f"suppressed-id:{evidence_id}",
                    passed=passed,
                    detail=f"evidence id {'suppressed' if passed else 'not suppressed'}: {evidence_id}",
                )
            )

        for disposition in scenario.expected_suppression_reasons:
            passed = disposition in suppression_reasons
            assertions.append(
                BenchmarkAssertion(
                    name=f"suppression:{disposition.value}",
                    passed=passed,
                    detail=f"suppression reason {'present' if passed else 'missing'}: {disposition.value}",
                )
            )

        results.append(
            GovernanceBenchmarkResult(
                scenario_id=scenario.scenario_id,
                assertions=tuple(assertions),
            )
        )

    return GovernanceBenchmarkReport(suite_id=suite_id, results=tuple(results))
