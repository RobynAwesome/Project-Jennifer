import {
  generateId,
  getCompanionDefinition,
  now,
  type ApplyRelationshipQuestDecisionInput,
  type CreateRelationshipInput,
  type DeclareRelationshipBoundaryInput,
  type GovernedRelationship,
  type GovernedRelationshipReceipt,
  type ID,
  type RelationshipActor,
  type RelationshipBoundary,
  type RelationshipContextProjection,
  type RelationshipEvent,
  type RelationshipOutboxEvent,
  type RelationshipParticipant,
  type RelationshipQuestDecision,
  type RelationshipSnapshot,
  type RelationshipStateTransition,
} from "@jennifer/shared";

export interface RelationshipCommandResult {
  snapshot: RelationshipSnapshot;
  receipt: GovernedRelationshipReceipt;
  duplicate: boolean;
}

interface AuthorityCommit {
  actors?: RelationshipActor[];
  relationship: GovernedRelationship;
  participants?: RelationshipParticipant[];
  boundaries?: RelationshipBoundary[];
  event: RelationshipEvent;
  transition?: RelationshipStateTransition;
  receipt: GovernedRelationshipReceipt;
  decision?: RelationshipQuestDecision;
  outbox: RelationshipOutboxEvent;
}

export interface IRelationshipAuthorityStore {
  commit(input: AuthorityCommit): Promise<void>;
  getSnapshot(relationshipId: ID): Promise<RelationshipSnapshot | undefined>;
  getEventByIdempotencyKey(
    idempotencyKey: string
  ): Promise<RelationshipEvent | undefined>;
  getReceiptByEventId(
    eventId: ID
  ): Promise<GovernedRelationshipReceipt | undefined>;
  listPendingOutbox(limit?: number): Promise<RelationshipOutboxEvent[]>;
  markOutboxPublished(outboxId: ID): Promise<void>;
  markOutboxFailed(outboxId: ID, error: string): Promise<void>;
}

export interface IRelationshipProjectionStore {
  upsertFromAuthoritativeSnapshot(
    snapshot: RelationshipSnapshot,
    eventId: ID
  ): Promise<RelationshipContextProjection>;
  get(relationshipId: ID): Promise<RelationshipContextProjection | undefined>;
}

/**
 * Testable authority adapter mirroring the PostgreSQL transaction boundary.
 * Production adapters must preserve the same atomic commit contract.
 */
