import type { TelemetryEvent, TelemetryEventKind, ID } from "@jennifer/shared";
import { generateId, now } from "@jennifer/shared";
import type { IEventBus } from "@jennifer/shared";

export const TELEMETRY_TOPIC = "jennifer:telemetry";

/**
 * Collects and dispatches telemetry events. Acts as the central
 * observability hub – all modules emit here.
 */
export class TelemetryCollector {
  private readonly store: TelemetryEvent[] = [];
  private readonly maxStoreSize: number;

  constructor(
    private readonly bus: IEventBus,
    options: { maxStoreSize?: number } = {}
  ) {
    this.maxStoreSize = options.maxStoreSize ?? 10_000;
  }

  /**
   * Records a telemetry event and broadcasts it on the event bus.
   */
  async emit(
    kind: TelemetryEventKind,
    source: string,
    payload: Record<string, unknown>,
    context?: { sessionId?: ID; agentId?: ID }
  ): Promise<TelemetryEvent> {
    const event: TelemetryEvent = {
      id: generateId(),
      kind,
      source,
      payload,
      sessionId: context?.sessionId,
      agentId: context?.agentId,
      timestamp: now(),
    };

    this.store.push(event);

    // Evict oldest events when the store is full.
    if (this.store.length > this.maxStoreSize) {
      this.store.splice(0, this.store.length - this.maxStoreSize);
    }

    await this.bus.publish(TELEMETRY_TOPIC, event);
    return event;
  }

  query(filter: Partial<Pick<TelemetryEvent, "kind" | "source" | "sessionId">> & {
    since?: number;
    limit?: number;
  } = {}): TelemetryEvent[] {
    let results = this.store.filter((e) => {
      if (filter.kind && e.kind !== filter.kind) return false;
      if (filter.source && e.source !== filter.source) return false;
      if (filter.sessionId && e.sessionId !== filter.sessionId) return false;
      if (filter.since && e.timestamp < filter.since) return false;
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

/**
 * Tracks temporal context for the runtime – wall clock, tick count,
 * session uptime, and time-zone aware date calculations.
 */
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

/**
 * Monitors environment metadata – process info, runtime version,
 * feature flags, and system capacity signals.
 */
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
