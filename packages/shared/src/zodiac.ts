export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type ZodiacElement = "fire" | "earth" | "air" | "water";
export type ZodiacModality = "cardinal" | "fixed" | "mutable";

export type ZodiacSignalSource = "self-declared" | "birth-date-derived";

/**
 * Project Jennifer treats Western tropical sun signs as symbolic, user-facing
 * archetypes. They are not validated personality predictors, diagnoses, risk
 * scores or authority for consequential decisions.
 */
export type ZodiacEpistemicStatus = "symbolic-archetype-not-personality-fact";

export interface ZodiacDatePoint {
  month: number;
  day: number;
}

export interface ZodiacDateRange {
  start: ZodiacDatePoint;
  end: ZodiacDatePoint;
}

export interface ZodiacArchetype {
  sign: ZodiacSign;
  label: string;
  symbol: string;
  element: ZodiacElement;
  modality: ZodiacModality;
  conventionalDateRange: ZodiacDateRange;
  themes: readonly string[];
  relationalThemes: readonly string[];
  tensionThemes: readonly string[];
  epistemicStatus: ZodiacEpistemicStatus;
}

const STATUS: ZodiacEpistemicStatus =
  "symbolic-archetype-not-personality-fact";

/**
 * Popular Western tropical zodiac archetypes used for reflection, narrative
 * flavour and explicit user-authored identity language.
 *
 * Date ranges are the conventional popular-culture sun-sign ranges. Exact
 * astronomical ingress can vary by year, time and location; callers needing a
 * natal chart must use a dedicated astronomy/ephemeris source instead.
 */
