import { TelemetryEvent } from "./types.js";

type EventHandler<T = unknown> = (event: T) => void | Promise<void>;

/**
 * Simple in-process event bus for decoupled communication between
 * Jennifer's modules. Production deployments may replace this with
 * a distributed message broker (e.g. Redis Streams, NATS) by
 * swapping the IEventBus implementation injected at composition root.
 */
export interface IEventBus {
  publish<T>(topic: string, event: T): Promise<void>;
  subscribe<T>(topic: string, handler: EventHandler<T>): () => void;
  unsubscribeAll(topic: string): void;
}

export class InMemoryEventBus implements IEventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  async publish<T>(topic: string, event: T): Promise<void> {
    const topicHandlers = this.handlers.get(topic);
    if (!topicHandlers) return;

    const promises: Promise<void>[] = [];
    for (const handler of topicHandlers) {
      const result = handler(event);
      if (result instanceof Promise) {
        promises.push(result);
      }
    }
    await Promise.all(promises);
  }

  subscribe<T>(topic: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    const topicHandlers = this.handlers.get(topic)!;
    topicHandlers.add(handler as EventHandler);

    return () => {
      topicHandlers.delete(handler as EventHandler);
    };
  }

  unsubscribeAll(topic: string): void {
    this.handlers.delete(topic);
  }
}

// ─── Telemetry-aware event bus wrapper ───────────────────────────────────────

export class TelemetryEventBus extends InMemoryEventBus {
  private readonly telemetryLog: TelemetryEvent[] = [];

  override async publish<T>(topic: string, event: T): Promise<void> {
    this.telemetryLog.push({
      id: crypto.randomUUID(),
      kind: "system.event",
      source: topic,
      payload: event as Record<string, unknown>,
      timestamp: Date.now(),
    });
    return super.publish(topic, event);
  }

  getRecentEvents(limit = 100): TelemetryEvent[] {
    return this.telemetryLog.slice(-limit);
  }
}
