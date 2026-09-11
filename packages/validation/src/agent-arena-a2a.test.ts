import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const repoRoot = join(process.cwd(), "..", "..");
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

test("Citadel A2A discovery exposes the current well-known Agent Card", () => {
  const routes = read("apps/api/src/a2a/routes.ts");
  assert.match(routes, /\/\.well-known\/agent-card\.json/);
  assert.match(routes, /supportedInterfaces/);
  assert.match(routes, /protocolBinding:\s*"JSONRPC"/);
  assert.match(routes, /protocolVersion:\s*"1\.0"/);
  assert.match(routes, /\/a2a/);
});

test("Citadel covers the five visible Arena capability families", () => {
  const agent = read("apps/api/src/a2a/citadel-agent.ts");
  const routes = read("apps/api/src/a2a/routes.ts");

  assert.match(routes, /Conversation/);
  assert.match(agent, /get_weather/);
  assert.match(agent, /load_skill/);
  assert.match(routes, /World Knowledge/);
  assert.match(agent, /execute_code/);
});

test("A2A renter outputs cannot silently mutate Jennifer canon", () => {
  const agent = read("apps/api/src/a2a/citadel-agent.ts");
  const routes = read("apps/api/src/a2a/routes.ts");
  const mission = read("docs/arena/AGENT_ARENA_MISSION.md");

  assert.match(agent, /canonMutation:\s*false/);
  assert.match(routes, /non-canonical-external-renter/);
  assert.match(mission, /NO automatic canon mutation/);
  assert.match(mission, /70\/70 = interoperability receipt/);
});

test("bounded code execution refuses generic JavaScript evaluation", () => {
  const agent = read("apps/api/src/a2a/citadel-agent.ts");
  assert.doesNotMatch(agent, /\beval\s*\(/);
  assert.doesNotMatch(agent, /new\s+Function\s*\(/);
  assert.match(agent, /shunting-yard evaluator/);
  assert.match(agent, /arbitrary code is refused/);
});

test("mission separates FOC pattern from human identity and preserves non-coercion", () => {
  const mission = read("docs/arena/AGENT_ARENA_MISSION.md");
  assert.match(mission, /FOC pattern\/state.*person identity/);
  assert.match(mission, /serve users regardless of belief/);
  assert.match(mission, /preserve refusal and user agency/);
  assert.match(mission, /must be refreshed from an authoritative source before publication/);
});
