import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

function repoPath(relativePath: string): string {
  return path.join(repoRoot, relativePath);
}

function read(relativePath: string): string {
  return readFileSync(repoPath(relativePath), "utf8");
}

const requiredCoreSkills = [
  "project-jennifer",
  "cdp-conceptual-divergence",
  "ceep-conceptual-evaluation",
  "poc-foc-evaluation",
  "ccp-conceptual-convergence",
  "ncmp-concept-intake",
  "cag-communication-attention",
  "rag-governed-retrieval",
  "jennifer-stateless-renter",
  "forge-rivm",
  "authored-relational-attention",
] as const;

test("skills.md resolves every linked SKILL.md and includes the Jennifer conceptual suite", () => {
  const catalog = read("skills.md");
  const linkedSkills = new Set<string>();
  const skillLinkPattern = /skills\/([a-z0-9-]+)\/SKILL\.md/g;

  for (const match of catalog.matchAll(skillLinkPattern)) {
    const skillName = match[1];
    if (skillName) linkedSkills.add(skillName);
  }

  assert.ok(linkedSkills.size >= requiredCoreSkills.length, "skills.md should expose a non-trivial portable skill catalog");

  for (const skillName of linkedSkills) {
    const skillFile = `skills/${skillName}/SKILL.md`;
    assert.equal(existsSync(repoPath(skillFile)), true, `${skillFile} must exist because skills.md links to it`);
  }

  for (const skillName of requiredCoreSkills) {
    assert.equal(linkedSkills.has(skillName), true, `skills.md must expose ${skillName}`);
  }
});

test("Project Jennifer umbrella and AGENTS entrypoints route renters into the specialist skill graph", () => {
  const umbrella = read("skills/project-jennifer/SKILL.md");
  const agents = read("AGENTS.md");

  assert.match(agents, /skills\.md/);
  assert.match(agents, /skills\/project-jennifer\/SKILL\.md/);
  assert.match(agents, /I_AM_STATELESS_RENTER_NOT_LANDLORD/);

  for (const skillName of requiredCoreSkills.filter((name) => name !== "project-jennifer")) {
    assert.match(
      umbrella,
      new RegExp(`\\.\\./${skillName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\/SKILL\\.md`),
      `umbrella skill must route to ${skillName}`,
    );
  }
});

test("CDP and CCP preserve their different proof states instead of flattening specification into runtime proof", () => {
  const catalog = read("skills.md");
  const cdpSkill = read("skills/cdp-conceptual-divergence/SKILL.md");
  const ccpSkill = read("skills/ccp-conceptual-convergence/SKILL.md");
  const ccpRuntime = read("packages/conceptual/src/ccp/ConceptualConvergenceProtocol.ts");

  assert.match(catalog, /CDP[\s\S]*dedicated packages\/conceptual\/src\/cdp engine: NOT CURRENTLY PROVEN/);
  assert.match(cdpSkill, /no dedicated.*cdp.*runtime|no dedicated.*runtime.*cdp/i);
  assert.equal(
    existsSync(repoPath("packages/conceptual/src/cdp")),
    false,
    "a dedicated CDP runtime module must not be implied when no such module exists",
  );

  assert.match(ccpSkill, /packages\/conceptual\/src\/ccp/i);
  assert.match(ccpRuntime, /const canonical = decision === "Accepted"/);
  assert.match(ccpRuntime, /return "Experimental"/);
  assert.match(ccpRuntime, /return "Refine"/);
});

test("distribution metadata exposes the conceptual suite and preserves renter/proof rules", () => {
  const engines = read("skills/distribution/engines.yaml");

  for (const skillName of requiredCoreSkills) {
    assert.match(engines, new RegExp(skillName), `engines.yaml must expose ${skillName}`);
  }

  assert.match(engines, /preserve_proof_state:\s*true/);
  assert.match(engines, /preserve_stateless_renter_posture:\s*true/);
  assert.match(engines, /memory_self_promotion:\s*prohibited/);
  assert.match(engines, /return_receipts:\s*true/);
});

test("AwesomeSkills KPGS publication manifest is explicit about external publication state", () => {
  const manifestPath = "skills/distribution/awesome-skills-kpgs.yaml";
  assert.equal(existsSync(repoPath(manifestPath)), true);

  const manifest = read(manifestPath);
  assert.match(manifest, /canonical_site:\s*https:\/\/www\.awesomeskills\.dev/);
  assert.match(manifest, /submission_status:\s*public-github-ready-not-form-submitted/);
  assert.match(manifest, /website_submission_receipt:\s*null/);
});
