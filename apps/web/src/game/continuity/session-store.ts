import type {
  CompanionId,
  CompanionRelationshipLane,
  CompanionRenderMode,
  CompanionValidationReceipt,
  ConsequenceRevealReceipt,
} from "@jennifer/shared";

/** Browser + API continuity snapshot for Jennifer City love loop. */
export interface JenniferCityContinuitySnapshot {
  schemaVersion: 1;
  sessionId: string;
  persona?: string;
  playerName?: string;
  companionId?: CompanionId;
  companionName?: string;
  companionLogic?: string;
  companionLane?: CompanionRelationshipLane;
  companionRenderMode?: CompanionRenderMode;
  companionReceipt?: CompanionValidationReceipt;
  relationshipId?: string;
  questInstanceId?: string;
  questComplete?: boolean;
  questChoice?: string;
  episodeRevealId?: string;
  updatedAt: number;
}

export type ContinuitySourceMode =
  | "authoritative"
  | "continuity-store"
  | "local"
  | "unreachable";

const LOCAL_KEY = "jennifer.city.continuity.v1";

/**
 * Keep sessionId and relationshipId as distinct namespaces (PERN HOLD).
 * Never let a collapsed id silently become "admitted relationship authority."
 */
export function sanitizeContinuitySnapshot(
  snapshot: JenniferCityContinuitySnapshot | null | undefined,
): JenniferCityContinuitySnapshot | null {
  if (!snapshot || snapshot.schemaVersion !== 1 || !snapshot.sessionId) {
    return null;
  }
  if (
    snapshot.relationshipId &&
    snapshot.relationshipId === snapshot.sessionId
  ) {
    return { ...snapshot, relationshipId: undefined };
  }
  return snapshot;
}

export function readLocalContinuity(): JenniferCityContinuitySnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as JenniferCityContinuitySnapshot;
    return sanitizeContinuitySnapshot(parsed);
  } catch {
    return null;
  }
}

export function writeLocalContinuity(
  snapshot: JenniferCityContinuitySnapshot,
): void {
  if (typeof window === "undefined") return;
  const safe = sanitizeContinuitySnapshot(snapshot);
  if (!safe) return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(safe));
  } catch {
    // Quota / private mode — continuity falls back to API when available.
  }
}

export function clearLocalContinuity(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LOCAL_KEY);
  } catch {
    // ignore
  }
}

export function readLocalReveals(
  sessionId: string,
): ConsequenceRevealReceipt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(revealKey(sessionId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ConsequenceRevealReceipt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalReveal(
  sessionId: string,
  receipt: ConsequenceRevealReceipt,
): void {
  if (typeof window === "undefined") return;
  const existing = readLocalReveals(sessionId).filter(
    (entry) => entry.revealId !== receipt.revealId,
  );
  existing.push(receipt);
  try {
    window.localStorage.setItem(
      revealKey(sessionId),
      JSON.stringify(existing),
    );
  } catch {
    // ignore
  }
}

function revealKey(sessionId: string): string {
  return `jennifer.city.reveals.v1:${sessionId}`;
}
