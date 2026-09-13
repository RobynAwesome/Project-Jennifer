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
 * Phaser scenes that currently exist. Defined districts stay visible as
 * coming-soon until a scene is admitted. Do not flip these to true to
 * decorate an empty room.
 */
export const PLAYABLE_DISTRICT_SCENES: Readonly<Record<DistrictName, boolean>> = {
  "central-governance-hall": false,
  "memory-district": true,
  "telemetry-tower": true,
  "crisis-connect-hq": false,
  "collective-ingress-observatory": false,
  "hue-institute": false,
  "financial-exchange": false,
  "training-grounds": false,
  "knowledge-library": false,
  "agent-workshop": false,
};

export function isDistrictName(value: string): value is DistrictName {
  return (DISTRICT_NAMES as readonly string[]).includes(value);
}

export function districtHasPlayableScene(name: DistrictName): boolean {
  return PLAYABLE_DISTRICT_SCENES[name] === true;
}
