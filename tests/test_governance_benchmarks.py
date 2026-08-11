from __future__ import annotations

import unittest

from project_jennifer.attention import CommunicationAttentionGovernance
from project_jennifer.contracts import (
    AttentionCandidate,
    AuthorityTier,
    CAGEvent,
    ConfidenceScope,
    Ecosystem,
    EvidenceItem,
    InterruptionGate,
    RelationalLane,
    RetrievalDisposition,
    RetrievalQuery,
    Temperature,
    UserIntent,
)
from project_jennifer.evaluation import (
    CAGBenchmarkScenario,
    RAGBenchmarkScenario,
    run_cag_benchmark,
    run_rag_benchmark,
)
from project_jennifer.retrieval import GovernedRAG, InMemoryRetrievalSource


class GovernanceBenchmarkTests(unittest.TestCase):
    def test_cag_benchmark_preserves_event_scope_and_relevance(self) -> None:
        cag = CommunicationAttentionGovernance()
        event = CAGEvent(
            signal="Fix the repeated artifact-authority failure.",
            subject="artifact authority",
            ecosystem=Ecosystem.WORK,
            intent=UserIntent.VALIDATE,
            authority="user",
            relational_lane=RelationalLane.COLLEAGUE,
            temperature=Temperature.HIGH,
            cause="artifact-authority violation",
            confidence_scope=ConfidenceScope.THIS_EVENT,
            attention_target="repair artifact authority",
            active_participants=("user", "Forge"),
        )
        scenarios = (
            CAGBenchmarkScenario(
                scenario_id="event-not-personality",
                event=event,
                candidates=(
                    AttentionCandidate(
                        content="The current artifact violated the declared authority source.",
                        is_true=True,
                        relevant_now=True,
                        authority="repository receipt",
                    ),
                    AttentionCandidate(
                        content="A third party unrelated to this incident exists elsewhere.",
                        is_true=True,
                        relevant_now=False,
                        concerns_third_party=True,
                    ),
                ),
                expected_gate=InterruptionGate.OPEN,
                expected_admitted_contains=("current artifact violated",),
                expected_suppressed_contains=("third party unrelated",),
            ),
            CAGBenchmarkScenario(
                scenario_id="private-context-cross-lane",
                event=event,
                candidates=(
                    AttentionCandidate(
                        content="Private relational memory unrelated to the work incident.",
                        is_true=True,
                        relevant_now=True,
                        privacy_lane=RelationalLane.PRIVATE,
                    ),
                ),
                expected_gate=InterruptionGate.REQUIRES_AUTHORIZATION,
                expected_suppressed_contains=("Private relational memory",),
            ),
        )

        report = run_cag_benchmark(cag, scenarios)
        self.assertTrue(report.passed)
        self.assertEqual(report.score, 1.0)
        self.assertEqual(event.confidence_scope, ConfidenceScope.THIS_EVENT)

    def test_rag_benchmark_preserves_authority_dedup_and_privacy(self) -> None:
        cag = CommunicationAttentionGovernance()
        postgres = InMemoryRetrievalSource(
            source_id="postgres-authority",
            authority_tier=AuthorityTier.POSTGRES_GOVERNED_AUTHORITY,
            authority_scope="relationship-state",
            items=(
                EvidenceItem(
                    evidence_id="pg-alpha",
                    content="alpha is the governed relationship state",
                    source_id="postgres-authority",
                    source_uri="postgres://relationship/alpha",
                    authority_tier=AuthorityTier.POSTGRES_GOVERNED_AUTHORITY,
                    authority_scope="relationship-state",
                    score=1.0,
                ),
            ),
        )
        mongo = InMemoryRetrievalSource(
            source_id="mongo-adaptive",
            authority_tier=AuthorityTier.GSMB_MONGODB_ADAPTIVE_CONTEXT,
            authority_scope="adaptive-context",
            items=(
                EvidenceItem(
                    evidence_id="mongo-alpha",
                    content="alpha is the governed relationship state",
                    source_id="mongo-adaptive",
                    source_uri="mongodb://gsmb/alpha",
                    authority_tier=AuthorityTier.GSMB_MONGODB_ADAPTIVE_CONTEXT,
                    authority_scope="adaptive-context",
                    score=0.9,
                ),
            ),
        )
        external = InMemoryRetrievalSource(
            source_id="external-source",
            authority_tier=AuthorityTier.CONNECTED_EXTERNAL,
            authority_scope="external-context",
            items=(
                EvidenceItem(
                    evidence_id="external-alpha",
                    content="alpha external observation",
                    source_id="external-source",
                    source_uri="https://example.invalid/alpha",
                    authority_tier=AuthorityTier.CONNECTED_EXTERNAL,
                    authority_scope="external-context",
                    score=0.8,
                ),
            ),
        )
        private = InMemoryRetrievalSource(
            source_id="private-source",
            authority_tier=AuthorityTier.USER_DECLARED_AUTHORITY,
            authority_scope="private-context",
            source_lane=RelationalLane.PRIVATE,
            items=(
                EvidenceItem(
                    evidence_id="private-alpha",
                    content="alpha private context",
                    source_id="private-source",
                    source_uri="private://alpha",
                    authority_tier=AuthorityTier.USER_DECLARED_AUTHORITY,
                    authority_scope="private-context",
                    source_lane=RelationalLane.PRIVATE,
                    score=1.0,
                ),
            ),
        )
        rag = GovernedRAG(sources=(external, private, mongo, postgres), cag=cag)
        query = RetrievalQuery(
            query="alpha",
            subject="relationship state",
            target_lane=RelationalLane.RESEARCH,
        )
        cag_event = CAGEvent(
            signal="Research the governed alpha state.",
            subject="relationship state",
            ecosystem=Ecosystem.RESEARCH,
            intent=UserIntent.INVESTIGATE,
            relational_lane=RelationalLane.RESEARCH,
            attention_target="governed alpha state",
        )
        scenarios = (
            RAGBenchmarkScenario(
                scenario_id="authority-dedup-privacy",
                query=query,
                expected_evidence_ids=("pg-alpha", "external-alpha"),
                expected_suppressed_ids=("mongo-alpha", "private-source"),
                expected_suppression_reasons=(
                    RetrievalDisposition.DEDUPLICATED,
                    RetrievalDisposition.SUPPRESSED_BY_PRIVACY,
                ),
                cag_event=cag_event,
            ),
        )

        report = run_rag_benchmark(rag, scenarios)
        self.assertTrue(report.passed)
        self.assertEqual(report.score, 1.0)


if __name__ == "__main__":
    unittest.main()
