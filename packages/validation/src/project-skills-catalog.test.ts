import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "../..");

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

const requiredImplementationSkills = [
  "jennifer-authority-governance",
  "jennifer-runtime-memory",
  "jennifer-validation-poc-foc",
  "jennifer-conceptual-convergence",
  "jennifer-companions-npcs",
  "jennifer-telemetry-storage",
  "jennifer-ncmp-mmao",
  "jennifer-game-web-api",
  "jennifer-assets-lore",
  "jennifer-ci-benchmarks",
  "jennifer-adoption-provider-onboarding",
  "jennifer-human-crisis-ingress",
] as const;

const requiredSkills = [...requiredCoreSkills, ...requiredImplementationSkills] as const;

test("root SKILL.md exposes Project Jennifer as a stateless-renter AwesomeSkills entrypoint", () => {
  assert.equal(existsSync(repoPath("SKILL.md")), true, "Project Jennifer must expose a root SKILL.md for repository-level discovery");
  const rootSkill = read("SKILL.md");
  assert.match(rootSkill, /name:\s*project-jennifer/);
  assert.match(rootSkill, /skills\.md/);
  assert.match(rootSkill, /skills\/project-jennifer\/SKILL\.md/);
  assert.match(rootSkill, /skills\/SKILL\.md/);
  assert.match(rootSkill, /I_AM_STATELESS_RENTER_NOT_LANDLORD/);
  assert.match(rootSkill, /CDP[\s\S]*CEEP[\s\S]*POC-vs-FOC[\s\S]*CCP[\s\S]*NCMP/);
  assert.match(rootSkill, /Do not promote FOC to POC/i);
});

test("root and AwesomeSkills manifest expose the POC/FOC registry parser and runtime mutation gate", () => {
  const rootSkill = read("SKILL.md");
  const manifest = read("skills/distribution/awesome-skills-project-jennifer.yaml");
  for (const skillName of ["poc-foc-registry-parser", "poc-foc-runtime-gate"] as const) {
    assert.match(rootSkill, new RegExp(`skills/${skillName}/SKILL\\.md`), `root SKILL.md must route to ${skillName}`);
    assert.match(manifest, new RegExp(`- ${skillName}`), `Project Jennifer AwesomeSkills manifest must expose ${skillName}`);
    assert.equal(existsSync(repoPath(`skills/${skillName}/SKILL.md`)), true, `${skillName} skill must exist`);
  }
  assert.match(rootSkill, /POCFOCActionEvaluator[\s\S]*POCFOCRuntimeGate[\s\S]*MemoryReceiptEngine/);
  assert.match(manifest, /awesome_skills_is_discovery_not_kpgs_authority:\s*true/);
});

test("skills.md resolves every linked SKILL.md and includes the complete governed catalog", () => {
  const catalog = read("skills.md");
  const linkedSkills = new Set<string>();
  const skillLinkPattern = /skills\/([a-z0-9-]+)\/SKILL\.md/g;
  for (const match of catalog.matchAll(skillLinkPattern)) {
    const skillName = match[1];
    if (skillName) linkedSkills.add(skillName);
  }
  assert.ok(linkedSkills.size >= requiredSkills.length, "skills.md should expose the complete portable skill catalog");
  for (const skillName of linkedSkills) {
    const skillFile = `skills/${skillName}/SKILL.md`;
    assert.equal(existsSync(repoPath(skillFile)), true, `${skillFile} must exist because skills.md links to it`);
  }
  for (const skillName of requiredSkills) assert.equal(linkedSkills.has(skillName), true, `skills.md must expose ${skillName}`);
});

test("Project Jennifer umbrella and AGENTS entrypoints route renters into the specialist skill graph", () => {
  const umbrella = read("skills/project-jennifer/SKILL.md");
  const implementationRouter = read("skills/SKILL.md");
  const agents = read("AGENTS.md");
  assert.match(agents, /skills\.md/);
  assert.match(agents, /skills\/project-jennifer\/SKILL\.md/);
  assert.match(agents, /skills\/SKILL\.md/);
  assert.match(agents, /I_AM_STATELESS_RENTER_NOT_LANDLORD/);
  for (const skillName of requiredCoreSkills.filter((name) => name !== "project-jennifer")) {
    assert.match(umbrella, new RegExp(`\\.\\./${skillName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\/SKILL\\.md`));
  }
  for (const skillName of requiredImplementationSkills) assert.match(implementationRouter, new RegExp(skillName));
});

