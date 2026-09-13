import { readGameApiBaseUrl } from "./WorldBridge";

export type TelemetrySourceMode = "in-memory" | "unreachable";

export interface TowerSignalBoard {
  sourceMode: TelemetrySourceMode;
  persistenceMode: string;
  projectionMode: string;
  apiStatus: string;
  eventCount: number;
  latestEvent: string;
  summary: string;
}

/**
 * Read-only look at live API telemetry. Not world authority.
 */
export class TelemetryBridge {
  constructor(private readonly apiBaseUrl = readGameApiBaseUrl()) {}

  async readBoard(): Promise<TowerSignalBoard> {
    try {
      const [healthResponse, telemetryResponse] = await Promise.all([
        fetch(`${this.apiBaseUrl}/health`, { headers: { Accept: "application/json" } }),
        fetch(`${this.apiBaseUrl}/api/telemetry`, { headers: { Accept: "application/json" } }),
      ]);
      const health = (await healthResponse.json()) as {
        status?: string;
        persistence?: { mode?: string; projection?: { mode?: string } };
      };
      const telemetry = (await telemetryResponse.json()) as {
        events?: Array<{ kind?: string }>;
        total?: number;
      };
      const latest = telemetry.events?.[telemetry.events.length - 1];
      return {
        sourceMode: "in-memory",
        persistenceMode: health.persistence?.mode ?? "unknown",
        projectionMode: health.persistence?.projection?.mode ?? "unknown",
        apiStatus: health.status ?? `HTTP_${healthResponse.status}`,
        eventCount: telemetry.total ?? telemetry.events?.length ?? 0,
        latestEvent: latest?.kind ?? "none",
        summary: "Live API read. Signals are observations, not canon.",
      };
    } catch {
      return {
        sourceMode: "unreachable",
        persistenceMode: "unknown",
        projectionMode: "unknown",
        apiStatus: "UNREACHED",
        eventCount: 0,
        latestEvent: "none",
        summary: "Jennifer API unreachable. Tower is labelled observation-only.",
      };
    }
  }
}
