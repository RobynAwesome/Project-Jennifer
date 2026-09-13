"""Probe NVIDIA NIM with the local key. Prints counts and a short receipt, never the key."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_local_env() -> None:
    env_path = ROOT / ".env.local"
    if not env_path.is_file():
        return
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def main() -> int:
    load_local_env()
    key = os.environ.get("NVIDIA_API_KEY", "").strip()
    base = os.environ.get("NVIDIA_NIM_BASE_URL", "https://integrate.api.nvidia.com/v1").rstrip("/")
    if not key.startswith("nvapi-"):
        print("FAIL-CLOSED: NVIDIA_API_KEY missing or not an nvapi key")
        return 2

    headers = {
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    try:
        req = urllib.request.Request(f"{base}/models", headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=45) as response:
            catalog = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        print(f"MODELS HTTP {exc.code}")
        return 1

    data = catalog.get("data") if isinstance(catalog, dict) else None
    count = len(data) if isinstance(data, list) else -1
    print(f"NIM catalog: {count} models")

    sys.path.insert(0, str(ROOT))
    from project_jennifer.adapters.nvidia_nim import NvidiaNimAdapter
    from project_jennifer.adapters.renters import RenterExecutionRequest

    adapter = NvidiaNimAdapter()
    try:
        result = adapter.execute(
            RenterExecutionRequest(
                run_id="nim-probe",
                renter_id=adapter.renter_id,
                prompt="Reply with exactly: HOLD",
                subject="nvidia nim smoke",
            )
        )
    except RuntimeError as exc:
        detail = str(exc)
        if "403" in detail:
            print(f"renter: {adapter.renter_id}")
            print("receipt: NGC_IDENTITY_OK_NIM_INVOKE_FORBIDDEN")
            print("scope: key reaches NGC org APIs; chat completions are not enabled on this key")
            return 0
        raise
    print(f"renter: {result.renter_id}")
    print(f"output: {result.output[:120]}")
    print("receipt: NIM_CLOUD_RENTER_REACHABLE")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
