"""Re-check NGC/NIM claims. Prints receipts only. Never prints the key."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
import winreg
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_local_env() -> dict[str, str]:
    env: dict[str, str] = {}
    path = ROOT / ".env.local"
    if not path.is_file():
        return env
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, value = line.split("=", 1)
        env[name.strip()] = value.strip()
    return env


def hit(label: str, url: str, key: str, method: str = "GET", data: bytes | None = None) -> None:
    headers = {"Authorization": f"Bearer {key}", "Accept": "application/json"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            body = response.read().decode("utf-8", "replace")
        print(f"{label}\t{response.status}\t{body[:160].replace(chr(10), ' ')}")
    except urllib.error.HTTPError as exc:
        print(f"{label}\t{exc.code}\t{exc.read().decode('utf-8', 'replace')[:160].replace(chr(10), ' ')}")
    except Exception as exc:  # noqa: BLE001
        print(f"{label}\tERR\t{type(exc).__name__}")


def main() -> int:
    env = load_local_env()
    key = env.get("NVIDIA_API_KEY", "")
    print("env_local_exists", (ROOT / ".env.local").is_file())
    print("env_key_prefix_ok", key.startswith("nvapi-"))
    print("env_key_len", len(key))
    print("env_model", env.get("NVIDIA_NIM_MODEL", ""))

    ngc = Path.home() / ".ngc" / "config"
    print("ngc_config_exists", ngc.is_file())
    if ngc.is_file():
        text = ngc.read_text(encoding="utf-8")
        print("ngc_config_has_apikey_line", "apikey" in text)
        print("ngc_config_key_matches_env", key in text)

    installer = Path.home() / ".local" / "nvidia" / "ngccli_win_amd64.exe"
    print("ngc_installer_exists", installer.is_file())
    if installer.is_file():
        print("ngc_installer_bytes", installer.stat().st_size)

    user_env: dict[str, str] = {}
    try:
        hk = winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment")
        for name in ("NVIDIA_API_KEY", "NGC_API_KEY", "NVIDIA_NIM_MODEL"):
            try:
                value, _ = winreg.QueryValueEx(hk, name)
                user_env[name] = str(value)
            except FileNotFoundError:
                user_env[name] = ""
        winreg.CloseKey(hk)
    except OSError:
        pass
    print("user_env_key_set", user_env.get("NVIDIA_API_KEY", "").startswith("nvapi-"))
    print("user_env_model", user_env.get("NVIDIA_NIM_MODEL", ""))

    if not key.startswith("nvapi-"):
        print("FAIL-CLOSED no key")
        return 2

    anon = urllib.request.Request(
        "https://integrate.api.nvidia.com/v1/models",
        headers={"Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(anon, timeout=20) as response:
            print("anon_models", response.status, "bytes", len(response.read()))
    except urllib.error.HTTPError as exc:
        print("anon_models", exc.code)

    hit("ngc_orgs", "https://api.ngc.nvidia.com/v2/orgs", key)
    hit("nvcf", "https://api.nvcf.nvidia.com/v2/nvcf/functions", key)
    hit("registry", "https://api.ngc.nvidia.com/v2/org/nvidia/repos?page-size=1", key)
    payload = json.dumps(
        {
            "model": env.get("NVIDIA_NIM_MODEL", "nvidia/mistral-nemo-minitron-8b-8k-instruct"),
            "messages": [{"role": "user", "content": "HOLD"}],
            "max_tokens": 8,
        }
    ).encode("utf-8")
    hit(
        "nim_chat",
        "https://integrate.api.nvidia.com/v1/chat/completions",
        key,
        method="POST",
        data=payload,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
