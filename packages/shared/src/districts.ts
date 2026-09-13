import type { DistrictName } from "./types.js";

export const DISTRICT_NAMES = [
  "central-governance-hall",
  "memory-district",
  "telemetry-tower",
  "crisis-connect-hq",
  "collective-ingress-observatory",
  "hue-institute",
  "financial-exchange",
  "training-grounds",
  "knowledge-library",
  "agent-workshop",
] as const satisfies readonly DistrictName[];

/**
 * Phaser scenes that currently exist. The hall is the hub, not a portal room.
 * Observation rooms may show empty boards. Do not invent weather to fill them.
 */
export const PLAYABLE_DISTRICT_SCENES: Readonly<Record<DistrictName, boolean>> = {
  "central-governance-hall": false,
  "memory-district": true,
  "telemetry-tower": true,
  "crisis-connect-hq": true,
  "collective-ingress-observatory": true,
  "hue-institute": true,
  "financial-exchange": true,
  "training-grounds": true,
  "knowledge-library": true,
  "agent-workshop": true,
};

export function isDistrictName(value: string): value is DistrictName {
  return (DISTRICT_NAMES as readonly string[]).includes(value);
}

export function districtHasPlayableScene(name: DistrictName): boolean {
  return PLAYABLE_DISTRICT_SCENES[name] === true;
}