export const ZODIAC_ARCHETYPES: readonly ZodiacArchetype[] = [
  {
    sign: "aries",
    label: "Aries",
    symbol: "♈",
    element: "fire",
    modality: "cardinal",
    conventionalDateRange: { start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
    themes: ["initiative", "directness", "momentum", "courage"],
    relationalThemes: ["candour", "playful pursuit", "independence", "shared action"],
    tensionThemes: ["impatience", "impulsivity", "conflict escalation"],
    epistemicStatus: STATUS,
  },
  {
    sign: "taurus",
    label: "Taurus",
    symbol: "♉",
    element: "earth",
    modality: "fixed",
    conventionalDateRange: { start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
    themes: ["stability", "sensory comfort", "patience", "steadiness"],
    relationalThemes: ["loyalty", "consistency", "physical comfort", "trust through repetition"],
    tensionThemes: ["stubbornness", "possessiveness", "resistance to change"],
    epistemicStatus: STATUS,
  },
  {
    sign: "gemini",
    label: "Gemini",
    symbol: "♊",
    element: "air",
    modality: "mutable",
    conventionalDateRange: { start: { month: 5, day: 21 }, end: { month: 6, day: 20 } },
    themes: ["curiosity", "language", "adaptability", "multiplicity"],
    relationalThemes: ["conversation", "mental stimulation", "humour", "variety"],
    tensionThemes: ["restlessness", "fragmented attention", "inconsistency"],
    epistemicStatus: STATUS,
  },
  {
    sign: "cancer",
    label: "Cancer",
    symbol: "♋",
    element: "water",
    modality: "cardinal",
    conventionalDateRange: { start: { month: 6, day: 21 }, end: { month: 7, day: 22 } },
    themes: ["home", "belonging", "memory", "care", "emotional security"],
    relationalThemes: ["loyalty", "nurturing", "private intimacy", "continuity", "being known"],
    tensionThemes: ["withdrawal", "overprotection", "holding onto the past", "defensive control"],
    epistemicStatus: STATUS,
  },
  {
    sign: "leo",
    label: "Leo",
    symbol: "♌",
    element: "fire",
    modality: "fixed",
    conventionalDateRange: { start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
    themes: ["expression", "warmth", "creativity", "visibility"],
    relationalThemes: ["devotion", "celebration", "romance", "recognition"],
    tensionThemes: ["pride", "validation hunger", "dramatic escalation"],
    epistemicStatus: STATUS,
  },
  {
    sign: "virgo",
    label: "Virgo",
    symbol: "♍",
    element: "earth",
    modality: "mutable",
    conventionalDateRange: { start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
    themes: ["discernment", "service", "craft", "precision"],
    relationalThemes: ["practical care", "reliability", "attention to detail", "improvement"],
    tensionThemes: ["overanalysis", "perfectionism", "criticality"],
    epistemicStatus: STATUS,
  },
  {
    sign: "libra",
    label: "Libra",
    symbol: "♎",
    element: "air",
    modality: "cardinal",
    conventionalDateRange: { start: { month: 9, day: 23 }, end: { month: 10, day: 22 } },
    themes: ["balance", "aesthetics", "reciprocity", "social calibration"],
    relationalThemes: ["partnership", "fairness", "dialogue", "mutual consideration"],
    tensionThemes: ["indecision", "conflict avoidance", "approval seeking"],
    epistemicStatus: STATUS,
  },
  {
    sign: "scorpio",
    label: "Scorpio",
    symbol: "♏",
    element: "water",
    modality: "fixed",
    conventionalDateRange: { start: { month: 10, day: 23 }, end: { month: 11, day: 21 } },
    themes: ["depth", "privacy", "transformation", "intensity"],
    relationalThemes: ["trust", "loyalty", "emotional depth", "truth seeking"],
    tensionThemes: ["suspicion", "jealousy", "control", "all-or-nothing thinking"],
    epistemicStatus: STATUS,
  },
  {
    sign: "sagittarius",
    label: "Sagittarius",
    symbol: "♐",
    element: "fire",
    modality: "mutable",
    conventionalDateRange: { start: { month: 11, day: 22 }, end: { month: 12, day: 21 } },
    themes: ["exploration", "meaning", "freedom", "optimism"],
    relationalThemes: ["shared discovery", "honesty", "space", "philosophical connection"],
    tensionThemes: ["overextension", "bluntness", "difficulty with constraint"],
    epistemicStatus: STATUS,
  },
  {
    sign: "capricorn",
    label: "Capricorn",
    symbol: "♑",
    element: "earth",
    modality: "cardinal",
    conventionalDateRange: { start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
    themes: ["structure", "responsibility", "ambition", "endurance"],
    relationalThemes: ["commitment", "earned trust", "reliability", "building a future"],
    tensionThemes: ["rigidity", "work over intimacy", "status pressure"],
    epistemicStatus: STATUS,
  },
  {
    sign: "aquarius",
    label: "Aquarius",
    symbol: "♒",
    element: "air",
    modality: "fixed",
    conventionalDateRange: { start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
    themes: ["originality", "systems", "community", "independence"],
    relationalThemes: ["friendship", "intellectual freedom", "shared causes", "nonconformity"],
    tensionThemes: ["detachment", "contrarianism", "emotional distance"],
    epistemicStatus: STATUS,
  },
  {
    sign: "pisces",
    label: "Pisces",
    symbol: "♓",
    element: "water",
    modality: "mutable",
    conventionalDateRange: { start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
    themes: ["imagination", "empathy", "spirituality", "permeability"],
    relationalThemes: ["compassion", "romance", "creative intimacy", "emotional attunement"],
    tensionThemes: ["idealisation", "avoidance", "boundary diffusion"],
    epistemicStatus: STATUS,
  },
] as const;

export function isZodiacSign(value: string): value is ZodiacSign {
  return ZODIAC_ARCHETYPES.some((profile) => profile.sign === value);
}

export function getZodiacArchetype(sign: ZodiacSign): ZodiacArchetype {
  const profile = ZODIAC_ARCHETYPES.find((candidate) => candidate.sign === sign);
  if (!profile) {
    throw new Error(`Unknown zodiac sign: ${sign}`);
  }
  return profile;
}

/**
 * Resolve the conventional Western tropical sun sign for a month/day pair.
 * This is deliberately not an astronomical natal-chart calculation.
 */
export function resolveConventionalSunSign(
  month: number,
  day: number
): ZodiacSign {
  assertMonthDay(month, day);
  const key = month * 100 + day;

  if (key >= 321 && key <= 419) return "aries";
  if (key >= 420 && key <= 520) return "taurus";
  if (key >= 521 && key <= 620) return "gemini";
  if (key >= 621 && key <= 722) return "cancer";
  if (key >= 723 && key <= 822) return "leo";
  if (key >= 823 && key <= 922) return "virgo";
  if (key >= 923 && key <= 1022) return "libra";
  if (key >= 1023 && key <= 1121) return "scorpio";
  if (key >= 1122 && key <= 1221) return "sagittarius";
  if (key >= 1222 || key <= 119) return "capricorn";
  if (key >= 120 && key <= 218) return "aquarius";
  return "pisces";
}

function assertMonthDay(month: number, day: number): void {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`month must be an integer from 1 to 12; received ${month}`);
  }

  const maxDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const maxDay = maxDays[month - 1]!;
  if (!Number.isInteger(day) || day < 1 || day > maxDay) {
    throw new RangeError(
      `day must be an integer from 1 to ${maxDay} for month ${month}; received ${day}`
    );
  }
}
