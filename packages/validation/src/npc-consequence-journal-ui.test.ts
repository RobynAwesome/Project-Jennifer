import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "../..");

function read(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("consequence journal consumes the shared reveal contract instead of defining a parallel client type", () => {
  const component = read("apps/web/src/components/game/ConsequenceTrace.tsx");
  const fixture = read("apps/web/src/lib/consequence-reveal-demo.ts");

  assert.match(component, /ConsequenceRevealReceipt/);
  assert.match(component, /from "@jennifer\/shared"/);
  assert.match(fixture, /ConsequenceRevealReceipt/);
  assert.doesNotMatch(component, /interface\s+ConsequenceRevealReceipt/);
  assert.doesNotMatch(fixture, /interface\s+ConsequenceRevealReceipt/);
});

test("demo consequence journal is visibly non-authoritative and discoverable from the game route", () => {
  const journal = read("apps/web/src/app/game/consequences/page.tsx");
  const game = read("apps/web/src/app/game/page.tsx");
  const component = read("apps/web/src/components/game/ConsequenceTrace.tsx");

  assert.match(journal, /data-consequence-data-source="demo"/);
  assert.match(journal, /Non-authoritative POC fixture/);
  assert.match(component, /POC fixture/);
  assert.match(component, /not live Jennifer world state/i);
  assert.match(game, /href="\/game\/consequences"/);
  assert.match(game, /data-consequence-journal-entry="true"/);
});

test("authoritative consequence UI fails closed without runtime admission evidence", () => {
  const component = read("apps/web/src/components/game/ConsequenceTrace.tsx");

  assert.match(component, /source\.mode === "authoritative" && !receipt\.runtimeAdmission/);
  assert.match(component, /requires runtime admission evidence/);
});

test("journal preserves revision history and causal evidence without exposing internal receipt prose", () => {
  const component = read("apps/web/src/components/game/ConsequenceTrace.tsx");
  const journal = read("apps/web/src/app/game/consequences/page.tsx");

  assert.match(component, /interpretationHistory\.map/);
  assert.match(component, /receipt\.revisions\.map/);
  assert.match(component, /receipt\.disclosedEvidence/);
  assert.match(component, /evidence refs · not retrospective prose/);
  assert.match(component, /did not erase the original/i);
  assert.match(component, /does not prove that every\s*consequence is fair/i);

  assert.doesNotMatch(component, /\.provenance\b/);
  assert.doesNotMatch(component, /\.statement\b/);
  assert.doesNotMatch(component, /\.maturesWhen\b/);
  assert.doesNotMatch(journal, /\.provenance\b/);
});

test("consequence journal keeps a mobile-first layout contract", () => {
  const component = read("apps/web/src/components/game/ConsequenceTrace.tsx");
  const journal = read("apps/web/src/app/game/consequences/page.tsx");

  assert.match(journal, /px-3 py-5/);
  assert.match(journal, /sm:px-6 sm:py-8/);
  assert.match(component, /p-4 sm:p-6/);
  assert.match(component, /grid gap-3 sm:grid-cols-2/);
  assert.match(component, /flex flex-col gap-4 sm:flex-row/);
});

test("game-web skill keeps consequence journal authority and fairness boundaries explicit", () => {
  const skill = read("skills/jennifer-game-web-api/SKILL.md");

  assert.match(skill, /ConsequenceRevealReceipt/);
  assert.match(skill, /visibly labelled non-authoritative/i);
  assert.match(skill, /requires runtime admission evidence/i);
  assert.match(skill, /preserves origin \+ interpretation history \+ revisions/i);
  assert.match(skill, /may not invent retrospective cause prose/i);
  assert.match(skill, /Causal legibility is not narrative fairness/i);
});