export class InMemoryRelationshipAuthorityStore
  implements IRelationshipAuthorityStore
{
  private readonly actors = new Map<ID, RelationshipActor>();
  private readonly relationships = new Map<ID, GovernedRelationship>();
  private readonly participants = new Map<ID, RelationshipParticipant[]>();
  private readonly boundaries = new Map<ID, RelationshipBoundary[]>();
  private readonly events = new Map<ID, RelationshipEvent[]>();
  private readonly receipts = new Map<ID, GovernedRelationshipReceipt[]>();
  private readonly decisions = new Map<ID, RelationshipQuestDecision[]>();
  private readonly outbox = new Map<ID, RelationshipOutboxEvent>();
  private readonly eventByIdempotencyKey = new Map<string, RelationshipEvent>();

  async commit(input: AuthorityCommit): Promise<void> {
    if (this.eventByIdempotencyKey.has(input.event.idempotencyKey)) return;

    for (const actor of input.actors ?? []) {
      this.actors.set(actor.id, clone(actor));
    }

    this.relationships.set(input.relationship.id, clone(input.relationship));

    if (input.participants) {
      this.participants.set(
        input.relationship.id,
        input.participants.map((participant) => clone(participant))
      );
    }

    if (input.boundaries) {
      this.boundaries.set(
        input.relationship.id,
        input.boundaries.map((boundary) => clone(boundary))
      );
    }

    appendToMap(this.events, input.relationship.id, clone(input.event));
    appendToMap(this.receipts, input.relationship.id, clone(input.receipt));
    if (input.decision) {
      appendToMap(this.decisions, input.relationship.id, clone(input.decision));
    }

    this.eventByIdempotencyKey.set(
      input.event.idempotencyKey,
      clone(input.event)
    );
    this.outbox.set(input.outbox.id, clone(input.outbox));
  }

  async getSnapshot(
    relationshipId: ID
  ): Promise<RelationshipSnapshot | undefined> {
    const relationship = this.relationships.get(relationshipId);
    if (!relationship) return undefined;

    const participantRows = this.participants.get(relationshipId) ?? [];
    const actorRows = participantRows
      .map((participant) => this.actors.get(participant.actorId))
      .filter((actor): actor is RelationshipActor => actor !== undefined);

    return {
      relationship: clone(relationship),
      actors: actorRows.map((actor) => clone(actor)),
      participants: participantRows.map((participant) => clone(participant)),
      boundaries: (this.boundaries.get(relationshipId) ?? []).map((boundary) =>
        clone(boundary)
      ),
      events: (this.events.get(relationshipId) ?? []).map((event) =>
        clone(event)
      ),
      receipts: (this.receipts.get(relationshipId) ?? []).map((receipt) =>
        clone(receipt)
      ),
      decisions: (this.decisions.get(relationshipId) ?? []).map((decision) =>
        clone(decision)
      ),
    };
  }

  async getEventByIdempotencyKey(
    idempotencyKey: string
  ): Promise<RelationshipEvent | undefined> {
    const event = this.eventByIdempotencyKey.get(idempotencyKey);
    return event ? clone(event) : undefined;
  }

  async getReceiptByEventId(
    eventId: ID
  ): Promise<GovernedRelationshipReceipt | undefined> {
    for (const rows of this.receipts.values()) {
      const receipt = rows.find((candidate) => candidate.eventId === eventId);
      if (receipt) return clone(receipt);
    }
    return undefined;
  }

  async listPendingOutbox(limit = 100): Promise<RelationshipOutboxEvent[]> {
    return Array.from(this.outbox.values())
      .filter((event) => event.publishedAt === undefined)
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, limit)
      .map((event) => clone(event));
  }

  async markOutboxPublished(outboxId: ID): Promise<void> {
    const event = this.outbox.get(outboxId);
    if (!event) return;
    this.outbox.set(outboxId, { ...event, publishedAt: now() });
  }

  async markOutboxFailed(outboxId: ID, error: string): Promise<void> {
    const event = this.outbox.get(outboxId);
    if (!event) return;
    this.outbox.set(outboxId, {
      ...event,
      attemptCount: event.attemptCount + 1,
      lastError: error,
    });
  }
}

/**
 * Rebuildable MongoDB-shaped projection adapter used by the POC and tests.
 */
export class InMemoryRelationshipProjectionStore
  implements IRelationshipProjectionStore
{
  private readonly projections = new Map<ID, RelationshipContextProjection>();

  async upsertFromAuthoritativeSnapshot(
    snapshot: RelationshipSnapshot,
    eventId: ID
  ): Promise<RelationshipContextProjection> {
    const previous = this.projections.get(snapshot.relationship.id);
    const activeBoundaries = snapshot.boundaries.filter(
      (boundary) => boundary.status === "active"
    );
    const recentEvents = snapshot.events.slice(-20);
    const projection: RelationshipContextProjection = {
      relationshipId: snapshot.relationship.id,
      activeLane: snapshot.relationship.activeLane,
      status: snapshot.relationship.status,
      participants: snapshot.participants.map((participant) =>
        clone(participant)
      ),
      activeBoundaries: activeBoundaries.map((boundary) => clone(boundary)),
      recentEvents: recentEvents.map((event) => clone(event)),
      currentSummary: buildProjectionSummary(snapshot),
      lastAuthoritativeEventId: eventId,
      projectionVersion: (previous?.projectionVersion ?? 0) + 1,
      updatedAt: now(),
    };
    this.projections.set(snapshot.relationship.id, projection);
    return clone(projection);
  }

  async get(
    relationshipId: ID
  ): Promise<RelationshipContextProjection | undefined> {
    const projection = this.projections.get(relationshipId);
    return projection ? clone(projection) : undefined;
  }
}

/**
 * RelationshipEngine applies governance before authority writes, records a
 * validation receipt in the same transaction boundary, then projects the
 * authoritative event into the MongoDB-shaped adaptive context store.
 */
export class RelationshipEngine {
  constructor(
    private readonly authority: IRelationshipAuthorityStore =
      new InMemoryRelationshipAuthorityStore(),
    private readonly projections: IRelationshipProjectionStore =
      new InMemoryRelationshipProjectionStore()
  ) {}

