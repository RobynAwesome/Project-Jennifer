import {
  now,
  type ID,
  type Timestamp,
  type ZodiacEpistemicStatus,
  type ZodiacSignalSource,
  type ZodiacSign,
} from "@jennifer/shared";

/**
 * Minimal profile-safe projection of a zodiac signal.
 *
 * The profile stores the admitted symbolic identity signal only. Raw birth-date
 * input is intentionally absent from this contract.
 */
export interface ZodiacProfileSignal {
  sign: ZodiacSign;
  source: ZodiacSignalSource;
  authority: "LOW_SYMBOLIC_CONTEXT";
  epistemicStatus: ZodiacEpistemicStatus;
  admittedAt: Timestamp;
}

export interface HumanSymbolicProfile {
  userId: ID;
  zodiac?: ZodiacProfileSignal;
  updatedAt: Timestamp;
}

export class SymbolicProfileStore {
  private readonly profiles = new Map<ID, HumanSymbolicProfile>();

  getProfile(userId: ID): HumanSymbolicProfile {
    const profile = this.profiles.get(userId);
    return profile
      ? this.clone(profile)
      : {
          userId,
          updatedAt: now(),
        };
  }

  admitZodiacSignal(
    userId: ID,
    signal: Omit<ZodiacProfileSignal, "admittedAt"> & {
      admittedAt?: Timestamp;
    }
  ): HumanSymbolicProfile {
    const profile: HumanSymbolicProfile = {
      ...this.getProfile(userId),
      zodiac: {
        sign: signal.sign,
        source: signal.source,
        authority: "LOW_SYMBOLIC_CONTEXT",
        epistemicStatus: signal.epistemicStatus,
        admittedAt: signal.admittedAt ?? now(),
      },
      updatedAt: now(),
    };

    this.profiles.set(userId, profile);
    return this.clone(profile);
  }

  clearZodiacSignal(userId: ID): HumanSymbolicProfile {
    const current = this.getProfile(userId);
    const { zodiac: _zodiac, ...withoutZodiac } = current;
    const profile: HumanSymbolicProfile = {
      ...withoutZodiac,
      updatedAt: now(),
    };
    this.profiles.set(userId, profile);
    return this.clone(profile);
  }

  private clone(profile: HumanSymbolicProfile): HumanSymbolicProfile {
    return {
      ...profile,
      zodiac: profile.zodiac ? { ...profile.zodiac } : undefined,
    };
  }
}
