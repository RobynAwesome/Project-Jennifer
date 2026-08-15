import {
  generateId,
  getZodiacArchetype,
  now,
  resolveConventionalSunSign,
  type ZodiacArchetype,
  type ZodiacSignalSource,
  type ZodiacSign,
} from "@jennifer/shared";

export type ZodiacContextStatus = "ACTIVE" | "WITHHELD" | "UNAVAILABLE";

export interface ZodiacContextInput {
  /** Highest-authority zodiac signal: what the human says their sign is. */
  selfDeclaredSign?: ZodiacSign;
  /** Optional month/day used only for conventional sun-sign derivation. */
  birthDate?: {
    month: number;
    day: number;
  };
  /** Required before Project Jennifer derives a sign from birth-date data. */
  birthDateConsent?: boolean;
}

export interface ZodiacSymbolicContext {
  sign: ZodiacSign;
  source: ZodiacSignalSource;
  archetype: ZodiacArchetype;
  authority: "LOW_SYMBOLIC_CONTEXT";
  interpretationClass: "SELF_REFLECTION_AND_NARRATIVE";
  priorityRule: "EXPLICIT_USER_PREFERENCE_AND_OBSERVED_BEHAVIOR_OUTRANK_ZODIAC";
  allowedUses: readonly [
    "self-reflection",
    "conversation-framing",
    "companion-flavour",
    "narrative-roleplay"
  ];
  prohibitedUses: readonly [
    "diagnosis",
    "eligibility-decision",
    "risk-score",
    "deterministic-personality-claim",
    "relationship-outcome-prediction"
  ];
}

export interface ZodiacContextReceipt {
  id: string;
  status: ZodiacContextStatus;
  source?: ZodiacSignalSource;
  sign?: ZodiacSign;
  consentRequired: boolean;
  consentSatisfied: boolean;
  birthDateRetained: false;
  personalityFactClaimed: false;
  reasons: string[];
  timestamp: number;
}

export interface ZodiacContextResult {
  status: ZodiacContextStatus;
  context?: ZodiacSymbolicContext;
  receipt: ZodiacContextReceipt;
}

/**
 * Builds an explicitly low-authority zodiac context for Project Jennifer.
 *
 * Governance rules:
 * - self-declared sign outranks date-derived classification;
 * - date derivation requires explicit consent;
 * - raw birth-date input is not retained in the result/receipt;
 * - zodiac symbolism may colour reflection/narrative, never determine truth,
 *   diagnosis, eligibility, risk, compatibility or relationship outcomes.
 */
export class ZodiacContextEngine {
  build(input: ZodiacContextInput): ZodiacContextResult {
    if (input.selfDeclaredSign) {
      return this.active(input.selfDeclaredSign, "self-declared", false, true, [
        "Current human self-description is the highest-authority zodiac signal.",
        "Zodiac context admitted only as symbolic self-reflection and narrative context.",
      ]);
    }

    if (input.birthDate) {
      if (input.birthDateConsent !== true) {
        return {
          status: "WITHHELD",
          receipt: this.receipt({
            status: "WITHHELD",
            consentRequired: true,
            consentSatisfied: false,
            reasons: [
              "Birth-date-derived zodiac context requires explicit consent.",
              "No sign was derived and raw birth-date input was not retained.",
            ],
          }),
        };
      }

      const sign = resolveConventionalSunSign(
        input.birthDate.month,
        input.birthDate.day
      );
      return this.active(sign, "birth-date-derived", true, true, [
        "Sign derived from the conventional Western tropical sun-sign date range with explicit consent.",
        "Exact natal-chart astronomy is outside this resolver and must use an ephemeris-aware source.",
      ]);
    }

    return {
      status: "UNAVAILABLE",
      receipt: this.receipt({
        status: "UNAVAILABLE",
        consentRequired: false,
        consentSatisfied: true,
        reasons: [
          "No self-declared sign or consented birth-date signal was supplied.",
        ],
      }),
    };
  }

  private active(
    sign: ZodiacSign,
    source: ZodiacSignalSource,
    consentRequired: boolean,
    consentSatisfied: boolean,
    reasons: string[]
  ): ZodiacContextResult {
    const archetype = getZodiacArchetype(sign);
    return {
      status: "ACTIVE",
      context: {
        sign,
        source,
        archetype,
        authority: "LOW_SYMBOLIC_CONTEXT",
        interpretationClass: "SELF_REFLECTION_AND_NARRATIVE",
        priorityRule:
          "EXPLICIT_USER_PREFERENCE_AND_OBSERVED_BEHAVIOR_OUTRANK_ZODIAC",
        allowedUses: [
          "self-reflection",
          "conversation-framing",
          "companion-flavour",
          "narrative-roleplay",
        ],
        prohibitedUses: [
          "diagnosis",
          "eligibility-decision",
          "risk-score",
          "deterministic-personality-claim",
          "relationship-outcome-prediction",
        ],
      },
      receipt: this.receipt({
        status: "ACTIVE",
        source,
        sign,
        consentRequired,
        consentSatisfied,
        reasons,
      }),
    };
  }

  private receipt(input: {
    status: ZodiacContextStatus;
    source?: ZodiacSignalSource;
    sign?: ZodiacSign;
    consentRequired: boolean;
    consentSatisfied: boolean;
    reasons: string[];
  }): ZodiacContextReceipt {
    return {
      id: generateId(),
      status: input.status,
      source: input.source,
      sign: input.sign,
      consentRequired: input.consentRequired,
      consentSatisfied: input.consentSatisfied,
      birthDateRetained: false,
      personalityFactClaimed: false,
      reasons: [...input.reasons],
      timestamp: now(),
    };
  }
}
