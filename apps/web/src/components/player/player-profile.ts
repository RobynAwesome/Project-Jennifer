export type PlayerInputMode = "touch" | "keyboard-pointer";
export type PlayerQualityTier = "lite" | "standard" | "cinematic";

export interface PlayerProfile {
  inputMode: PlayerInputMode;
  qualityTier: PlayerQualityTier;
  reducedMotion: boolean;
  coarsePointer: boolean;
  hardwareConcurrency: number;
  deviceMemory?: number;
  devicePixelRatio: number;
}

export interface QualityPreset {
  maxPixelRatio: number;
  particleCount: number;
  antialias: boolean;
}

export const QUALITY_PRESETS: Readonly<Record<PlayerQualityTier, QualityPreset>> = {
  lite: { maxPixelRatio: 1, particleCount: 180, antialias: false },
  standard: { maxPixelRatio: 1.5, particleCount: 520, antialias: true },
  cinematic: { maxPixelRatio: 2, particleCount: 1000, antialias: true },
};

const TIER_ORDER: readonly PlayerQualityTier[] = ["lite", "standard", "cinematic"];

export function chooseInitialQuality(input: {
  reducedMotion: boolean;
  coarsePointer: boolean;
  hardwareConcurrency: number;
  deviceMemory?: number;
  viewportWidth: number;
}): PlayerQualityTier {
  if (input.reducedMotion || input.hardwareConcurrency <= 4 || (input.deviceMemory !== undefined && input.deviceMemory <= 4)) {
    return "lite";
  }
  if (!input.coarsePointer && input.hardwareConcurrency >= 8 && (input.deviceMemory === undefined || input.deviceMemory >= 8) && input.viewportWidth >= 1100) {
    return "cinematic";
  }
  return "standard";
}

export function nextQualityTier(current: PlayerQualityTier, averageFrameMs: number, reducedMotion: boolean): PlayerQualityTier {
  if (reducedMotion) return "lite";
  const index = TIER_ORDER.indexOf(current);
  if (averageFrameMs > 24 && index > 0) return TIER_ORDER[index - 1] ?? "lite";
  if (averageFrameMs < 14 && index < TIER_ORDER.length - 1) return TIER_ORDER[index + 1] ?? "cinematic";
  return current;
}

export function detectPlayerProfile(): PlayerProfile {
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const deviceMemory = navigatorWithMemory.deviceMemory;
  return {
    inputMode: coarsePointer || navigator.maxTouchPoints > 0 ? "touch" : "keyboard-pointer",
    qualityTier: chooseInitialQuality({ reducedMotion, coarsePointer, hardwareConcurrency, deviceMemory, viewportWidth: window.innerWidth }),
    reducedMotion,
    coarsePointer,
    hardwareConcurrency,
    deviceMemory,
    devicePixelRatio: window.devicePixelRatio || 1,
  };
}
