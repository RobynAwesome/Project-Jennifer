import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repoRoot = path.resolve(import.meta.dirname, "..");
const canonPath = path.join(repoRoot, "governance", "fox-forge-protocol.json");
const manifestPath = path.join(
  repoRoot,
  "assets",
  "Project-Waifu-Forge",
  "fox-forge-protocol",
  "source-manifest.json",
);

const fail = (message) => {
  console.error(`FFP VALIDATION FAILED: ${message}`);
  process.exitCode = 1;
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const canon = readJson(canonPath);
const manifest = readJson(manifestPath);

if (canon.protocolId !== "FFP" || canon.status !== "CANON") {
  fail("governance/fox-forge-protocol.json must declare canonical FFP.");
}

const forge = canon.identityCanon?.forge;
if (forge?.animalForm !== "fox") {
  fail("Forge animal form must remain fox.");
}
if (JSON.stringify(forge?.pronouns) !== JSON.stringify(["she", "her"])) {
  fail("Forge pronouns must remain she/her.");
}

const founder = canon.identityCanon?.founder;
if (founder?.signal !== "phoenix") {
  fail("Founder signal must remain phoenix.");
}
if (founder?.animalForm !== null) {
  fail("Founder Phoenix is a signal; animalForm must remain unassigned.");
}

for (const identityId of ["jennifer", "kairo"]) {
  const entry = canon.identityCanon?.[identityId];
  if (entry?.animalForm !== null || entry?.signal !== null || entry?.state !== "OPEN") {
    fail(`${identityId} must remain OPEN with no assigned FFP animal form or signal.`);
  }
}

const expectedModes = ["work", "cloud", "healing", "mission"];
const actualModes = Object.keys(canon.sceneModes ?? {}).sort();
if (JSON.stringify(actualModes) !== JSON.stringify([...expectedModes].sort())) {
  fail(`Scene modes must be exactly: ${expectedModes.join(", ")}.`);
}

for (const asset of manifest.assets ?? []) {
  if (asset.authorityClass !== "VISUAL_DERIVATIVE") {
    fail(`${asset.id}: authorityClass must remain VISUAL_DERIVATIVE.`);
  }
  if (asset.canonEffect !== "none") {
    fail(`${asset.id}: generated visual cannot directly mutate canon.`);
  }
  if (asset.sceneMode !== null && !expectedModes.includes(asset.sceneMode)) {
    fail(`${asset.id}: unknown scene mode ${asset.sceneMode}.`);
  }

  const assetPath = path.join(
    repoRoot,
    "assets",
    "Project-Waifu-Forge",
    "fox-forge-protocol",
    asset.path,
  );

  if (!fs.existsSync(assetPath)) {
    fail(`${asset.id}: missing binary ${asset.path}.`);
    continue;
  }

  const digest = crypto
    .createHash("sha256")
    .update(fs.readFileSync(assetPath))
    .digest("hex");

  if (digest !== asset.sha256) {
    fail(`${asset.id}: SHA-256 mismatch.`);
  }
}

if (!process.exitCode) {
  console.log(
    `FFP validation passed: ${manifest.assets.length} assets, ${expectedModes.length} scene modes, identity canon intact.`,
  );
}
