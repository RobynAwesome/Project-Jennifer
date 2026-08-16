import type { HumanSymbolicProfile } from "@jennifer/hue";
import {
  generateId,
  now,
  type BehavioralProfile,
  type CompanionDefinition,
  type CompanionSelection,
  type HumanState,
  type ID,
  type Timestamp,
} from "@jennifer/shared";

export const HUMAN_CONTEXT_PRIORITY = [
  "explicit-player-preference",
  "observed-behavioral-evidence",
  "self-declared-zodiac-symbol",
  "birth-date-derived-zodiac-symbol",
  "generic-zodiac-archetype",
] as const;

export type HumanContextAuthorityLayer =
  (typeof HUMAN_CONTEXT_PRIORITY)[number];

export interface HumanContextPacketInput {
  userId: ID;
  humanState: HumanState;
  behavioralProfile: BehavioralProfile;
  symbolicProfile: HumanSymbolicProfile;
  companionSelection?: CompanionSelection;
  companion?: CompanionDefinition;
}

export interface HumanContextPacketReceipt {
  id: ID;
  userId: ID;
  hueBound: boolean;
  behavioralProfileBound: boolean;
  zodiacAdmitted: boolean;
  zodiacAuthorityPreserved: boolean;
  companionBound: boolean;
  priorityRuleEnforced: boolean;
  rivmBoundaryEnforced: boolean;
  reasons: string[];
  timestamp: Timestamp;
}

export interface HumanContextPacket {
  userId: ID;
  builtAt: Timestamp;
  hue: HumanState;
  playerProfile: {
    preferences: Record<string, unknown>;
    adaptations: BehavioralProfile["adaptations"];
    interactionHistory: number;
    zodiac?: HumanSymbolicProfile["zodiac"];
  };
  companion?: {
    id: CompanionDefinition["id"];
    name: string;
    baseLogic: CompanionDefinition["baseLogic"];
    relationshipLane: CompanionSelection["relationshipLane"];
    renderMode: CompanionSelection["renderMode"];
    contextSensitivity: number;
    truthStrictness: number;
  };
  governance: {
    priorityOrder: typeof HUMAN_CONTEXT_PRIORITY;
    zodiac: {
      authority: "LOW_SYMBOLIC_CONTEXT";
      mayColourCompanionFlavour: boolean;
      mayOverrideExplicitPreference: false;
      mayOverrideObservedBehavior: false;
      mayBecomePersonalityFact: false;
      mayPredictRelationshipOutcome: false;
    };
    rivm: {
      claimClass: "INFERENCE_OR_SYMBOLIC_CONTEXT_NOT_FACT";
      preserveHumanCorrection: true;
      preserveAgency: true;
      prohibitOntologyInflation: true;
      prohibitManufacturedCertainty: true;
    };
  };
  receipt: HumanContextPacketReceipt;
}

/**
 * Composes the smallest governed context packet needed by Jennifer/companions.
 *
 * It does not infer a zodiac sign, persist raw birth data, or turn symbolic
 * archetypes into personality truth. Zodiac admission must already have passed
 * through ZodiacContextEngine + the HUE SymbolicProfileStore.
 */