  async createRelationship(
    input: CreateRelationshipInput
  ): Promise<RelationshipCommandResult> {
    assertNonEmpty(input.relationshipType, "relationshipType");
    assertNonEmpty(input.idempotencyKey, "idempotencyKey");

    const duplicate = await this.resolveDuplicate(input.idempotencyKey);
    if (duplicate) return duplicate;

    if (input.actors.length < 2) {
      throw new RelationshipGovernanceError(
        "RIVM-PARTICIPANTS",
        "A governed relationship requires at least two actors."
      );
    }

    const timestamp = now();
    const actors = input.actors.map((actor) => ({
      id: actor.id ?? generateId(),
      actorType: actor.actorType,
      canonicalName: actor.canonicalName.trim(),
      companionId: actor.companionId,
      externalIdentityRef: actor.externalIdentityRef,
      createdAt: timestamp,
      updatedAt: timestamp,
    } satisfies RelationshipActor));

    const uniqueActorIds = new Set(actors.map((actor) => actor.id));
    if (uniqueActorIds.size !== actors.length) {
      throw new RelationshipGovernanceError(
        "RIVM-DUPLICATE-ACTOR",
        "Relationship actor IDs must be unique."
      );
    }

    if (!uniqueActorIds.has(input.createdByActorId)) {
      throw new RelationshipGovernanceError(
        "RIVM-CREATOR",
        "The relationship creator must be one of the declared actors."
      );
    }

    const laneSupported = input.actors.every((actor) => {
      if (!actor.companionId) return true;
      return Boolean(
        getCompanionDefinition(actor.companionId)?.supportedLanes.includes(
          input.lane
        )
      );
    });
    if (!laneSupported) {
      throw new RelationshipGovernanceError(
        "RIVM-LANE",
        "One or more companions do not support the requested relationship lane."
      );
    }

    const relationshipId = generateId();
    const relationship: GovernedRelationship = {
      id: relationshipId,
      relationshipType: input.relationshipType.trim(),
      activeLane: input.lane,
      status: "active",
      createdByActorId: input.createdByActorId,
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const participants = input.actors.map((actor, index) => ({
      relationshipId,
      actorId: actors[index]!.id,
      role: actor.role,
      joinedAt: timestamp,
    } satisfies RelationshipParticipant));
    const event = this.buildEvent({
      relationshipId,
      eventType: "relationship.created",
      sourceActorId: input.createdByActorId,
      correlationId: input.correlationId,
      idempotencyKey: input.idempotencyKey,
      payload: {
        relationshipType: relationship.relationshipType,
        lane: relationship.activeLane,
        actorIds: actors.map((actor) => actor.id),
      },
    });
    const receipt = this.buildReceipt(event, {
      participantsResolved: true,
      laneSupported,
      agencyPreserved: true,
      boundaryRespected: true,
      idempotencyPreserved: true,
      sourceClassesSeparated: true,
    });

    await this.authority.commit({
      actors,
      relationship,
      participants,
      boundaries: [],
      event,
      receipt,
      outbox: this.buildOutbox(event),
    });
    await this.flushProjections();

    return this.commandResult(relationshipId, receipt, false);
  }

  async declareBoundary(
    input: DeclareRelationshipBoundaryInput
  ): Promise<RelationshipCommandResult> {
    assertNonEmpty(input.boundaryType, "boundaryType");
    assertNonEmpty(input.boundaryValue, "boundaryValue");
    assertNonEmpty(input.idempotencyKey, "idempotencyKey");

    const duplicate = await this.resolveDuplicate(input.idempotencyKey);
    if (duplicate) return duplicate;

    const snapshot = await this.requireSnapshot(input.relationshipId);
    assertParticipant(snapshot, input.declaredByActorId);
    const timestamp = now();
    const previous = snapshot.boundaries.find(
      (boundary) =>
        boundary.boundaryType === input.boundaryType &&
        boundary.status === "active"
    );
    const boundaries = snapshot.boundaries.map((boundary) =>
      boundary.id === previous?.id
        ? { ...boundary, status: "superseded" as const }
        : boundary
    );
    const boundary: RelationshipBoundary = {
      id: generateId(),
      relationshipId: input.relationshipId,
      boundaryType: input.boundaryType.trim(),
      boundaryValue: input.boundaryValue.trim(),
      declaredByActorId: input.declaredByActorId,
      status: "active",
      effectiveAt: timestamp,
      supersedesBoundaryId: previous?.id,
    };
    boundaries.push(boundary);

    const relationship = bumpRelationship(snapshot.relationship, timestamp);
    const event = this.buildEvent({
      relationshipId: input.relationshipId,
      eventType: "relationship.boundary-declared",
      sourceActorId: input.declaredByActorId,
      correlationId: input.correlationId,
      idempotencyKey: input.idempotencyKey,
      payload: {
        boundaryId: boundary.id,
        boundaryType: boundary.boundaryType,
        supersedesBoundaryId: boundary.supersedesBoundaryId,
      },
    });
    const receipt = this.buildReceipt(event, {
      participantsResolved: true,
      laneSupported: true,
      agencyPreserved: true,
      boundaryRespected: true,
      idempotencyPreserved: true,
      sourceClassesSeparated: true,
    });

    await this.authority.commit({
      relationship,
      boundaries,
      event,
      receipt,
      outbox: this.buildOutbox(event),
    });
    await this.flushProjections();

    return this.commandResult(input.relationshipId, receipt, false);
  }

  async applyQuestDecision(
    input: ApplyRelationshipQuestDecisionInput
  ): Promise<RelationshipCommandResult> {
    assertNonEmpty(input.questInstanceId, "questInstanceId");
    assertNonEmpty(input.decisionType, "decisionType");
    assertNonEmpty(input.selectedOption, "selectedOption");
    assertNonEmpty(input.idempotencyKey, "idempotencyKey");

    const duplicate = await this.resolveDuplicate(input.idempotencyKey);
    if (duplicate) return duplicate;

    const snapshot = await this.requireSnapshot(input.relationshipId);
    assertParticipant(snapshot, input.sourceActorId);
    const timestamp = now();
    const fromState = snapshot.relationship.status;
    const toState = input.nextStatus ?? fromState;
    const relationship: GovernedRelationship = {
      ...bumpRelationship(snapshot.relationship, timestamp),
      status: toState,
    };
    const event = this.buildEvent({
      relationshipId: input.relationshipId,
      eventType: "relationship.quest-decision",
      sourceActorId: input.sourceActorId,
      correlationId: input.correlationId,
      idempotencyKey: input.idempotencyKey,
      payload: {
        questInstanceId: input.questInstanceId,
        decisionType: input.decisionType,
        selectedOption: input.selectedOption,
        fromState,
        toState,
      },
    });
    const receipt = this.buildReceipt(
      event,
      {
        participantsResolved: true,
        laneSupported: true,
        agencyPreserved: true,
        boundaryRespected: true,
        idempotencyPreserved: true,
        sourceClassesSeparated: true,
      },
      input.evidenceRefs
    );
    const decision: RelationshipQuestDecision = {
      id: generateId(),
      questInstanceId: input.questInstanceId,
      relationshipId: input.relationshipId,
      decisionType: input.decisionType.trim(),
      selectedOption: input.selectedOption.trim(),
      triggerEventId: event.id,
      receiptId: receipt.id,
      createdAt: timestamp,
    };
    const transition =
      fromState === toState
        ? undefined
        : ({
            id: generateId(),
            relationshipId: input.relationshipId,
            fromState,
            toState,
            triggerEventId: event.id,
            governanceResult: receipt.result,
            createdAt: timestamp,
          } satisfies RelationshipStateTransition);

    await this.authority.commit({
      relationship,
      event,
      transition,
      receipt,
      decision,
      outbox: this.buildOutbox(event),
    });
    await this.flushProjections();

    return this.commandResult(input.relationshipId, receipt, false);
  }

  async getSnapshot(relationshipId: ID): Promise<RelationshipSnapshot | undefined> {
    const snapshot = await this.authority.getSnapshot(relationshipId);
    if (!snapshot) return undefined;
    snapshot.projection = await this.projections.get(relationshipId);
    return snapshot;
  }

  async getReceipts(
    relationshipId: ID
  ): Promise<GovernedRelationshipReceipt[]> {
    return (await this.requireSnapshot(relationshipId)).receipts;
  }

  async flushProjections(limit = 100): Promise<number> {
    const pending = await this.authority.listPendingOutbox(limit);
    let projected = 0;

    for (const outbox of pending) {
      try {
        const snapshot = await this.requireSnapshot(outbox.aggregateId);
        await this.projections.upsertFromAuthoritativeSnapshot(
          snapshot,
          String(outbox.payload.eventId)
        );
        await this.authority.markOutboxPublished(outbox.id);
        projected += 1;
      } catch (error) {
        await this.authority.markOutboxFailed(
          outbox.id,
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    return projected;
  }

  private async resolveDuplicate(
    idempotencyKey: string
  ): Promise<RelationshipCommandResult | undefined> {
    const existing = await this.authority.getEventByIdempotencyKey(
      idempotencyKey
    );
    if (!existing) return undefined;
    const receipt = await this.authority.getReceiptByEventId(existing.id);
    if (!receipt) {
      throw new Error(`Receipt missing for idempotent event ${existing.id}`);
    }
    return this.commandResult(existing.relationshipId, receipt, true);
  }

  private async commandResult(
    relationshipId: ID,
    receipt: GovernedRelationshipReceipt,
    duplicate: boolean
  ): Promise<RelationshipCommandResult> {
    const snapshot = await this.requireSnapshot(relationshipId);
    snapshot.projection = await this.projections.get(relationshipId);
    return { snapshot, receipt, duplicate };
  }

  private async requireSnapshot(
    relationshipId: ID
  ): Promise<RelationshipSnapshot> {
    const snapshot = await this.authority.getSnapshot(relationshipId);
    if (!snapshot) {
      throw new RelationshipGovernanceError(
        "RIVM-NOT-FOUND",
        `Relationship ${relationshipId} was not found.`
      );
    }
    return snapshot;
  }

  private buildEvent(input: {
    relationshipId: ID;
    eventType: RelationshipEvent["eventType"];
    sourceActorId: ID;
    correlationId?: ID;
    idempotencyKey: string;
    payload: Record<string, unknown>;
  }): RelationshipEvent {
    const timestamp = now();
    return {
      id: generateId(),
      relationshipId: input.relationshipId,
      eventType: input.eventType,
      eventVersion: 1,
      sourceActorId: input.sourceActorId,
      correlationId: input.correlationId ?? generateId(),
      idempotencyKey: input.idempotencyKey,
      payload: input.payload,
      occurredAt: timestamp,
      recordedAt: timestamp,
    };
  }

  private buildReceipt(
    event: RelationshipEvent,
    checks: GovernedRelationshipReceipt["checks"],
    evidenceRefs: string[] = []
  ): GovernedRelationshipReceipt {
    const result = Object.values(checks).every(Boolean) ? "PASSED" : "FAILED";
    const createdAt = now();
    const receiptCore = {
      eventId: event.id,
      relationshipId: event.relationshipId,
      protocol: "KPGS-RELATIONSHIP" as const,
      protocolVersion: "0.1.0",
      result,
      checks,
      warnings: [] as string[],
      failureCodes: result === "PASSED" ? [] : ["RELATIONSHIP-CHECK-FAILED"],
      evidenceRefs,
      humanValidated: false,
      createdAt,
    };

    return {
      id: generateId(),
      ...receiptCore,
      integrityHash: stableHash(receiptCore),
    };
  }

  private buildOutbox(event: RelationshipEvent): RelationshipOutboxEvent {
    return {
      id: generateId(),
      aggregateType: "relationship",
      aggregateId: event.relationshipId,
      eventType: event.eventType,
      payload: { eventId: event.id, event },
      attemptCount: 0,
      createdAt: now(),
    };
  }
}

export class RelationshipGovernanceError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "RelationshipGovernanceError";
  }
}

function assertParticipant(
  snapshot: RelationshipSnapshot,
  actorId: ID
): void {
  if (!snapshot.participants.some((participant) => participant.actorId === actorId)) {
    throw new RelationshipGovernanceError(
      "RIVM-ACTOR-NOT-PARTICIPANT",
      `Actor ${actorId} is not a participant in this relationship.`
    );
  }
}

function assertNonEmpty(value: string, name: string): void {
  if (!value.trim()) {
    throw new RelationshipGovernanceError(
      "RIVM-INPUT",
      `${name} is required.`
    );
  }
}

function bumpRelationship(
  relationship: GovernedRelationship,
  timestamp: number
): GovernedRelationship {
  return {
    ...relationship,
    version: relationship.version + 1,
    updatedAt: timestamp,
  };
}

function buildProjectionSummary(snapshot: RelationshipSnapshot): string {
  const names = snapshot.actors.map((actor) => actor.canonicalName).join(" + ");
  return `${names} operate in the ${snapshot.relationship.activeLane} lane with ${
    snapshot.boundaries.filter((boundary) => boundary.status === "active").length
  } active boundaries and ${snapshot.decisions.length} governed quest decisions.`;
}

function appendToMap<T>(map: Map<ID, T[]>, key: ID, value: T): void {
  map.set(key, [...(map.get(key) ?? []), value]);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function stableHash(value: unknown): string {
  const input = stableStringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}
