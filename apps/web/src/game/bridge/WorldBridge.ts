import {
  districtHasPlayableScene,
  isDistrictName,
  type DistrictName,
} from "@jennifer/shared";

export type WorldEventSourceMode = "in-memory" | "unreachable";

export interface DistrictEnterReceiptView {
  sourceMode: WorldEventSourceMode;
  district: DistrictName;
  playableScene: boolean;
  status: string;
  epTrace: readonly string[];
  summary: string;
}

/**
 * Browser seam to the runtime world-event heartbeat.
 *
 * Scene travel may continue if the API is down. That travel is presentation.
 * A missing receipt is not a successful world mutation.
 */
export class WorldBridge {
  constructor(private readonly apiBaseUrl = readGameApiBaseUrl()) {}

  async enterDistrict(
    actorId: string,
    districtId: string,
  ): Promise<DistrictEnterReceiptView> {
    if (!isDistrictName(districtId)) {
      return {
        sourceMode: "unreachable",
        district: "central-governance-hall",
        playableScene: false,
        status: "BLOCKED_LOCAL",
        epTrace: [],
        summary: "Portal id is not a governed DistrictName.",
      };
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/runtime/world-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          eventType: "district_entered",
          actorId,
          district: districtId,
        }),
      });
      const body = (await response.json()) as {
        receipt?: { status?: string; epTrace?: string[]; execution?: { effectSummary?: string } };
        playableScene?: boolean;
      };
      return {
        sourceMode: "in-memory",
        district: districtId,
        playableScene: body.playableScene === true,
        status: body.receipt?.status ?? `HTTP_${response.status}`,
        epTrace: body.receipt?.epTrace ?? [],
        summary:
          body.receipt?.execution?.effectSummary ??
          `World heartbeat returned ${body.receipt?.status ?? response.status}.`,
      };
    } catch {
      return {
        sourceMode: "unreachable",
        district: districtId,
        playableScene: districtHasPlayableScene(districtId),
        status: "UNREACHED",
        epTrace: [],
        summary: "Jennifer API unreachable. Scene travel is presentation only.",
      };
    }
  }
}

export function readGameApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_JENNIFER_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "http://127.0.0.1:3001";
}
