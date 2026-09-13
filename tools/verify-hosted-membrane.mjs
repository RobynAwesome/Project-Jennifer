#!/usr/bin/env node
/**
 * Sprint A2: verify hosted API health + CORS Origin honesty (browser-shaped).
 *
 * Usage:
 *   JENNIFER_API_URL=https://api.example.com WEB_ORIGIN=https://web.example.com node tools/verify-hosted-membrane.mjs
 *
 * Does not claim stranger love — only membrane reachability.
 */

const API = (process.env.JENNIFER_API_URL ?? "").replace(/\/$/, "");
const WEB = (process.env.WEB_ORIGIN ?? "").replace(/\/$/, "");

function fail(message) {
  console.error(`FOC: ${message}`);
  process.exitCode = 1;
}

async function probe(label, origin) {
  const headers = { Accept: "application/json" };
  if (origin) headers.Origin = origin;

  const response = await fetch(`${API}/health`, { headers });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text.slice(0, 200) };
  }
  const ok = response.ok && body.status === "ok";
  console.log(
    `[${ok ? "PASS" : "FOC"}] ${label} — http=${response.status} status=${body.status ?? "?"}`,
  );
  return ok;
}

async function main() {
  if (!API) {
    fail("Set JENNIFER_API_URL (public API, no trailing slash).");
    return;
  }
  if (!WEB) {
    fail("Set WEB_ORIGIN (exact Vercel/web origin, no trailing slash).");
    return;
  }

  console.log(`Hosted membrane verify → API=${API} WEB=${WEB}`);

  const withOrigin = await probe("health.with-allowed-origin", WEB);
  const withoutOrigin = await probe("health.without-origin", undefined);

  if (!withOrigin) {
    fail("Allowed web Origin must reach /health — check JENNIFER_CORS_ORIGINS on API.");
    return;
  }

  if (withoutOrigin) {
    console.log(
      "[WARN] Missing Origin reached /health — fine for dev; stranger prod should reject (unset ALLOW_MISSING_ORIGIN).",
    );
  } else {
    console.log("[PASS] Missing Origin rejected — production CORS honesty.");
  }

  console.log("\nNext: pnpm smoke:love-loop with JENNIFER_API_URL set to this API.");
}

main().catch((error) => {
  fail(error.message);
});
