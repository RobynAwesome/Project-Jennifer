from __future__ import annotations

import unittest

from project_jennifer.adapters import (
    RenterAdapterRegistry,
    RenterExecutionRequest,
    RenterExecutionResult,
)


class EchoAdapter:
    renter_id = "local:test-runtime"

    def execute(self, request: RenterExecutionRequest) -> RenterExecutionResult:
        return RenterExecutionResult(
            renter_id=self.renter_id,
            output=f"executed:{request.prompt}",
            evidence_ids_used=request.evidence_ids,
            metadata={"bounded": True},
        )


class RenterAdapterTests(unittest.TestCase):
    def test_exact_runtime_adapter_registration_and_execution(self) -> None:
        registry = RenterAdapterRegistry()
        registry.register(EchoAdapter())
        adapter = registry.require("local:test-runtime")
        result = adapter.execute(
            RenterExecutionRequest(
                run_id="run-adapter",
                renter_id="local:test-runtime",
                prompt="preserve CAG semantics",
                subject="adapter boundary",
                evidence_ids=("evidence-1",),
            )
        )
        self.assertEqual(result.renter_id, "local:test-runtime")
        self.assertEqual(result.evidence_ids_used, ("evidence-1",))
        self.assertTrue(result.metadata["bounded"])

    def test_unregistered_runtime_is_not_silently_substituted(self) -> None:
        registry = RenterAdapterRegistry()
        with self.assertRaises(LookupError):
            registry.require("cloud:missing-runtime")


if __name__ == "__main__":
    unittest.main()
