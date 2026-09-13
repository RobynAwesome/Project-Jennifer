/**
 * KPGSthree.ts is Kopano's governed spatial-runtime layer over Three.js.
 * Jennifer City's admitted renderer is Phaser. Do not mount a second WebGL
 * root until a measured product receipt says the hall needs it.
 *
 * The classroom completes the public pavilion handoff names in Phaser.
 * Completing the room is an experiment receipt, not renderer admission.
 * KPGSthree.ts ships no Kage or Towers art — they are session teachers here.
 */
export const KPGS_THREE_HOLD = {
  package: "KPGSthree.ts",
  repository: "https://github.com/Kopano-Labs/KPGSthree.ts",
  jenniferRenderer: "phaser",
  disposition: "HOLD",
  autoMount: false,
  reasons: [
    "Phaser already owns /game scene authority",
    "GSMB Sprint 2 seeded KPGSthree as a separate spatial POC",
    "two WebGL roots are not a city upgrade",
  ],
} as const;

/** Blender handoff names from KPGSthree.ts first public pavilion contract. */
export const PAVILION_STATIONS = [
  "foundation",
  "columns",
  "beams",
  "roof",
] as const;

export type PavilionStation = (typeof PAVILION_STATIONS)[number];

export interface KpgsThreeClassroomReceipt {
  kind: "kpgs-three-classroom-experiment";
  sourceMode: "local-experiment";
  capabilityState: "not-verified";
  autoMount: false;
  renderer: "phaser";
  package: "KPGSthree.ts";
  stations: PavilionStation[];
  complete: boolean;
  completedAt?: string;
}

const CLASSROOM_KEY = "jennifer.city.kpgs-three-classroom.v1";

export function isPavilionStation(value: string): value is PavilionStation {
  return (PAVILION_STATIONS as readonly string[]).includes(value);
}

export function visitPavilionStation(
  visited: readonly PavilionStation[],
  station: PavilionStation,
): PavilionStation[] {
  if (visited.includes(station)) {
    return [...visited];
  }
  return [...visited, station];
}

export function classroomIsComplete(
  visited: readonly PavilionStation[],
): boolean {
  return PAVILION_STATIONS.every((station) => visited.includes(station));
}

export function createClassroomReceipt(
  visited: readonly PavilionStation[],
  now = new Date().toISOString(),
): KpgsThreeClassroomReceipt {
  const complete = classroomIsComplete(visited);
  return {
    kind: "kpgs-three-classroom-experiment",
    sourceMode: "local-experiment",
    capabilityState: "not-verified",
    autoMount: false,
    renderer: "phaser",
    package: "KPGSthree.ts",
    stations: [...visited],
    complete,
    completedAt: complete ? now : undefined,
  };
}

export function readClassroomReceipt(): KpgsThreeClassroomReceipt | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CLASSROOM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as KpgsThreeClassroomReceipt;
    if (parsed.kind !== "kpgs-three-classroom-experiment") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeClassroomReceipt(
  receipt: KpgsThreeClassroomReceipt,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLASSROOM_KEY, JSON.stringify(receipt));
  } catch {
    // Quota / private mode — scene still holds the receipt in registry.
  }
}