export class HumanContextPacketEngine {
  build(input: HumanContextPacketInput): HumanContextPacket {
    this.assertUserBinding(input);
    this.assertCompanionBinding(input);

    const zodiac = input.symbolicProfile.zodiac
      ? { ...input.symbolicProfile.zodiac }
      : undefined;
    const companion =
      input.companionSelection && input.companion
        ? {
            id: input.companion.id,
            name: input.companion.name,
            baseLogic: input.companion.baseLogic,
            relationshipLane: input.companionSelection.relationshipLane,
            renderMode: input.companionSelection.renderMode,
            contextSensitivity: input.companion.telemetry.contextSensitivity,
            truthStrictness: input.companion.telemetry.truthStrictness,
          }
        : undefined;

    const reasons = [
      "HUE state and behavioral profile were bound to the same user before composition.",
      "Explicit player preferences and observed behavioral evidence outrank zodiac symbolism.",
      zodiac
        ? `Admitted ${zodiac.sign} from ${zodiac.source} as LOW_SYMBOLIC_CONTEXT only.`
        : "No zodiac signal was admitted to this packet.",
      companion
        ? `Bound companion ${companion.name} in the ${companion.relationshipLane} lane without changing zodiac authority.`
        : "No active companion was bound to this packet.",
      "RIVM boundary keeps symbolic/inferred context separate from factual personality claims and relationship predictions.",
    ];

    const receipt: HumanContextPacketReceipt = {
      id: generateId(),
      userId: input.userId,
      hueBound: true,
      behavioralProfileBound: true,
      zodiacAdmitted: Boolean(zodiac),
      zodiacAuthorityPreserved:
        zodiac === undefined || zodiac.authority === "LOW_SYMBOLIC_CONTEXT",
      companionBound: Boolean(companion),
      priorityRuleEnforced: true,
      rivmBoundaryEnforced: true,
      reasons,
      timestamp: now(),
    };

    return {
      userId: input.userId,
      builtAt: receipt.timestamp,
      hue: { ...input.humanState },
      playerProfile: {
        preferences: { ...input.behavioralProfile.preferences },
        adaptations: input.behavioralProfile.adaptations.map((adaptation) => ({
          ...adaptation,
        })),
        interactionHistory: input.behavioralProfile.interactionHistory,
        zodiac,
      },
      companion,
      governance: {
        priorityOrder: HUMAN_CONTEXT_PRIORITY,
        zodiac: {
          authority: "LOW_SYMBOLIC_CONTEXT",
          mayColourCompanionFlavour: Boolean(zodiac && companion),
          mayOverrideExplicitPreference: false,
          mayOverrideObservedBehavior: false,
          mayBecomePersonalityFact: false,
          mayPredictRelationshipOutcome: false,
        },
        rivm: {
          claimClass: "INFERENCE_OR_SYMBOLIC_CONTEXT_NOT_FACT",
          preserveHumanCorrection: true,
          preserveAgency: true,
          prohibitOntologyInflation: true,
          prohibitManufacturedCertainty: true,
        },
      },
      receipt,
    };
  }

  private assertUserBinding(input: HumanContextPacketInput): void {
    const mismatches = [
      ["humanState", input.humanState.userId],
      ["behavioralProfile", input.behavioralProfile.userId],
      ["symbolicProfile", input.symbolicProfile.userId],
    ].filter(([, userId]) => userId !== input.userId);

    if (mismatches.length > 0) {
      throw new HumanContextPacketError(
        "HCP-USER-BINDING",
        `Context sources must belong to ${input.userId}; mismatched: ${mismatches
          .map(([source]) => source)
          .join(", ")}`
      );
    }

    if (
      input.companionSelection &&
      input.companionSelection.userId !== input.userId
    ) {
      throw new HumanContextPacketError(
        "HCP-COMPANION-USER",
        "Active companion selection belongs to a different user."
      );
    }
  }

  private assertCompanionBinding(input: HumanContextPacketInput): void {
    if (Boolean(input.companionSelection) !== Boolean(input.companion)) {
      throw new HumanContextPacketError(
        "HCP-COMPANION-PARTIAL",
        "Companion selection and companion definition must be supplied together."
      );
    }

    if (
      input.companionSelection &&
      input.companion &&
      input.companionSelection.companionId !== input.companion.id
    ) {
      throw new HumanContextPacketError(
        "HCP-COMPANION-MISMATCH",
        "Companion selection does not match the supplied companion definition."
      );
    }
  }
}

export class HumanContextPacketError extends Error {
  constructor(
    readonly code:
      | "HCP-USER-BINDING"
      | "HCP-COMPANION-USER"
      | "HCP-COMPANION-PARTIAL"
      | "HCP-COMPANION-MISMATCH",
    message: string
  ) {
    super(message);
    this.name = "HumanContextPacketError";
  }
}
