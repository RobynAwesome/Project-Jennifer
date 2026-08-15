import assert from "node:assert/strict";
import test from "node:test";

import { resolveConventionalSunSign } from "@jennifer/shared";
import { ZodiacContextEngine } from "./zodiac-context-engine.js";

test("resolves conventional sun-sign boundaries without pretending to calculate a natal chart", () => {
  assert.equal(resolveConventionalSunSign(6, 21), "cancer");
  assert.equal(resolveConventionalSunSign(7, 22), "cancer");
  assert.equal(resolveConventionalSunSign(7, 23), "leo");
  assert.equal(resolveConventionalSunSign(12, 31), "capricorn");
  assert.equal(resolveConventionalSunSign(1, 1), "capricorn");
  assert.equal(resolveConventionalSunSign(2, 19), "pisces");
});

test("admits a self-declared sign as symbolic context with explicit epistemic limits", () => {
  const result = new ZodiacContextEngine().build({
    selfDeclaredSign: "cancer",
  });

  assert.equal(result.status, "ACTIVE");
  assert.equal(result.context?.sign, "cancer");
  assert.equal(result.context?.source, "self-declared");
  assert.equal(result.context?.authority, "LOW_SYMBOLIC_CONTEXT");
  assert.equal(
    result.context?.priorityRule,
    "EXPLICIT_USER_PREFERENCE_AND_OBSERVED_BEHAVIOR_OUTRANK_ZODIAC"
  );
  assert.ok(result.context?.archetype.themes.includes("home"));
  assert.ok(result.context?.archetype.relationalThemes.includes("continuity"));
  assert.ok(
    result.context?.prohibitedUses.includes("deterministic-personality-claim")
  );
  assert.equal(result.receipt.personalityFactClaimed, false);
  assert.equal(result.receipt.birthDateRetained, false);
});

test("requires consent before deriving a sign from birth-date data", () => {
  const result = new ZodiacContextEngine().build({
    birthDate: { month: 6, day: 30 },
  });

  assert.equal(result.status, "WITHHELD");
  assert.equal(result.context, undefined);
  assert.equal(result.receipt.consentRequired, true);
  assert.equal(result.receipt.consentSatisfied, false);
  assert.equal(result.receipt.sign, undefined);
  assert.equal(result.receipt.birthDateRetained, false);
});

test("derives a conventional sign after consent without retaining raw birth-date input", () => {
  const result = new ZodiacContextEngine().build({
    birthDate: { month: 6, day: 30 },
    birthDateConsent: true,
  });

  assert.equal(result.status, "ACTIVE");
  assert.equal(result.context?.sign, "cancer");
  assert.equal(result.context?.source, "birth-date-derived");
  assert.equal(result.receipt.consentSatisfied, true);
  assert.equal(result.receipt.birthDateRetained, false);
});

test("current human self-description outranks a conflicting derived date classification", () => {
  const result = new ZodiacContextEngine().build({
    selfDeclaredSign: "cancer",
    birthDate: { month: 8, day: 1 },
    birthDateConsent: true,
  });

  assert.equal(result.status, "ACTIVE");
  assert.equal(result.context?.sign, "cancer");
  assert.equal(result.context?.source, "self-declared");
});

test("returns unavailable when no zodiac signal is supplied", () => {
  const result = new ZodiacContextEngine().build({});

  assert.equal(result.status, "UNAVAILABLE");
  assert.equal(result.context, undefined);
  assert.equal(result.receipt.consentRequired, false);
  assert.equal(result.receipt.personalityFactClaimed, false);
});
