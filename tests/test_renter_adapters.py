from __future__ import annotations

import unittest

from project_jennifer.adapters import (
    RenterAdapterRegistry,
    RenterExecutionRequest,
    RenterExecutionResult,
)
from project_jennifer.adapters.nvidia_nim import NvidiaNimAdapter


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

    def test_nvidia_nim_fail_closed_without_key(self) -> None:
        adapter = NvidiaNimAdapter(api_key="")
        with self.assertRaises(PermissionError):
            adapter.execute(
                RenterExecutionRequest(
                    run_id="run-nim-closed",
                    renter_id=adapter.renter_id,
                    prompt="should not leave the machine",
                    subject="fail-closed",
                )
            )


if __name__ == "__main__":
    unittest.main()
