import { now, type POCFOCActionEvaluation, type RuntimeGateDecision } from "@jennifer/shared";
import type { MemoryReceipt } from "@jennifer/memory";

export type RuntimeGateLedgerState =
  | "blocked"
  | "prepared"
  | "applied"
  | "failed";

export interface RuntimeGateLedgerRecord<TOutput = unknown> {
  actionId: string;
  decision: RuntimeGateDecision;
  reasons: string[];
  evaluation: POCFOCActionEvaluation;
  memoryReceipt: MemoryReceipt;
  state: RuntimeGateLedgerState;
  mutationApplied: boolean;
  output?: TOutput;
  error?: string;
  preparedAt: number;
  updatedAt: number;
}

export interface RuntimeGateLedgerReservation<TOutput = unknown> {
  created: boolean;
  record: RuntimeGateLedgerRecord<TOutput>;
}

/**
 * Durable replay/idempotency boundary for consequential runtime actions.
 *
 * `reserve` MUST be atomic with respect to `actionId`. A durable adapter is
 * expected to implement the uniqueness rule in the persistence layer so two
 * concurrent runtimes cannot both acquire permission to execute the same
 * mutation.
 */
export interface IRuntimeGateLedger {
  get<TOutput = unknown>(
    actionId: string,
  ): Promise<RuntimeGateLedgerRecord<TOutput> | undefined>;

  reserve<TOutput = unknown>(
    record: RuntimeGateLedgerRecord<TOutput>,
  ): Promise<RuntimeGateLedgerReservation<TOutput>>;

  markApplied<TOutput = unknown>(
    actionId: string,
    output: TOutput,
  ): Promise<RuntimeGateLedgerRecord<TOutput>>;

  markFailed(
    actionId: string,
    error: string,
  ): Promise<RuntimeGateLedgerRecord>;
}

/**
 * Deterministic POC adapter. Reusing one instance across new gate instances
 * models process recreation at the repository-contract layer, but it is not
 * durable across a real process restart.
 */
export class InMemoryRuntimeGateLedger implements IRuntimeGateLedger {
  private readonly records = new Map<string, RuntimeGateLedgerRecord>();

  async get<TOutput = unknown>(
    actionId: string,
  ): Promise<RuntimeGateLedgerRecord<TOutput> | undefined> {
    const record = this.records.get(actionId);
    return record
      ? clone(record as RuntimeGateLedgerRecord<TOutput>)
      : undefined;
  }

  async reserve<TOutput = unknown>(
    record: RuntimeGateLedgerRecord<TOutput>,
  ): Promise<RuntimeGateLedgerReservation<TOutput>> {
    const existing = this.records.get(record.actionId);
    if (existing) {
      return {
        created: false,
        record: clone(existing as RuntimeGateLedgerRecord<TOutput>),
      };
    }

    const stored = clone(record);
    this.records.set(record.actionId, stored as RuntimeGateLedgerRecord);
    return {
      created: true,
      record: clone(stored),
    };
  }

  async markApplied<TOutput = unknown>(
    actionId: string,
    output: TOutput,
  ): Promise<RuntimeGateLedgerRecord<TOutput>> {
    const existing = this.require(actionId) as RuntimeGateLedgerRecord<TOutput>;
    const updated: RuntimeGateLedgerRecord<TOutput> = {
      ...existing,
      state: "applied",
      mutationApplied: true,
      output,
      error: undefined,
      updatedAt: now(),
    };
    this.records.set(actionId, clone(updated) as RuntimeGateLedgerRecord);
    return clone(updated);
  }

  async markFailed(
    actionId: string,
    error: string,
  ): Promise<RuntimeGateLedgerRecord> {
    const existing = this.require(actionId);
    const updated: RuntimeGateLedgerRecord = {
      ...existing,
      state: "failed",
      mutationApplied: false,
      error,
      updatedAt: now(),
    };
    this.records.set(actionId, clone(updated));
    return clone(updated);
  }

  private require(actionId: string): RuntimeGateLedgerRecord {
    const record = this.records.get(actionId);
    if (!record) {
      throw new Error(`Runtime gate ledger record not found: ${actionId}`);
    }
    return record;
  }
}

export function createRuntimeGateLedgerRecord<TOutput = unknown>(input: {
  actionId: string;
  decision: RuntimeGateDecision;
  reasons: string[];
  evaluation: POCFOCActionEvaluation;
  memoryReceipt: MemoryReceipt;
  state: RuntimeGateLedgerState;
  mutationApplied?: boolean;
  output?: TOutput;
}): RuntimeGateLedgerRecord<TOutput> {
  const timestamp = now();
  return {
    actionId: input.actionId,
    decision: input.decision,
    reasons: [...input.reasons],
    evaluation: clone(input.evaluation),
    memoryReceipt: clone(input.memoryReceipt),
    state: input.state,
    mutationApplied: input.mutationApplied ?? false,
    ...(input.output === undefined ? {} : { output: input.output }),
    preparedAt: timestamp,
    updatedAt: timestamp,
  };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}
