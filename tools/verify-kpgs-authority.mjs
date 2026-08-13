import { readFile } from "node:fs/promises";

const current = "RobynAwesome/Introduction-to-MCP";
const stale = "Kopano-Labs/Introduction-to-MCP";
const files = ["SKILL.md", "packages/shared/src/forge-role.ts"];
const errors = [];

for (const path of files) {
  const body = await readFile(path, "utf8");
  if (!body.includes(current)) errors.push(`${path}: missing current KPGS authority`);
  if (body.includes(stale)) errors.push(`${path}: stale KPGS authority remains`);
}

if (errors.length) {
  console.error("KPGS authority validation FAILED");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`KPGS authority validation PASS: ${current}`);
