import type { DistrictName } from "@jennifer/shared";

export interface ObservationRoomSpec {
  district: DistrictName;
  title: string;
  boardTitle: string;
  accent: number;
  npcName: string;
  npcRole: string;
  dialog: string[];
}

export const OBSERVATION_ROOM_SPECS: readonly ObservationRoomSpec[] = [
  {
    district: "crisis-connect-hq",
    title: "Crisis Connect HQ",
    boardTitle: "CRISIS BOARD  ·  JENNIFER API",
    accent: 0xef4444,
    npcName: "Kei",
    npcRole: "Duty Officer",
    dialog: [
      "This board is the Jennifer CrisisManager.",
      "The public product domain is still Zite until DNS cuts.",
      "Empty active crises is the honest count.",
    ],
  },
  {
    district: "collective-ingress-observatory",
    title: "Collective Ingress",
    boardTitle: "INGRESS BOARD  ·  OBSERVATION",
    accent: 0x06b6d4,
    npcName: "Orin",
    npcRole: "Signal Watch",
    dialog: [
      "Society does not owe us a story.",
      "No event ingested means no weather.",
      "Do not invent a holiday to fill the glass.",
    ],
  },
  {
    district: "hue-institute",
    title: "HUE Institute",
    boardTitle: "HUE BOARD  ·  DEFAULT STATE",
    accent: 0x3b82f6,
    npcName: "Nia",
    npcRole: "Human Weight",
    dialog: [
      "HUE tracks a human state when one is written.",
      "Observer is a placeholder, not a person.",
      "Do not treat a default as a diagnosis.",
    ],
  },
  {
    district: "financial-exchange",
    title: "Financial Exchange",
    boardTitle: "EXCHANGE BOARD  ·  NO MARKET FEED",
    accent: 0x10b981,
    npcName: "Voss",
    npcRole: "Ledger Watch",
    dialog: [
      "There is no ticker here.",
      "Financial ingress events stay empty until ingested.",
      "Persist mode is not a price.",
    ],
  },
  {
    district: "training-grounds",
    title: "Training Grounds",
    boardTitle: "YARD BOARD  ·  PERSONAS",
    accent: 0xa855f7,
    npcName: "Rook",
    npcRole: "Yard Marshal",
    dialog: [
      "Personas are listed. Drills are not invented.",
      "POC versus FOC is the Memory District terminal.",
      "Walk back when you have seen the list.",
    ],
  },
  {
    district: "knowledge-library",
    title: "Knowledge Library",
    boardTitle: "STACKS  ·  MEMORY RECEIPTS",
    accent: 0xf59e0b,
    npcName: "Quill",
    npcRole: "Stacks",
    dialog: [
      "Receipts live here. Lore does not.",
      "An empty shelf is still governed.",
      "Do not write a book to decorate the room.",
    ],
  },
  {
    district: "agent-workshop",
    title: "Agent Workshop",
    boardTitle: "BENCH  ·  COMPANION CATALOG",
    accent: 0x6366f1,
    npcName: "Hex",
    npcRole: "Bench",
    dialog: [
      "The catalog is readable.",
      "A listed companion is not spawned by walking in.",
      "Selection is a runtime act elsewhere.",
    ],
  },
];

export function observationRoomSpec(
  district: string,
): ObservationRoomSpec | undefined {
  return OBSERVATION_ROOM_SPECS.find((spec) => spec.district === district);
}
