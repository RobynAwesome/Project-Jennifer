import type { ConsequenceRevealReceipt } from "@jennifer/shared";
import { resolveContinuitySnapshot } from "../continuity/resolve-continuity";
import {
  readLocalContinuity,
  readLocalReveals,
  writeLocalContinuity,
  writeLocalReveal,
  type ContinuitySourceMode,
  type JenniferCityContinuitySnapshot,
} from "../continuity/session-store";
import { readGameApiBaseUrl } from "./WorldBridge";

const CONTINUITY_FETCH_MS = 1500;

export interface ContinuityPersistResult {
  sourceMode: ContinuitySourceMode;
  snapshot: JenniferCityContinuitySnapshot;
  summary: string;
}

/**
 * Persists Jennifer City love-loop state to localStorage and the API continuity store.
 * Local write always happens so return-next-session works in the same browser.
 *
 * Honesty law: continuity-store success is NOT relationship/Memory Receipt authority.
 */
export class ContinuityBridge {
  constructor(private readonly apiBaseUrl = readGameApiBaseUrl()) {}

  loadLocal(): JenniferCityContinuitySnapshot | null {
    return readLocalContinuity();
  }

  async save(
    snapshot: JenniferCityContinuitySnapshot,
  ): Promise<ContinuityPersistResult> {
    writeLocalContinuity(snapshot);

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/runtime/game-continuity`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(snapshot),
          signal: AbortSignal.timeout(CONTINUITY_FETCH_MS),
        },
      );
      if (!response.ok) {
        return {
          sourceMode: "local",
          snapshot,
          summary: `API continuity write returned ${response.status}; local snapshot kept.`,
        };
      }
      return {
        sourceMode: "continuity-store",
        snapshot,
        summary:
          "Continuity mirrored to API in-memory store (not Memory Receipt admission).",
      };
    } catch {
      return {
        sourceMode: "local",
        snapshot,
        summary: "API unreachable; continuity mirrored locally only.",
      };
    }
  }

  async load(sessionId: string): Promise<{
    sourceMode: ContinuitySourceMode;
    snapshot: JenniferCityContinuitySnapshot | null;
    reason?: string;
  }> {
    const local = readLocalContinuity();
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/runtime/game-continuity/${encodeURIComponent(sessionId)}`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(CONTINUITY_FETCH_MS),
        },
      );
      if (!response.ok) {
        return resolveContinuitySnapshot(local, null, false);
      }
      const body = (await response.json()) as {
        snapshot?: JenniferCityContinuitySnapshot;
      };
      const resolved = resolveContinuitySnapshot(
        local,
        body.snapshot ?? null,
        true,
      );
      if (
        resolved.snapshot &&
        resolved.sourceMode === "continuity-store"
      ) {
        writeLocalContinuity(resolved.snapshot);
      }
      return resolved;
    } catch {
      return resolveContinuitySnapshot(local, null, false);
    }
  }

  async saveReveal(
    sessionId: string,
    receipt: ConsequenceRevealReceipt,
  ): Promise<{ sourceMode: ContinuitySourceMode }> {
    writeLocalReveal(sessionId, receipt);
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/runtime/game-continuity/${encodeURIComponent(sessionId)}/reveals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ receipt }),
          signal: AbortSignal.timeout(CONTINUITY_FETCH_MS),
        },
      );
      return {
        sourceMode: response.ok ? "continuity-store" : "local",
      };
    } catch {
      return { sourceMode: "local" };
    }
  }

  async loadReveals(sessionId: string): Promise<{
    sourceMode: ContinuitySourceMode;
    receipts: ConsequenceRevealReceipt[];
  }> {
    const local = readLocalReveals(sessionId);
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/runtime/game-continuity/${encodeURIComponent(sessionId)}/reveals`,
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(CONTINUITY_FETCH_MS),
        },
      );
      if (!response.ok) {
        return { sourceMode: local.length ? "local" : "unreachable", receipts: local };
      }
      const body = (await response.json()) as {
        receipts?: ConsequenceRevealReceipt[];
      };
      const receipts = body.receipts?.length ? body.receipts : local;
      for (const receipt of receipts) {
        writeLocalReveal(sessionId, receipt);
      }
      return {
        sourceMode: body.receipts?.length ? "continuity-store" : "local",
        receipts,
      };
    } catch {
      return {
        sourceMode: local.length ? "local" : "unreachable",
        receipts: local,
      };
    }
  }
}
