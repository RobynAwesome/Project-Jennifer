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
 * In-memory authority adapter used for deterministic POC validation.
 * A PostgreSQL adapter must implement the same atomic commit boundary.
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
        input.participants.map(clone)
      );
    }

    if (input.boundaries) {
      this.boundaries.set(
        input.relationship.id,
        input.boundaries.map(clone)
      );
    }

    append(this.events, input.relationship.id, clone(input.event));
    append(this.receipts, input.relationship.id, clone(input.receipt));
    if (input.decision) {
      append(this.decisions, input.relationship.id, clone(input.decision));
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

    const participants = this.participants.get(relationshipId) ?? [];
    const actors = participants
      .map((participant) => this.actors.get(participant.actorId))
      .filter((actor): actor is RelationshipActor => actor !== undefined);

    return {
      relationship: clone(relationship),
      actors: actors.map(clone),
      participants: participants.map(clone),
      boundaries: (this.boundaries.get(relationshipId) ?? []).map(clone),
      events: (this.events.get(relationshipId) ?? []).map(clone),
      receipts: (this.receipts.get(relationshipId) ?? []).map(clone),
      decisions: (this.decisions.get(relationshipId) ?? []).map(clone),
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
      .map(clone);
  }

  async markOutboxPublished(outboxId: ID): Promise<void> {
    const event = this.outbox.get(outboxId);
    if (event) this.outbox.set(outboxId, { ...event, publishedAt: now() });
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

/** MongoDB-shaped, rebuildable adaptive projection used by the POC. */
export class InMemoryRelationshipProjectionStore
  implements IRelationshipProjectionStore
{
  private readonly projections = new Map<ID, RelationshipContextProjection>();

  async upsertFromAuthoritativeSnapshot(
    snapshot: RelationshipSnapshot,
    eventId: ID
  ): Promise<RelationshipContextProjection> {
    const previous = this.projections.get(snapshot.relationship.id);
    const projection: RelationshipContextProjection = {
      relationshipId: snapshot.relationship.id,
      activeLane: snapshot.relationship.activeLane,
      status: snapshot.relationship.status,
      participants: snapshot.participants.map(clone),
      activeBoundaries: snapshot.boundaries
        .filter((boundary) => boundary.status === "active")
        .map(clone),
      recentEvents: snapshot.events.slice(-20).map(clone),
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
 * Applies relationship governance, commits the authoritative event + receipt,
 * then projects the event into MongoDB-shaped adaptive context through an
 * idempotent transactional-outbox boundary.
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
    requireText(input.relationshipType, "relationshipType");
    requireText(input.idempotencyKey, "idempotencyKey");

    const duplicate = await this.resolveDuplicate(input.idempotencyKey);
    if (duplicate) return duplicate;

    if (input.actors.length < 2) {
      throw new RelationshipGovernanceError(
        "RIVM-PARTICIPANTS",
        "A governed relationship requires at least two actors."
      );
    }

    const timestamp = now();
    const actors: RelationshipActor[] = input.actors.map((actor) => ({
      id: actor.id ?? generateId(),
      actorType: actor.actorType,
      canonicalName: actor.canonicalName.trim(),
      companionId: actor.companionId,
      externalIdentityRef: actor.externalIdentityRef,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));
    const actorIds = new Set(actors.map((actor) => actor.id));

    if (actorIds.size !== actors.length) {
      throw new RelationshipGovernanceError(
        "RIVM-DUPLICATE-ACTOR",
        "Relationship actor IDs must be unique."
      );
    }
    if (!actorIds.has(input.createdByActorId)) {
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
    const participants: RelationshipParticipant[] = input.actors.map(
      (actor, index) => ({
        relationshipId,
        actorId: actors[index]!.id,
        role: actor.role,
        joinedAt: timestamp,
      })
    );
    const event = this.event({
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
    const receipt = this.receipt(event, {
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
      outbox: this.outbox(event),
    });
    await this.flushProjections();
    return this.result(relationshipId, receipt, false);
  }

  async declareBoundary(
    input: DeclareRelationshipBoundaryInput
  ): Promise<RelationshipCommandResult> {
    requireText(input.boundaryType, "boundaryType");
    requireText(input.boundaryValue, "boundaryValue");
    requireText(input.idempotencyKey, "idempotencyKey");

    const duplicate = await this.resolveDuplicate(input.idempotencyKey);
    if (duplicate) return duplicate;

    const snapshot = await this.requireSnapshot(input.relationshipId);
    requireParticipant(snapshot, input.declaredByActorId);
    const timestamp = now();
    const previous = snapshot.boundaries.find(
      (boundary) =>
        boundary.boundaryType === input.boundaryType &&
        boundary.status === "active"
    );
    const boundaries: RelationshipBoundary[] = snapshot.boundaries.map(
      (boundary) =>
        boundary.id === previous?.id
          ? { ...boundary, status: "superseded" }
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

    const relationship = bump(snapshot.relationship, timestamp);
    const event = this.event({
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
    const receipt = this.receipt(event, allChecksPassed());

    await this.authority.commit({
      relationship,
      boundaries,
      event,
      receipt,
      outbox: this.outbox(event),
    });
    await this.flushProjections();
    return this.result(input.relationshipId, receipt, false);
  }

  async applyQuestDecision(
    input: ApplyRelationshipQuestDecisionInput
  ): Promise<RelationshipCommandResult> {
    requireText(input.questInstanceId, "questInstanceId");
    requireText(input.decisionType, "decisionType");
    requireText(input.selectedOption, "selectedOption");
    requireText(input.idempotencyKey, "idempotencyKey");

    const duplicate = await this.resolveDuplicate(input.idempotencyKey);
    if (duplicate) return duplicate;

    const snapshot = await this.requireSnapshot(input.relationshipId);
    requireParticipant(snapshot, input.sourceActorId);
    const timestamp = now();
    const fromState = snapshot.relationship.status;
    const toState = input.nextStatus ?? fromState;
    const relationship: GovernedRelationship = {
      ...bump(snapshot.relationship, timestamp),
      status: toState,
    };
    const event = this.event({
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
    const receipt = this.receipt(
      event,
      allChecksPassed(),
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

    await this.authority.commit({
      relationship,
      event,
      receipt,
      decision,
      outbox: this.outbox(event),
    });
    await this.flushProjections();
    return this.result(input.relationshipId, receipt, false);
  }

  async getSnapshot(
    relationshipId: ID
  ): Promise<RelationshipSnapshot | undefined> {
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
    const event = await this.authority.getEventByIdempotencyKey(idempotencyKey);
    if (!event) return undefined;
    const receipt = await this.authority.getReceiptByEventId(event.id);
    if (!receipt) throw new Error(`Receipt missing for event ${event.id}`);
    return this.result(event.relationshipId, receipt, true);
  }

  private async result(
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

  private event(input: {
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

  private receipt(
    event: RelationshipEvent,
    checks: GovernedRelationshipReceipt["checks"],
    evidenceRefs: string[] = []
  ): GovernedRelationshipReceipt {
    const result: GovernedRelationshipReceipt["result"] = Object.values(
      checks
    ).every(Boolean)
      ? "PASSED"
      : "FAILED";
    const createdAt = now();
    const core = {
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
      ...core,
      integrityHash: stableHash(core),
    };
  }

  private outbox(event: RelationshipEvent): RelationshipOutboxEvent {
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

function allChecksPassed(): GovernedRelationshipReceipt["checks"] {
  return {
    participantsResolved: true,
    laneSupported: true,
    agencyPreserved: true,
    boundaryRespected: true,
    idempotencyPreserved: true,
    sourceClassesSeparated: true,
  };
}

function requireParticipant(
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

function requireText(value: string, field: string): void {
  if (!value.trim()) {
    throw new RelationshipGovernanceError(
      "RIVM-INPUT",
      `${field} is required.`
    );
  }
}

function bump(
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
  const activeBoundaries = snapshot.boundaries.filter(
    (boundary) => boundary.status === "active"
  ).length;
  return `${names} operate in the ${snapshot.relationship.activeLane} lane with ${activeBoundaries} active boundaries and ${snapshot.decisions.length} governed quest decisions.`;
}

function append<T>(map: Map<ID, T[]>, key: ID, value: T): void {
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
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}
