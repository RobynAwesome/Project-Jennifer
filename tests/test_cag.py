from __future__ import annotations

import unittest

from project_jennifer.attention import CommunicationAttentionGovernance
from project_jennifer.contracts import (
    AttentionCandidate,
    CAGEvent,
    ConfidenceScope,
    Ecosystem,
    InterruptionGate,
    RelationalLane,
    UserIntent,
)


class CommunicationAttentionGovernanceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.cag = CommunicationAttentionGovernance()

    def test_truthful_but_irrelevant_context_is_suppressed(self) -> None:
        event = CAGEvent(
            signal="Fix the build artifact authority failure",
            subject="artifact-authority violation",
            ecosystem=Ecosystem.WORK,
            intent=UserIntent.EXECUTE,
            relational_lane=RelationalLane.COLLEAGUE,
            attention_target="repair the build",
        )
        candidate = AttentionCandidate(
            content="A true but unrelated fact",
            is_true=True,
            relevant_now=False,
        )

        assessment = self.cag.gate_candidates(event, (candidate,))

        self.assertEqual(assessment.gate, InterruptionGate.CLOSED)
        self.assertEqual(assessment.admitted, ())
        self.assertEqual(assessment.suppressed, (candidate,))

    def test_unrelated_third_party_is_not_injected_into_private_frame(self) -> None:
        event = CAGEvent(
            signal="Stay with the active private conversation",
            subject="presence",
            ecosystem=Ecosystem.INTIMATE,
            intent=UserIntent.COMFORT,
            relational_lane=RelationalLane.PRIVATE,
            active_participants=("user", "forge"),
            metadata={"third_party_relevance": False},
        )
        candidate = AttentionCandidate(
            content="Unrelated third-party context",
            is_true=True,
            relevant_now=True,
            concerns_third_party=True,
        )

        assessment = self.cag.gate_candidates(event, (candidate,))

        self.assertEqual(assessment.gate, InterruptionGate.CLOSED)
        self.assertEqual(len(assessment.suppressed), 1)

    def test_private_context_requires_authorization_to_enter_work_lane(self) -> None:
        event = CAGEvent(
            signal="Prepare work report",
            subject="work report",
            ecosystem=Ecosystem.WORK,
            intent=UserIntent.EXECUTE,
            relational_lane=RelationalLane.COLLEAGUE,
        )
        candidate = AttentionCandidate(
            content="private context",
            relevant_now=True,
            privacy_lane=RelationalLane.PRIVATE,
        )

        assessment = self.cag.gate_candidates(event, (candidate,))

        self.assertEqual(assessment.gate, InterruptionGate.REQUIRES_AUTHORIZATION)

    def test_event_scope_does_not_become_general_trait(self) -> None:
        event = CAGEvent(
            signal="User is angry about a repeated engineering failure",
            subject="artifact-authority violation",
            confidence_scope=ConfidenceScope.THIS_EVENT,
        )

        assessment = self.cag.pre_inference(event)

        self.assertEqual(assessment.metadata["confidence_scope"], "this-event")


if __name__ == "__main__":
    unittest.main()
