"""Write ~/.ngc/config from .env.local. Never prints the key."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    env: dict[str, str] = {}
    for raw in (ROOT / ".env.local").read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip()
    api_key = env.get("NVIDIA_API_KEY", "")
    if not api_key.startswith("nvapi-"):
        print("FAIL-CLOSED: NVIDIA_API_KEY missing")
        return 2
    ngc = Path.home() / ".ngc"
    ngc.mkdir(parents=True, exist_ok=True)
    (ngc / "config").write_text(
        "[CURRENT]\n"
        f"apikey = {api_key}\n"
        "format_type = ascii\n"
        "org =\n"
        "team =\n",
        encoding="utf-8",
    )
    print("ngc_config_written")
    print(f"key_prefix {api_key[:8]}...")
    print(f"key_len {len(api_key)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
