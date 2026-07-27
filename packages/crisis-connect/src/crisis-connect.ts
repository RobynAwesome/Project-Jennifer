import type {
  CrisisRecord,
  CrisisCategory,
  CrisisSeverity,
  ResponseAction,
  ID,
} from "@jennifer/shared";
import type { IEventBus } from "@jennifer/shared";
import { generateId, now } from "@jennifer/shared";

export const CRISIS_EVENT_TOPIC = "jennifer:crisis";
export const CRISIS_RESOLVED_TOPIC = "jennifer:crisis:resolved";

/**
 * Crisis Connect – humanitarian module
 *
 * Manages community crises across five domains: community, public-service,
 * employment, accessibility, and local governance. All operations emit
 * structured events so that other modules (telemetry, governance) can
 * observe and respond.
 */
export class CrisisManager {
  private readonly records: Map<ID, CrisisRecord> = new Map();

  constructor(private readonly bus: IEventBus) {}

  async report(
    input: Omit<CrisisRecord, "id" | "reportedAt" | "responseActions" | "resolvedAt">
  ): Promise<CrisisRecord> {
    const record: CrisisRecord = {
      ...input,
      id: generateId(),
      reportedAt: now(),
      responseActions: [],
    };

    this.records.set(record.id, record);
    await this.bus.publish(CRISIS_EVENT_TOPIC, record);
    return record;
  }

  async addResponseAction(
    crisisId: ID,
    action: Omit<ResponseAction, "id" | "crisisId" | "createdAt">
  ): Promise<ResponseAction | undefined> {
    const record = this.records.get(crisisId);
    if (!record) return undefined;

    const responseAction: ResponseAction = {
      ...action,
      id: generateId(),
      crisisId,
      createdAt: now(),
    };

    const updated: CrisisRecord = {
      ...record,
      responseActions: [...record.responseActions, responseAction],
    };

    this.records.set(crisisId, updated);
    return responseAction;
  }

  async resolve(crisisId: ID): Promise<CrisisRecord | undefined> {
    const record = this.records.get(crisisId);
    if (!record) return undefined;

    const resolved: CrisisRecord = {
      ...record,
      resolvedAt: now(),
      responseActions: record.responseActions.map((a) =>
        a.status !== "completed" ? { ...a, status: "completed" as const } : a
      ),
    };

    this.records.set(crisisId, resolved);
    await this.bus.publish(CRISIS_RESOLVED_TOPIC, resolved);
    return resolved;
  }

  get(id: ID): CrisisRecord | undefined {
    return this.records.get(id);
  }

  getActive(): CrisisRecord[] {
    return Array.from(this.records.values()).filter((r) => !r.resolvedAt);
  }

  getByCategory(category: CrisisCategory): CrisisRecord[] {
    return Array.from(this.records.values()).filter((r) => r.category === category);
  }

  getBySeverity(severity: CrisisSeverity): CrisisRecord[] {
    return Array.from(this.records.values()).filter((r) => r.severity === severity);
  }

  /**
   * Generates a summary dashboard view of active crises.
   */
  dashboard(): {
    total: number;
    bySeverity: Record<CrisisSeverity, number>;
    byCategory: Record<CrisisCategory, number>;
  } {
    const active = this.getActive();

    const bySeverity: Record<CrisisSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    const byCategory: Record<CrisisCategory, number> = {
      community: 0,
      "public-service": 0,
      employment: 0,
      accessibility: 0,
      "local-governance": 0,
    };

    for (const r of active) {
      bySeverity[r.severity]++;
      byCategory[r.category]++;
    }

    return { total: active.length, bySeverity, byCategory };
  }
}
