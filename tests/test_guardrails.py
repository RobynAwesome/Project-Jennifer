from __future__ import annotations

import unittest

from project_jennifer.contracts import PreferencePromotionCandidate
from project_jennifer.validation import GuardrailStatus, LayeredGuardrailChain


class LayeredGuardrailChainTests(unittest.TestCase):
    def test_unvalidated_training_candidate_requires_human_without_hard_stop(self) -> None:
        candidate = PreferencePromotionCandidate(
            prompt_id="p-1",
            chosen="chosen answer",
            rejected="rejected answer",
            source_receipt_ids=("r-1",),
            rationale="user correction",
            human_validated=False,
        )

        report = LayeredGuardrailChain().evaluate(training_candidate=candidate)

        self.assertFalse(report.hard_stop)
        self.assertTrue(report.human_gate_required)
        self.assertTrue(any(f.status == GuardrailStatus.REQUIRE_HUMAN for f in report.findings))

    def test_tool_permission_is_an_immutable_boundary(self) -> None:
        report = LayeredGuardrailChain().evaluate(tool_permission_granted=False)

        self.assertTrue(report.hard_stop)


if __name__ == "__main__":
    unittest.main()
