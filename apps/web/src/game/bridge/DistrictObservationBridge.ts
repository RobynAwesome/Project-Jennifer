import { readGameApiBaseUrl } from "./WorldBridge";
import type { DistrictName } from "@jennifer/shared";

export interface DistrictBoard {
  sourceMode: "in-memory" | "unreachable";
  lines: string[];
}

type JsonRecord = Record<string, unknown>;

async function readJson(url: string): Promise<JsonRecord> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  return (await response.json()) as JsonRecord;
}

function count(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

/**
 * Read-only boards for admitted observation rooms.
 * Missing routes stay labelled. Empty stores stay empty.
 */
export class DistrictObservationBridge {
  constructor(private readonly apiBaseUrl = readGameApiBaseUrl()) {}

  async readBoard(district: DistrictName): Promise<DistrictBoard> {
    try {
      switch (district) {
        case "crisis-connect-hq":
          return await this.readCrisis();
        case "collective-ingress-observatory":
          return await this.readIngress();
        case "hue-institute":
          return await this.readHue();
        case "financial-exchange":
          return await this.readFinancial();
        case "training-grounds":
          return await this.readTraining();
        case "knowledge-library":
          return await this.readLibrary();
        case "agent-workshop":
          return await this.readWorkshop();
        default:
          return {
            sourceMode: "in-memory",
            lines: [
              "No observation board for this district.",
              "Use the dedicated scene instead.",
            ],
          };
      }
    } catch {
      return {
        sourceMode: "unreachable",
        lines: [
          "Jennifer API unreachable.",
          "Room is labelled observation-only.",
          "A blank board is not world weather.",
        ],
      };
    }
  }

  private async readCrisis(): Promise<DistrictBoard> {
    const [list, dashboard] = await Promise.all([
      readJson(`${this.apiBaseUrl}/api/crisis`),
      readJson(`${this.apiBaseUrl}/api/crisis/dashboard`),
    ]);
    const active = count(list.crises);
    const dash = dashboard as { total?: number };
    return {
      sourceMode: "in-memory",
      lines: [
        `active crises   ${dash.total ?? active}`,
        "This is the Jennifer API CrisisManager.",
        "crisisconnect.kopanolabs.com stays Zite until DNS cut.",
        "Empty is the honest count.",
      ],
    };
  }

  private async readIngress(): Promise<DistrictBoard> {
    const body = await readJson(`${this.apiBaseUrl}/api/ingress`);
    return {
      sourceMode: "in-memory",
      lines: [
        `events     ${body.count ?? count(body.events)}`,
        `sentiment  ${String(body.aggregateSentiment ?? 0)}`,
        `modifier   ${String(body.behaviourModifier ?? 1)}`,
        String(body.note ?? "Collective ingress, observation only."),
      ],
    };
  }

  private async readHue(): Promise<DistrictBoard> {
    const body = await readJson(`${this.apiBaseUrl}/api/hue`);
    const state = (body.state ?? {}) as JsonRecord;
    return {
      sourceMode: "in-memory",
      lines: [
        `subject     ${String(body.userId ?? "observer")}`,
        `emotion     ${String(state.emotionalState ?? "unknown")}`,
        `engagement  ${String(state.engagementScore ?? "n/a")}`,
        `stress      ${String(state.stressLevel ?? "n/a")}`,
        String(body.note ?? "HUE default state. Not a person claim."),
      ],
    };
  }

  private async readFinancial(): Promise<DistrictBoard> {
    const [ingress, health] = await Promise.all([
      readJson(`${this.apiBaseUrl}/api/ingress`),
      readJson(`${this.apiBaseUrl}/health`),
    ]);
    const events = Array.isArray(ingress.events) ? ingress.events : [];
    const financial = events.filter(
      (event) =>
        typeof event === "object" &&
        event !== null &&
        "category" in event &&
        event.category === "financial",
    );
    const persistence = (health.persistence ?? {}) as JsonRecord;
    return {
      sourceMode: "in-memory",
      lines: [
        `financial ingress events  ${financial.length}`,
        `persist                   ${String(persistence.mode ?? "unknown")}`,
        "No market feed is wired.",
        "Empty is the honest number.",
      ],
    };
  }

  private async readTraining(): Promise<DistrictBoard> {
    const body = await readJson(`${this.apiBaseUrl}/api/runtime/personas`);
    return {
      sourceMode: "in-memory",
      lines: [
        `persona definitions  ${count(body.personas)}`,
        "POC vs FOC lives on the Memory District terminal.",
        "This yard lists runtime personas. It does not invent drills.",
      ],
    };
  }

  private async readLibrary(): Promise<DistrictBoard> {
    const body = await readJson(`${this.apiBaseUrl}/api/memory/receipts`);
    return {
      sourceMode: "in-memory",
      lines: [
        `memory receipts  ${body.count ?? count(body.receipts)}`,
        "Receipts are not lore.",
        "An empty shelf is still a shelf.",
      ],
    };
  }

  private async readWorkshop(): Promise<DistrictBoard> {
    const body = await readJson(`${this.apiBaseUrl}/api/runtime/companions`);
    return {
      sourceMode: "in-memory",
      lines: [
        `companion catalog  ${count(body.companions)}`,
        "Catalog read only.",
        "Selecting a companion is a runtime act, not a spawn.",
      ],
    };
  }
}
