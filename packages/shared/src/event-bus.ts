export type EventMapBase = Record<string, unknown>;

type EventHandler<T = unknown> = (event: T) => void | Promise<void>;

export interface JenniferEventMap extends EventMapBase {
  "jennifer.telemetry": {
    id: string;
    kind: string;
    source: string;
    payload: Record<string, unknown>;
    timestamp: number;
  };
  "jennifer.validation": {
    decisionId: string;
    status: "PASSED" | "FAILED" | "DEFERRED";
    reasons: string[];
    timestamp: number;
  };
  "jennifer.memory.write": {
    memoryId: string;
    subject: string;
    provenance: Record<string, unknown>;
    timestamp: number;
  };
  "jennifer.memory.read": {
    count: number;
    filter: Record<string, unknown>;
    timestamp: number;
  };
}

/**
 * Typed in-process event bus for decoupled inter-package communication.
 */
export interface IEventBus<TEventMap extends EventMapBase = JenniferEventMap> {
  publish<TTopic extends keyof TEventMap>(topic: TTopic, event: TEventMap[TTopic]): Promise<void>;
  subscribe<TTopic extends keyof TEventMap>(
    topic: TTopic,
    handler: EventHandler<TEventMap[TTopic]>
  ): () => void;
  unsubscribeAll<TTopic extends keyof TEventMap>(topic: TTopic): void;
}

export class InProcessEventBus<TEventMap extends EventMapBase = JenniferEventMap>
  implements IEventBus<TEventMap>
{
  private readonly handlers = new Map<keyof TEventMap, Set<EventHandler>>();

  async publish<TTopic extends keyof TEventMap>(topic: TTopic, event: TEventMap[TTopic]): Promise<void> {
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

  subscribe<TTopic extends keyof TEventMap>(
    topic: TTopic,
    handler: EventHandler<TEventMap[TTopic]>
  ): () => void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    const topicHandlers = this.handlers.get(topic)!;
    topicHandlers.add(handler as EventHandler);

    return () => {
      topicHandlers.delete(handler as EventHandler);
      if (topicHandlers.size === 0) {
        this.handlers.delete(topic);
      }
    };
  }

  unsubscribeAll<TTopic extends keyof TEventMap>(topic: TTopic): void {
    this.handlers.delete(topic);
  }
}

// Backward-compatible alias
export { InProcessEventBus as InMemoryEventBus };
