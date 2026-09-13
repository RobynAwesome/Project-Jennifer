"""NVIDIA NIM cloud renter. Fail-closed if the key is missing.

Does not own Jennifer memory, authority, or canon.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

from project_jennifer.adapters.renters import RenterExecutionRequest, RenterExecutionResult
from project_jennifer.contracts import (
    CapabilitySet,
    ExecutionMode,
    GovernanceProfile,
    RenterCapabilityManifest,
    RenterConstraints,
)

DEFAULT_BASE = "https://integrate.api.nvidia.com/v1"
DEFAULT_MODEL = "nvidia/mistral-nemo-minitron-8b-8k-instruct"


def nvidia_hold_manifest() -> RenterCapabilityManifest:
    """Register NVIDIA as an explicit-only renter until a live invoke receipt exists."""

    return RenterCapabilityManifest(
        provider="nvidia",
        model_id=DEFAULT_MODEL,
        execution=ExecutionMode.CLOUD,
        capabilities=CapabilitySet(),
        governance=GovernanceProfile(),
        constraints=RenterConstraints(
            data_egress="nvidia-cloud",
            offline=False,
            private_lane_allowed=False,
            notes=(
                "NGC identity can be valid while NIM chat stays 403",
                "Do not auto-route until metadata.verified_at is set from a 200 receipt",
            ),
        ),
        metadata={
            "auto_route": False,
            "invoke_state": "HOLD",
            "verified_at": None,
            "base_url": DEFAULT_BASE,
        },
    )


class NvidiaNimAdapter:
    """OpenAI-compatible NIM chat seam. Stateless renter only."""

    def __init__(
        self,
        *,
        api_key: str | None = None,
        base_url: str | None = None,
        model_id: str | None = None,
    ) -> None:
        self.api_key = (api_key if api_key is not None else os.environ.get("NVIDIA_API_KEY", "")).strip()
        self.base_url = (base_url or os.environ.get("NVIDIA_NIM_BASE_URL") or DEFAULT_BASE).rstrip("/")
        self.model_id = model_id or os.environ.get("NVIDIA_NIM_MODEL") or DEFAULT_MODEL
        self.renter_id = f"nvidia:{self.model_id}"

    def execute(self, request: RenterExecutionRequest) -> RenterExecutionResult:
        if not self.api_key:
            raise PermissionError("NVIDIA_API_KEY missing — NIM renter fail-closed")
        if not self.api_key.startswith("nvapi-"):
            raise PermissionError("NVIDIA_API_KEY is not an NGC personal key — fail-closed")

        payload = {
            "model": self.model_id,
            "messages": [
                {
                    "role": "system",
                    "content": "I_AM_STATELESS_RENTER_NOT_LANDLORD. Answer only the bounded request.",
                },
                {"role": "user", "content": request.prompt},
            ],
            "max_tokens": 256,
            "temperature": 0.2,
        }
        req = urllib.request.Request(
            f"{self.base_url}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=45) as response:
                body = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")[:400]
            raise RuntimeError(f"NIM HTTP {exc.code}: {detail}") from exc

        choices = body.get("choices")
        if not isinstance(choices, list) or not choices:
            raise RuntimeError("NIM returned no choices")
        message = choices[0].get("message") if isinstance(choices[0], dict) else {}
        output = str(message.get("content", "")).strip() if isinstance(message, dict) else ""
        if not output:
            raise RuntimeError("NIM returned empty content")

        return RenterExecutionResult(
            renter_id=self.renter_id,
            output=output,
            evidence_ids_used=request.evidence_ids,
            metadata={
                "provider": "nvidia",
                "model_id": self.model_id,
                "bounded": True,
                "landlord": False,
            },
        )
