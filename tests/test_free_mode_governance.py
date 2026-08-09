from __future__ import annotations

import unittest

from project_jennifer.attention import CommunicationAttentionGovernance
from project_jennifer.contracts import (
    AuthorityTier,
    CapabilitySet,
    EvidenceItem,
    ExecutionMode,
    FrameworkEvent,
    InMemoryEventBus,
    PreferencePromotionCandidate,
    RelationalLane,
    RenterBenchmarks,
    RenterCapabilityManifest,
    RenterConstraints,
    RenterTaskRequirements,
    RunContext,
)
from project_jennifer.core import FreeModeEngine, FreeModeRequest, RenterRegistry, StatelessRenterRouter
from project_jennifer.retrieval import GovernedRAG, InMemoryRetrievalSource
from project_jennifer.telemetry import InMemoryReceiptSink


class FreeModeGovernanceIntegrationTests(unittest.TestCase):
    def _engine(self, source_lane: RelationalLane = RelationalLane.OTHER) -> tuple[FreeModeEngine, InMemoryEventBus]:
        event_bus = InMemoryEventBus()
        cag = CommunicationAttentionGovernance()
        evidence = EvidenceItem(
            evidence_id="e-1",
            content="alpha governed evidence",
            source_id="source",
            source_uri="local://source/e-1",
            authority_tier=AuthorityTier.LOCAL_KNOWLEDGE,
            authority_scope="test",
            score=0.9,
            source_lane=source_lane,
        )
        source = InMemoryRetrievalSource(
            source_id="source",
            authority_tier=AuthorityTier.LOCAL_KNOWLEDGE,
            authority_scope="test",
            source_lane=source_lane,
            items=(evidence,),
        )
        rag = GovernedRAG(sources=(source,), cag=cag)

        registry = RenterRegistry()
        registry.register(
            RenterCapabilityManifest(
                provider="test",
                model_id="renter-1",
                execution=ExecutionMode.LOCAL,
                capabilities=CapabilitySet(reasoning=True, structured_output=True, retrieval=True),
                constraints=RenterConstraints(data_egress="none", offline=True),
                benchmarks=RenterBenchmarks(planning=0.8, retrieval_grounding=0.9),
            )
        )
        router = StatelessRenterRouter(registry)

        engine = FreeModeEngine(
            event_bus=event_bus,
            cag=cag,
            rag=rag,
            renter_router=router,
            receipt_sink=InMemoryReceiptSink(),
        )
        return engine, event_bus

    def test_free_mode_orchestrates_cag_rag_renter_and_receipts(self) -> None:
        engine, event_bus = self._engine()
        result = engine.run(
            RunContext(run_id="run-1", objective="validate alpha"),
            FreeModeRequest(
                prompt="alpha",
                retrieval_required=True,
                metadata={
                    "subject": "alpha",
                    "ecosystem": "research",
                    "relational_lane": "research",
                },
                renter_requirements=RenterTaskRequirements(
                    capabilities=CapabilitySet(reasoning=True, retrieval=True),
                    benchmark_dimensions=("retrieval_grounding",),
                ),
            ),
        )

        self.assertEqual(result.status, "governed-scaffolded")
        self.assertIsNotNone(result.evidence_bundle)
        self.assertEqual(len(result.evidence_bundle.evidence), 1)  # type: ignore[union-attr]
        self.assertEqual(result.renter_selection.renter.renter_id, "test:renter-1")  # type: ignore[union-attr]
        self.assertGreaterEqual(len(result.receipts), 4)

        event_types = tuple(event.event_type for event in event_bus.history)
        self.assertIn(FrameworkEvent.CAG_PRE_INFERENCE, event_types)
        self.assertIn(FrameworkEvent.RAG_COMPLETED, event_types)
        self.assertIn(FrameworkEvent.RENTER_SELECTED, event_types)
        self.assertIn(FrameworkEvent.RECEIPT_RECORDED, event_types)
        self.assertEqual(event_types[-1], FrameworkEvent.RUN_COMPLETED)

    def test_private_rag_source_is_stopped_from_crossing_into_work_lane(self) -> None:
        engine, _ = self._engine(source_lane=RelationalLane.PRIVATE)
        result = engine.run(
            RunContext(run_id="run-private", objective="work task"),
            FreeModeRequest(
                prompt="alpha",
                retrieval_required=True,
                metadata={
                    "subject": "work",
                    "ecosystem": "work",
                    "relational_lane": "colleague",
                    "explicit_cross_lane_authorization": False,
                },
            ),
        )

        self.assertEqual(result.status, "governed-with-boundary")
        self.assertEqual(result.evidence_bundle.evidence, ())  # type: ignore[union-attr]
        self.assertTrue(result.guardrails.hard_stop)  # type: ignore[union-attr]

    def test_training_candidate_waits_for_human_promotion_without_erasing_run(self) -> None:
        engine, _ = self._engine()
        candidate = PreferencePromotionCandidate(
            prompt_id="p-1",
            chosen="good",
            rejected="bad",
            source_receipt_ids=("source-receipt",),
            rationale="human preference candidate",
            human_validated=False,
        )

        result = engine.run(
            RunContext(run_id="run-training", objective="feedback"),
            FreeModeRequest(prompt="feedback", preference_candidate=candidate),
        )

        self.assertEqual(result.status, "governed-awaiting-human-promotion")
        self.assertFalse(result.guardrails.hard_stop)  # type: ignore[union-attr]
        self.assertTrue(result.guardrails.human_gate_required)  # type: ignore[union-attr]


if __name__ == "__main__":
    unittest.main()
