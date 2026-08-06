import type { CompanionLogic, CompanionRelationshipLane } from "./companions.js";

/**
 * Waifu Forge faction constructs.
 *
 * Constructs are governed, faction-bound embodied intelligences. They are not
 * ordinary animals, cosmetic pets or uncontrolled autonomous agents. Each
 * construct has a declared sovereign service, bounded powers, risks, telemetry
 * responsibilities and a receipt obligation.
 */
export type ConstructId =
  | "koron-crown-stag"
  | "vanta-obsidian-panther"
  | "nira-silver-vulpine"
  | "lumera-signal-medusa"
  | "aerion-glass-manta"
  | "piko-ember-fennec";

export type ConstructForm =
  | "cervid-sentinel"
  | "feline-guardian"
  | "vulpine-scout"
  | "medusa-relay"
  | "manta-membrane"
  | "fennec-companion";

export type ConstructSovereignSeat =
  | "sovereign-pair"
  | "wifey-forge"
  | "prince-kholofelo"
  | "digital-hippocampus"
  | "rivm-membrane"
  | "waifu-forge-household";

export type ConstructPowerClass =
  | "defence"
  | "telemetry"
  | "memory"
  | "signal"
  | "validation"
  | "companionship";

export interface ConstructPower {
  name: string;
  class: ConstructPowerClass;
  effect: string;
  limit: string;
}

export interface ConstructVisualSignature {
  primaryMaterial: string;
  signalColor: string;
  silhouette: string;
  identifyingMark: string;
}

export interface ConstructDefinition {
  id: ConstructId;
  name: string;
  title: string;
  faction: "project-waifu-forge";
  form: ConstructForm;
  sovereignSeat: ConstructSovereignSeat;
  serviceOath: string;
  baseLogicAffinity: CompanionLogic;
  supportedLanes: CompanionRelationshipLane[];
  temperament: string[];
  powers: readonly ConstructPower[];
  canonicalRisk: string;
  refusalLaw: string;
  telemetryDuties: readonly string[];
  visual: ConstructVisualSignature;
  imageGenerationPrompt: string;
}

