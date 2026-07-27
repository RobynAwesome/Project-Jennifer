import type { IEventBus, JenniferEventMap } from "@jennifer/shared";
import { generateId, now } from "@jennifer/shared";

export type TelemetryEventKind =
  | "runtime.time"
  | "runtime.event"
  | "environment.change"
  | "user.action"
  | "system.event"
  | "governance.decision"
  | "memory.operation"
  | "validation.result"
  | "npc.action"
  | "world.event";

export interface ObjectiveWeightVector {
  personal: number;
  workEdu: number;
  relational: number;
}

export interface TelemetryEvent {
  id: string;
  kind: TelemetryEventKind;
  source: string;
  payload: Record<string, unknown>;
  fidelity: "full" | "sampled";
  contextMode: "crisis" | "operational" | "idle" | "ideation";
  timestamp: number;
}

export interface TelemetryCollectionContext {
  mode: "crisis" | "operational" | "idle" | "ideation";
  omega: ObjectiveWeightVector;
  sampleRate?: number;
}

export const TELEMETRY_TOPIC: keyof JenniferEventMap = "jennifer.telemetry";

/**
 * Collects and dispatches governed telemetry events.
 */
export class TelemetryCollector {
  private readonly store: TelemetryEvent[] = [];
  private readonly maxStoreSize: number;

  constructor(
    private readonly bus: IEventBus<JenniferEventMap>,
    options: { maxStoreSize?: number } = {}
  ) {
    this.maxStoreSize = options.maxStoreSize ?? 10_000;
  }

  async emit(
    kind: TelemetryEventKind,
    source: string,
    payload: Record<string, unknown>,
    context?: TelemetryCollectionContext
  ): Promise<TelemetryEvent | null> {
    const normalizedContext: TelemetryCollectionContext = context ?? {
      mode: "operational",
      omega: { personal: 0.33, workEdu: 0.34, relational: 0.33 },
      sampleRate: 1,
    };

    const fullFidelity =
      normalizedContext.mode === "crisis" ||
      (normalizedContext.mode === "operational" &&
        normalizedContext.omega.workEdu >=
          Math.max(normalizedContext.omega.personal, normalizedContext.omega.relational));

    const sampled = !fullFidelity;
    const sampleRate = normalizedContext.sampleRate ?? 0.2;
    if (sampled && Math.random() > sampleRate) {
      return null;
    }

    const event: TelemetryEvent = {
      id: generateId(),
      kind,
      source,
      payload,
      fidelity: fullFidelity ? "full" : "sampled",
      contextMode: normalizedContext.mode,
      timestamp: now(),
    };

    this.store.push(event);
    if (this.store.length > this.maxStoreSize) {
      this.store.splice(0, this.store.length - this.maxStoreSize);
    }

    await this.bus.publish(TELEMETRY_TOPIC, {
      id: event.id,
      kind: event.kind,
      source: event.source,
      payload: {
        ...event.payload,
        fidelity: event.fidelity,
        contextMode: event.contextMode,
      },
      timestamp: event.timestamp,
    });

    return event;
  }

  query(filter: {
    kind?: TelemetryEventKind;
    source?: string;
    since?: number;
    limit?: number;
  } = {}): TelemetryEvent[] {
    let results = this.store.filter((event) => {
      if (filter.kind && event.kind !== filter.kind) return false;
      if (filter.source && event.source !== filter.source) return false;
      if (filter.since && event.timestamp < filter.since) return false;
      return true;
    });

    if (filter.limit) {
      results = results.slice(-filter.limit);
    }

    return results;
  }

  getAll(): TelemetryEvent[] {
    return [...this.store];
  }

  clear(): void {
    this.store.length = 0;
  }
}

export class TimeTracker {
  private readonly startTime = Date.now();
  private tick = 0;

  nextTick(): number {
    return ++this.tick;
  }

  currentTick(): number {
    return this.tick;
  }

  uptimeMs(): number {
    return Date.now() - this.startTime;
  }

  wallClock(): Date {
    return new Date();
  }

  isoTimestamp(): string {
    return new Date().toISOString();
  }
}

export class EnvironmentMonitor {
  private readonly featureFlags: Map<string, boolean> = new Map();
  private readonly metadata: Map<string, unknown> = new Map();

  setFlag(flag: string, value: boolean): void {
    this.featureFlags.set(flag, value);
  }

  isEnabled(flag: string): boolean {
    return this.featureFlags.get(flag) ?? false;
  }

  setMetadata(key: string, value: unknown): void {
    this.metadata.set(key, value);
  }

  getMetadata(key: string): unknown {
    return this.metadata.get(key);
  }

  snapshot(): Record<string, unknown> {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryMb: Math.round(process.memoryUsage().rss / 1_048_576),
      features: Object.fromEntries(this.featureFlags),
      metadata: Object.fromEntries(this.metadata),
    };
  }
}
