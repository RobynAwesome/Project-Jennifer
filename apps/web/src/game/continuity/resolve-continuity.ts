import {
  sanitizeContinuitySnapshot,
  type ContinuitySourceMode,
  type JenniferCityContinuitySnapshot,
} from "./session-store";

export interface ContinuityResolution {
  snapshot: JenniferCityContinuitySnapshot | null;
  sourceMode: ContinuitySourceMode;
  reason: string;
}

/**
 * Local-first Reliability bowl.
 *
 * - Same-browser Continue must survive API death.
 * - Continuity-store may refresh only when it is the same session and newer.
 * - sessionId and relationshipId stay distinct namespaces (PERN HOLD).
 */
export function resolveContinuitySnapshot(
  local: JenniferCityContinuitySnapshot | null,
  remote: JenniferCityContinuitySnapshot | null,
  remoteReachable: boolean,
): ContinuityResolution {
  const safeLocal = sanitizeContinuitySnapshot(local);
  const safeRemote = sanitizeContinuitySnapshot(remote);

  if (!remoteReachable || !safeRemote) {
    if (safeLocal) {
      return {
        snapshot: safeLocal,
        sourceMode: "local",
        reason: "API down or empty; local bowl kept.",
      };
    }
    return {
      snapshot: null,
      sourceMode: "unreachable",
      reason: "No local bowl and continuity-store unreachable.",
    };
  }

  if (!safeLocal) {
    return {
      snapshot: safeRemote,
      sourceMode: "continuity-store",
      reason: "No local bowl; admitted continuity-store snapshot only.",
    };
  }

  if (safeRemote.sessionId !== safeLocal.sessionId) {
    return {
      snapshot: safeLocal,
      sourceMode: "local",
      reason: "Remote sessionId mismatch; local bowl wins.",
    };
  }

  if (safeRemote.updatedAt > safeLocal.updatedAt) {
    return {
      snapshot: safeRemote,
      sourceMode: "continuity-store",
      reason: "Newer continuity-store snapshot for the same session.",
    };
  }

  return {
    snapshot: safeLocal,
    sourceMode: "local",
    reason: "Local bowl is newer or tied; API mirror is not authority.",
  };
}
