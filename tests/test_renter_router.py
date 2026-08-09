from __future__ import annotations

import unittest

from project_jennifer.contracts import (
    CapabilitySet,
    ExecutionMode,
    RenterBenchmarks,
    RenterCapabilityManifest,
    RenterConstraints,
    RenterTaskRequirements,
)
from project_jennifer.core.renter_router import RenterRegistry, StatelessRenterRouter


class StatelessRenterRouterTests(unittest.TestCase):
    def setUp(self) -> None:
        registry = RenterRegistry()
        registry.register(
            RenterCapabilityManifest(
                provider="local",
                model_id="local-code-model",
                execution=ExecutionMode.LOCAL,
                capabilities=CapabilitySet(reasoning=True, coding=True, structured_output=True),
                constraints=RenterConstraints(data_egress="none", offline=True),
                benchmarks=RenterBenchmarks(coding=0.81, planning=0.7),
            )
        )
        registry.register(
            RenterCapabilityManifest(
                provider="cloud",
                model_id="cloud-code-model",
                execution=ExecutionMode.CLOUD,
                capabilities=CapabilitySet(reasoning=True, coding=True, structured_output=True),
                constraints=RenterConstraints(data_egress="cloud", offline=False),
                benchmarks=RenterBenchmarks(coding=0.93, planning=0.9),
            )
        )
        registry.register(
            RenterCapabilityManifest(
                provider="explicit",
                model_id="explicit-model",
                execution=ExecutionMode.CLOUD,
                capabilities=CapabilitySet(reasoning=True, coding=False),
                constraints=RenterConstraints(data_egress="cloud", offline=False),
                benchmarks=RenterBenchmarks(coding=0.1, planning=0.8),
            )
        )
        self.router = StatelessRenterRouter(registry)

    def test_auto_route_uses_capabilities_and_benchmark(self) -> None:
        requirements = RenterTaskRequirements(
            capabilities=CapabilitySet(reasoning=True, coding=True),
            benchmark_dimensions=("coding", "planning"),
        )

        selection = self.router.select(requirements)

        self.assertEqual(selection.renter.renter_id, "cloud:cloud-code-model")
        self.assertFalse(selection.explicit_override)

    def test_offline_requirement_routes_to_offline_renter(self) -> None:
        requirements = RenterTaskRequirements(
            capabilities=CapabilitySet(reasoning=True, coding=True),
            benchmark_dimensions=("coding",),
            require_offline=True,
        )

        selection = self.router.select(requirements)

        self.assertEqual(selection.renter.renter_id, "local:local-code-model")

    def test_explicit_user_choice_overrides_capability_ranking(self) -> None:
        requirements = RenterTaskRequirements(
            capabilities=CapabilitySet(reasoning=True, coding=True),
            benchmark_dimensions=("coding",),
            explicit_renter_id="explicit:explicit-model",
        )

        selection = self.router.select(requirements)

        self.assertEqual(selection.renter.renter_id, "explicit:explicit-model")
        self.assertTrue(selection.explicit_override)
        self.assertIn("Capability mismatch", selection.reason)


if __name__ == "__main__":
    unittest.main()