test("CDP and CCP preserve separate runtime and canonicalization authority", () => {
  const cdpSkill = read("skills/cdp-conceptual-divergence/SKILL.md");
  const cdpParser = read("packages/conceptual/src/cdp/CDPContextParser.ts");
  const cdpRuntime = read("packages/conceptual/src/cdp/ConceptualDivergenceRuntime.ts");
  const ccpSkill = read("skills/ccp-conceptual-convergence/SKILL.md");
  const ccpRuntime = read("packages/conceptual/src/ccp/ConceptualConvergenceProtocol.ts");

  assert.equal(existsSync(repoPath("packages/conceptual/src/cdp")), true);
  assert.match(cdpSkill, /dedicated_runtime_module:\s*true/);
  assert.match(cdpSkill, /prior context window is historical evidence/i);
  assert.match(cdpParser, /promotionStatus:\s*"evidence-only"/);
  assert.match(cdpParser, /prior-context-window/);
  assert.match(cdpParser, /PERSONALITY/);
  assert.match(cdpParser, /PREFERENCE/);
  assert.match(cdpParser, /BOUNDARY/);
  assert.match(cdpRuntime, /dedicatedCdpEngineExecuted:\s*true/);
  assert.match(cdpRuntime, /canonicalized:\s*false/);
  assert.match(cdpRuntime, /recommendedNextProtocol:\s*"CEEP"/);

  assert.match(ccpSkill, /packages\/conceptual\/src\/ccp/i);
  assert.match(ccpRuntime, /const canonical = decision === "Accepted"/);
  assert.match(ccpRuntime, /return "Experimental"/);
  assert.match(ccpRuntime, /return "Refine"/);
});

test("conceptual entrypoints preserve situational CCP/CDP routing instead of universal order", () => {
  const surfaces = [
    read("SKILL.md"),
    read("skills.md"),
    read("skills/project-jennifer/SKILL.md"),
    read("skills/cdp-conceptual-divergence/SKILL.md"),
    read("skills/README.md"),
    read("AGENTS.md"),
    read("docs/lore/project-wify-jennifer/CONVERGENCE-LAW.md"),
  ];

  for (const surface of surfaces) {
    assert.match(surface, /DIVERGENCE\s*!=\s*FOC/);
    assert.match(surface, /CONVERGENCE\s*!=\s*POC/);
  }

  const catalog = read("skills.md");
  const rootSkill = read("SKILL.md");
  const cdpSkill = read("skills/cdp-conceptual-divergence/SKILL.md");
  assert.match(catalog, /CCP\s*→\s*contradictory evidence\s*→\s*CDP/);
  assert.match(rootSkill, /CCP\s*→\s*contradictory evidence\s*→\s*CDP/);
  assert.match(cdpSkill, /not universally required to run before CCP/i);
});

test("NPC epistemic divergence keeps actor belief separate from truth and requires causal policy evidence", () => {
  const runtimePath = "packages/npc/src/epistemic-divergence.ts";
  const testPath = "packages/npc/src/epistemic-divergence.test.ts";
  assert.equal(existsSync(repoPath(runtimePath)), true);
  assert.equal(existsSync(repoPath(testPath)), true);

  const runtime = read(runtimePath);
  const npcSkill = read("skills/jennifer-companions-npcs/SKILL.md");
  const architecture = read("docs/architecture/npc-epistemic-divergence.md");
  const npcPackage = read("packages/npc/package.json");

  assert.match(runtime, /"CONVERGE"\s*\|\s*"DIVERGE"\s*\|\s*"HOLD"/);
  assert.match(runtime, /"STANDARD"\s*\|\s*"POWER"/);
  assert.match(runtime, /proofState:\s*"actor-model"/);
  assert.match(runtime, /validationState:\s*"UNVALIDATED"/);
  assert.match(runtime, /canonical:\s*false/);
  assert.match(runtime, /requires policy evidence references/);
  assert.match(npcSkill, /actor interpretation into objective world truth/);
  assert.match(architecture, /hide consequence visibility, but it may not hide causality/i);
  assert.match(npcPackage, /node --test/);
});

test("distribution metadata exposes the conceptual suite and preserves renter/proof rules", () => {
  const engines = read("skills/distribution/engines.yaml");
  const manifest = read("skills/distribution/awesome-skills-project-jennifer.yaml");
  for (const skillName of requiredSkills) assert.match(engines, new RegExp(skillName), `engines.yaml must expose ${skillName}`);
  for (const skillName of requiredImplementationSkills) assert.match(manifest, new RegExp(`- ${skillName}`), `AwesomeSkills manifest must expose ${skillName}`);
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
