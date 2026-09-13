import assert from "node:assert/strict";
import test from "node:test";

import {
  allowedBrowserOrigins,
  isAllowedBrowserOrigin,
  requiresBrowserOrigin,
} from "./zero-trust.js";

type EnvPatch = Record<string, string | undefined>;

function withEnv(patch: EnvPatch, fn: () => void): void {
  const saved: EnvPatch = {};
  for (const key of Object.keys(patch)) {
    saved[key] = process.env[key];
    const next = patch[key];
    if (next === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = next;
    }
  }
  try {
    fn();
  } finally {
    for (const key of Object.keys(patch)) {
      const prev = saved[key];
      if (prev === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = prev;
      }
    }
  }
}

test("development allows missing Origin by default", () => {
  withEnv(
    {
      NODE_ENV: "development",
      JENNIFER_CORS_REQUIRE_ORIGIN: undefined,
      JENNIFER_CORS_ALLOW_MISSING_ORIGIN: undefined,
    },
    () => {
      assert.equal(requiresBrowserOrigin(), false);
      assert.equal(isAllowedBrowserOrigin(undefined), true);
    },
  );
});

test("production requires missing Origin unless explicitly allowed", () => {
  withEnv(
    {
      NODE_ENV: "production",
      JENNIFER_CORS_REQUIRE_ORIGIN: undefined,
      JENNIFER_CORS_ALLOW_MISSING_ORIGIN: undefined,
      JENNIFER_CORS_ORIGINS: "https://game.example.com",
    },
    () => {
      assert.equal(requiresBrowserOrigin(), true);
      assert.equal(isAllowedBrowserOrigin(undefined), false);
      assert.equal(
        isAllowedBrowserOrigin("https://game.example.com"),
        true,
      );
    },
  );
});

test("JENNIFER_CORS_ALLOW_MISSING_ORIGIN relaxes production missing Origin", () => {
  withEnv(
    {
      NODE_ENV: "production",
      JENNIFER_CORS_ALLOW_MISSING_ORIGIN: "1",
      JENNIFER_CORS_ORIGINS: "https://game.example.com",
    },
    () => {
      assert.equal(requiresBrowserOrigin(), false);
      assert.equal(isAllowedBrowserOrigin(undefined), true);
    },
  );
});

test("JENNIFER_CORS_REQUIRE_ORIGIN forces missing Origin rejection in development", () => {
  withEnv(
    {
      NODE_ENV: "development",
      JENNIFER_CORS_REQUIRE_ORIGIN: "true",
      JENNIFER_CORS_ORIGINS: "http://127.0.0.1:3000",
    },
    () => {
      assert.equal(requiresBrowserOrigin(), true);
      assert.equal(isAllowedBrowserOrigin(undefined), false);
      assert.equal(isAllowedBrowserOrigin("http://127.0.0.1:3000"), true);
    },
  );
});

test("production without configured origins yields empty allowlist", () => {
  withEnv(
    {
      NODE_ENV: "production",
      JENNIFER_CORS_ORIGINS: undefined,
    },
    () => {
      assert.deepEqual(allowedBrowserOrigins(), []);
    },
  );
});

test("development without configured origins uses local defaults", () => {
  withEnv(
    {
      NODE_ENV: "development",
      JENNIFER_CORS_ORIGINS: undefined,
    },
    () => {
      assert.deepEqual(allowedBrowserOrigins(), [
        "http://127.0.0.1:3000",
        "http://localhost:3000",
      ]);
    },
  );
});
