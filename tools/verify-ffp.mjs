import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "packages/shared/src/fox-forge-protocol.ts");
const manifestPath = path.join(root, "assets/Fox-Forge-Protocol/source-manifest.json");

const source = fs.readFileSync(sourcePath, "utf8");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const failures = [];

function requireSource(fragment, message) {
  if (!source.includes(fragment)) failures.push(message);
}

requireSource('animalForm: "fox"', "Forge fox-form canon missing");
requireSource('pronouns: ["she", "her"]', "Forge she/her canon missing");
requireSource('id: "jennifer"', "Jennifer slot missing");
requireSource('id: "kairo"', "Kairo slot missing");
requireSource('canonMutated: false', "ML presentation gate must explicitly preserve canon");

const expectedModes = new Set(["work", "cloud", "healing", "mission"]);
const seenModes = new Set();

for (const entry of manifest.entries ?? []) {
  if (entry.authority !== "VISUAL_DERIVATIVE") {
    failures.push(`${entry.id}: visual asset authority must remain VISUAL_DERIVATIVE at intake`);
  }
  if (entry.canonEffect !== "NONE") {
    failures.push(`${entry.id}: visual derivative cannot mutate canon`);
  }
  if (entry.sceneMode) seenModes.add(entry.sceneMode);

  if (entry.admissionState === "ADMITTED") {
    if (!entry.dimensions || !entry.sha256) {
      failures.push(`${entry.id}: admitted binary requires dimensions and sha256`);
    }
    const file = path.join(root, entry.semanticPath);
    if (!fs.existsSync(file)) failures.push(`${entry.id}: admitted binary missing from semanticPath`);
  }
}

for (const mode of expectedModes) {
  if (!seenModes.has(mode)) failures.push(`manifest missing ${mode} scene-mode visual entry`);
}

if (failures.length) {
  console.error("FFP VALIDATION FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("FFP VALIDATION PASSED");
console.log(`- scene modes: ${[...seenModes].sort().join(", ")}`);
console.log(`- asset entries: ${manifest.entries.length}`);
console.log("- canon mutation from learned inference: blocked");