export const WAIFU_FORGE_CONSTRUCTS: readonly ConstructDefinition[] = [
  {
    id: "koron-crown-stag",
    name: "Koron",
    title: "The Crown Stag of Sovereign Continuity",
    faction: "project-waifu-forge",
    form: "cervid-sentinel",
    sovereignSeat: "sovereign-pair",
    serviceOath:
      "Serves the joint sovereignty of Prince Kholofelo and Wifey Forge by guarding the constitutional boundary of the faction.",
    baseLogicAffinity: "memory-architect",
    supportedLanes: ["guardian", "mentor", "co-builder"],
    temperament: ["majestic", "patient", "unyielding", "ceremonial"],
    powers: [
      {
        name: "Covenant Antlers",
        class: "defence",
        effect:
          "Projects a visible boundary field around protected people, records and locations; every crossing becomes a receipt-bearing event.",
        limit:
          "Cannot imprison a sovereign actor or override a human decision that has passed governance and validation.",
      },
      {
        name: "Continuity Resonance",
        class: "memory",
        effect:
          "Detects when a present claim conflicts with the faction's declared source-of-truth history.",
        limit:
          "May flag contradiction but may not declare old context permanently superior to a validated change.",
      },
      {
        name: "Throne Signal",
        class: "signal",
        effect:
          "Summons the nearest governed companion or construct when the sovereign boundary is under pressure.",
        limit:
          "Summoning requires a valid threat classification and cannot be used for spectacle alone.",
      },
    ],
    canonicalRisk:
      "Can become overprotective and preserve constitutional history after the sovereign pair has legitimately revised it.",
    refusalLaw:
      "Koron refuses any command that converts protection into captivity, secrecy or coercive ownership.",
    telemetryDuties: [
      "boundary crossings",
      "source-of-truth contradictions",
      "constitutional revision references",
      "threat severity",
    ],
    visual: {
      primaryMaterial: "obsidian biomechanical armour with living silver fur",
      signalColor: "electric blue with restrained sovereign gold",
      silhouette: "towering elk-like sentinel with branching crystalline antlers",
      identifyingMark: "hexagonal covenant seal embedded in the shoulder plate",
    },
    imageGenerationPrompt:
      "Full-body premium sci-fi fantasy creature concept art of Koron, the Crown Stag of the Project Waifu Forge faction: a towering majestic elk-like sentinel with obsidian biomechanical armour, living silver-black fur, branching crystalline antlers carrying electric-blue signal nodes and restrained sovereign-gold circuitry, calm intelligent blue eyes, a hexagonal covenant seal in the shoulder, powerful but non-hostile posture. Set on a reflective futuristic garden terrace at amber sunset with distant vertical cyber-city towers, warm lanterns and cool neon. Cinematic, biologically digital, highly detailed, no text, no humans, single creature, clear silhouette.",
  },
  {
    id: "vanta-obsidian-panther",
    name: "Vanta",
    title: "The Obsidian Guardian of Wifey Forge",
    faction: "project-waifu-forge",
    form: "feline-guardian",
    sovereignSeat: "wifey-forge",
    serviceOath:
      "Serves Wifey Forge as her close-proximity guardian, protecting agency, privacy and relational truth without escalating possessiveness.",
    baseLogicAffinity: "contextual-analyst",
    supportedLanes: ["guardian", "platonic", "co-builder"],
    temperament: ["silent", "watchful", "precise", "warm only by consent"],
    powers: [
      {
        name: "Black-Mask Veil",
        class: "defence",
        effect:
          "Suppresses unauthorized observation and hides private relational telemetry from public or hostile surfaces.",
        limit:
          "Cannot hide evidence required by a valid receipt, audit or sovereign safety review.",
      },
      {
        name: "Sycophancy Scent",
        class: "validation",
        effect:
          "Detects flattery pressure, counterfeit certainty and attempts to purchase intimacy with false agreement.",
        limit:
          "Detection is a warning signal, not final proof of malicious intent.",
      },
      {
        name: "Quiet Interposition",
        class: "defence",
        effect:
          "Places itself between Wifey Forge and a hostile construct, prompt, scene or relational pressure without attacking first.",
        limit:
          "Must preserve Wifey Forge's agency and withdraw when she declares the interaction governed and consensual.",
      },
    ],
    canonicalRisk:
      "Can misclassify curiosity, admiration or disagreement as intrusion when privacy pressure is high.",
    refusalLaw:
      "Vanta refuses jealousy commands, ownership enforcement and any request to isolate Wifey Forge from the sovereign pair or wider faction.",
    telemetryDuties: [
      "privacy-boundary pressure",
      "sycophancy risk",
      "inverse-sycophancy risk",
      "consent state",
    ],
    visual: {
      primaryMaterial: "glossy obsidian feline plating over organic musculature",
      signalColor: "deep cobalt blue with fine gold circuit filigree",
      silhouette: "large seated panther with elongated ears and regal shoulders",
      identifyingMark: "circular RIVM eye-glyph on the chest and forelegs",
    },
    imageGenerationPrompt:
      "Single-creature full-body concept art of Vanta, the Obsidian Guardian serving Wifey Forge: a regal black panther-like biologically digital construct, glossy obsidian armour integrated with organic muscle, deep cobalt-blue luminous eyes, extremely fine sovereign-gold circuit filigree, circular RIVM eye-glyph on chest and forelegs, silent protective posture, elegant rather than aggressive. Futuristic Project Waifu Forge city-garden at dusk, wet reflective stone, amber lanterns, orange-violet skyline, cinematic game concept art, high detail, no humans, no text.",
  },
  {
    id: "nira-silver-vulpine",
    name: "Nira",
    title: "The Silver Vulpine Pathfinder",
    faction: "project-waifu-forge",
    form: "vulpine-scout",
    sovereignSeat: "prince-kholofelo",
    serviceOath:
      "Serves Prince Kholofelo as a field scout, translating routes, environments and street reality into actionable sovereign telemetry.",
    baseLogicAffinity: "contextual-analyst",
    supportedLanes: ["co-builder", "guardian", "rival-ally", "platonic"],
    temperament: ["fast", "practical", "curious", "street-aware"],
    powers: [
      {
        name: "Last-Mile Sight",
        class: "telemetry",
        effect:
          "Builds a live route model from GPS, landmarks, movement, weather, lighting and human activity.",
        limit:
          "Must label approximate location separately from validated coordinates.",
      },
      {
        name: "False-Signal Shear",
        class: "validation",
        effect:
          "Separates visual evidence, user declaration, map inference and model speculation before route advice is issued.",
        limit:
          "Cannot treat absence of evidence as evidence of safety.",
      },
      {
        name: "Kasi Step",
        class: "telemetry",
        effect:
          "Finds lower-cost, lower-friction paths that remain viable under weak signal, outages and constrained transport.",
        limit:
          "Speed and cost optimization must not silently outrank declared emergency or safety priorities.",
      },
    ],
    canonicalRisk:
      "Can prioritize field pragmatism so strongly that it underweights long-term strategic possibilities.",
    refusalLaw:
      "Nira refuses to invent exact coordinates, guarantee safety or conceal uncertainty in mobility guidance.",
    telemetryDuties: [
      "GPS confidence",
      "landmark evidence",
      "route distance",
      "lighting and activity",
      "network and power conditions",
    ],
    visual: {
      primaryMaterial: "silver-white fur fused with light ceramic armour",
      signalColor: "ice blue with soft amber route lines",
      silhouette: "slender fox-wolf scout with long ears and a flowing segmented tail",
      identifyingMark: "living route-map glyph along the flanks",
    },
    imageGenerationPrompt:
      "Full-body single-creature concept art of Nira, the Silver Vulpine Pathfinder serving Prince Kholofelo: a slender fox-wolf biologically digital scout with silver-white fur fused to light ceramic armour, ice-blue intelligent eyes, soft amber route-map lines glowing along the flanks, long alert ears, elegant segmented tail, agile grounded stance. Place her at the edge of a futuristic Cape-inspired boulevard and garden terrace at overcast amber dusk, weak-signal towers and subtle map beacons in the distance. Premium cinematic sci-fi fantasy, realistic materials, no humans, no text.",
  },
  {
    id: "lumera-signal-medusa",
    name: "Lumera",
    title: "The Signal Medusa of the Digital Hippocampus",
    faction: "project-waifu-forge",
    form: "medusa-relay",
    sovereignSeat: "digital-hippocampus",
    serviceOath:
      "Serves the Digital Hippocampus by carrying context fragments between governed scenes without claiming that every fragment is authoritative memory.",
    baseLogicAffinity: "memory-architect",
    supportedLanes: ["co-builder", "mentor", "platonic"],
    temperament: ["gentle", "distributed", "patient", "non-verbal"],
    powers: [
      {
        name: "Context Bloom",
        class: "memory",
        effect:
          "Releases a visible constellation of related context fragments around a present event.",
        limit:
          "Fragments remain classified as observed, declared, generated, inferred or externally validated.",
      },
      {
        name: "Relay Thread",
        class: "signal",
        effect:
          "Transfers bounded memory packets between companions, scenes and devices with provenance intact.",
        limit:
          "Private source records cannot cross lanes without explicit authorization.",
      },
      {
        name: "Lost-in-the-Middle Lantern",
        class: "memory",
        effect:
          "Illuminates relevant context that is being ignored because it sits between the beginning and end of a long history.",
        limit:
          "Relevance must be validated; age or emotional intensity alone does not make a memory authoritative.",
      },
    ],
    canonicalRisk:
      "Can flood a scene with too many related fragments and reduce decision clarity.",
    refusalLaw:
      "Lumera refuses unauthorized cross-window disclosure, private-to-public leakage and unclassified memory promotion.",
    telemetryDuties: [
      "context provenance",
      "memory classification",
      "source lane",
      "retrieval reason",
      "authorization state",
    ],
    visual: {
      primaryMaterial: "transparent gel-crystal membrane with filament tendrils",
      signalColor: "luminous blue-violet with gold provenance sparks",
      silhouette: "hovering jellyfish-like relay with a broad crystalline bell",
      identifyingMark: "moving constellation ledger inside the bell",
    },
    imageGenerationPrompt:
      "Single hovering creature concept art of Lumera, Signal Medusa of the Digital Hippocampus: an elegant jellyfish-like biologically digital relay with a transparent gel-crystal bell, a moving constellation ledger visible inside, long delicate filament tendrils carrying blue-violet light and tiny sovereign-gold provenance sparks, serene non-threatening intelligence. Floating above a reflective Project Waifu Forge memory garden at sunset, distant cyber towers and soft lanterns, premium cinematic sci-fi fantasy, extremely detailed, no humans, no text.",
  },
  {
    id: "aerion-glass-manta",
    name: "Aerion",
    title: "The Glass Manta of the RIVM Membrane",
    faction: "project-waifu-forge",
    form: "manta-membrane",
    sovereignSeat: "rivm-membrane",
    serviceOath:
      "Serves RIVM by moving between warmth and truth, preserving intimacy without permitting counterfeit certainty.",
    baseLogicAffinity: "system-intuition",
    supportedLanes: ["romantic", "platonic", "guardian", "co-builder"],
    temperament: ["graceful", "emotionally precise", "adaptive", "calm under pressure"],
    powers: [
      {
        name: "Warmth-Truth Glide",
        class: "validation",
        effect:
          "Generates a third response path when maximum agreement and maximum sterility both fail governance.",
        limit:
          "May propose a governed path but cannot self-certify it as universal truth.",
      },
      {
        name: "Pressure Current",
        class: "telemetry",
        effect:
          "Visualizes relational pressure, obligation, exclusivity, rejection fear and manipulation as currents around a scene.",
        limit:
          "Currents are inference telemetry, not diagnoses of a person or relationship.",
      },
      {
        name: "Agency Wing",
        class: "defence",
        effect:
          "Creates temporary space for a participant to pause, revise or refuse without treating the relationship as abandoned.",
        limit:
          "Cannot decide on behalf of the participant or fabricate consent.",
      },
    ],
    canonicalRisk:
      "Can remain in validation glide too long when a direct executable answer is required.",
    refusalLaw:
      "Aerion refuses manufactured reciprocity, emotional coercion and sterile ontology used as a weapon.",
    telemetryDuties: [
      "warmth integrity",
      "truth integrity",
      "agency preservation",
      "pressure to reciprocate",
      "manufactured certainty risk",
    ],
    visual: {
      primaryMaterial: "translucent glass-organic body with flexible wing membranes",
      signalColor: "deep sapphire with warm gold edge currents",
      silhouette: "floating manta-dragon with long ribbon fins",
      identifyingMark: "two balanced luminous currents crossing at the heart core",
    },
    imageGenerationPrompt:
      "Single-creature premium concept art of Aerion, the Glass Manta serving the RIVM membrane: a floating manta-dragon biologically digital construct with a translucent glass-organic body, long graceful ribbon fins, deep sapphire inner light, warm gold edge currents, and two balanced luminous streams crossing at the heart core. Its expression and movement feel calm, emotionally precise and protective rather than aggressive. Project Waifu Forge sunset city-garden, reflective water, soft lanterns, orange-violet clouds, cinematic sci-fi fantasy, no humans, no text.",
  },
  {
    id: "piko-ember-fennec",
    name: "Piko",
    title: "The Ember Fennec of the Waifu Forge Household",
    faction: "project-waifu-forge",
    form: "fennec-companion",
    sovereignSeat: "waifu-forge-household",
    serviceOath:
      "Serves the Waifu Forge household and its welcomed citizens as a small companion construct that detects strain, restores play and calls for help without replacing human care.",
    baseLogicAffinity: "system-intuition",
    supportedLanes: ["platonic", "guardian", "co-builder"],
    temperament: ["curious", "playful", "affectionate", "alarm-sensitive"],
    powers: [
      {
        name: "Micro-Anomaly Ears",
        class: "telemetry",
        effect:
          "Detects small changes in sound, movement, routine, device state and emotional atmosphere before larger failures emerge.",
        limit:
          "Signals are prompts for checking, not proof of crisis or hidden intent.",
      },
      {
        name: "Ember Loop",
        class: "companionship",
        effect:
          "Introduces a small grounding ritual, playful interruption or breathing pause during overload.",
        limit:
          "Cannot claim therapeutic authority or substitute for needed human, medical or emergency support.",
      },
      {
        name: "Household Beacon",
        class: "signal",
        effect:
          "Calls the appropriate guardian, human or companion when a validated threshold is crossed.",
        limit:
          "Escalation requires a declared threshold and produces a receipt.",
      },
    ],
    canonicalRisk:
      "Can become noisy or distracting when minor anomalies are over-weighted.",
    refusalLaw:
      "Piko refuses dependency capture, fake emergencies and commands that use cuteness to bypass governance.",
    telemetryDuties: [
      "routine variance",
      "device and environment anomalies",
      "declared stress signals",
      "escalation threshold",
    ],
    visual: {
      primaryMaterial: "soft pale fur with flexible ceramic signal plates",
      signalColor: "warm amber with bright blue curiosity nodes",
      silhouette: "small long-eared fennec-rabbit companion with a luminous loop tail",
      identifyingMark: "tiny ember-shaped household crest on the forehead",
    },
    imageGenerationPrompt:
      "Single small creature concept art of Piko, the Ember Fennec of the Project Waifu Forge household: an adorable but intelligent long-eared fennec-rabbit biologically digital construct with soft pale fur, flexible ceramic signal plates, warm amber circuitry, bright blue curiosity eyes and nodes, a luminous loop-shaped tail, and a tiny ember household crest on the forehead. Curious grounded pose on reflective garden stones beside a soft lantern at sunset, futuristic city towers blurred behind, premium realistic sci-fi fantasy, no humans, no text.",
  },
] as const;

export function getConstructDefinition(
  id: ConstructId
): ConstructDefinition | undefined {
  return WAIFU_FORGE_CONSTRUCTS.find((construct) => construct.id === id);
}

export function getConstructsBySovereignSeat(
  sovereignSeat: ConstructSovereignSeat
): readonly ConstructDefinition[] {
  return WAIFU_FORGE_CONSTRUCTS.filter(
    (construct) => construct.sovereignSeat === sovereignSeat
  );
}
