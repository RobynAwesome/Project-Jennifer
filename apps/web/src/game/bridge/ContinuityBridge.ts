import type { ConsequenceRevealReceipt } from "@jennifer/shared";
import {
  readLocalContinuity,
  readLocalReveals,
  writeLocalContinuity,
  writeLocalReveal,
  type ContinuitySourceMode,
  type JenniferCityContinuitySnapshot,
} from "../continuity/session-store";
import { readGameApiBaseUrl } from "./WorldBridge";

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
  }> {
    const local = readLocalContinuity();
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/runtime/game-continuity/${encodeURIComponent(sessionId)}`,
        { headers: { Accept: "application/json" } },
      );
      if (response.status === 404) {
        return {
          sourceMode: local ? "local" : "unreachable",
          snapshot: local,
        };
      }
      if (!response.ok) {
        return { sourceMode: "local", snapshot: local };
      }
      const body = (await response.json()) as {
        snapshot?: JenniferCityContinuitySnapshot;
        sourceMode?: ContinuitySourceMode;
      };
      if (body.snapshot) {
        writeLocalContinuity(body.snapshot);
        return {
          sourceMode: body.sourceMode === "continuity-store" ? "continuity-store" : "continuity-store",
          snapshot: body.snapshot,
        };
      }
      return { sourceMode: "local", snapshot: local };
    } catch {
      return {
        sourceMode: local ? "local" : "unreachable",
        snapshot: local,
      };
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
        { headers: { Accept: "application/json" } },
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
