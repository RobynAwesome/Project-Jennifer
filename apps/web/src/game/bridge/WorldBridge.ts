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
  pkaDisposition?: string;
  pkaState?: string;
  kpgsStatus?: string;
  kpgsAuthority?: string;
  glmSummary?: string;
  ccpReason?: string;
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
        pkaDisposition: "BLOCK",
        summary: "Portal id is not a governed DistrictName.",
      };
    }

    const trustedActorId = toTrustedActorId(actorId);

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/runtime/world-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          eventType: "district_entered",
          actorId: trustedActorId,
          district: districtId,
        }),
      });
      const body = (await response.json()) as {
        receipt?: {
          status?: string;
          epTrace?: string[];
          pka?: { disposition?: string; state?: string };
          kpgs?: { status?: string; authority?: string };
          glm?: { summary?: string };
          ccp?: { reason?: string };
          execution?: { effectSummary?: string };
        };
        playableScene?: boolean;
      };
      const receipt = body.receipt;
      const view: DistrictEnterReceiptView = {
        sourceMode: "in-memory",
        district: districtId,
        playableScene: body.playableScene === true,
        status: receipt?.status ?? `HTTP_${response.status}`,
        epTrace: receipt?.epTrace ?? [],
        pkaDisposition: receipt?.pka?.disposition,
        pkaState: receipt?.pka?.state,
        kpgsStatus: receipt?.kpgs?.status,
        kpgsAuthority: receipt?.kpgs?.authority,
        glmSummary: receipt?.glm?.summary,
        ccpReason: receipt?.ccp?.reason,
        summary:
          receipt?.execution?.effectSummary ??
          `World heartbeat returned ${receipt?.status ?? response.status}.`,
      };
      if (view.status === "EXECUTED") {
        void rememberVisit(this.apiBaseUrl, trustedActorId, districtId);
      }
      return view;
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

function toTrustedActorId(raw: string): string {
  const compact = raw
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9._:-]/g, "")
    .slice(0, 64);
  return compact || "player";
}

async function rememberVisit(
  apiBaseUrl: string,
  actorId: string,
  districtId: DistrictName,
): Promise<void> {
  try {
    await fetch(`${apiBaseUrl}/api/memory/store`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        kind: "episodic",
        subject: `district-visit:${districtId}`,
        content: {
          actorId,
          district: districtId,
          admission: "observed-gameplay",
          note: "Visit memory is observation, not canon.",
        },
        tags: ["jennifer-city", "district-visit", "observation"],
        confidence: 0.4,
        importance: 0.2,
      }),
    });
  } catch {
    // Scene travel continues. A missed GSMB write is not a successful mutation.
  }
}

export function readGameApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_JENNIFER_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "http://127.0.0.1:3001";
}
