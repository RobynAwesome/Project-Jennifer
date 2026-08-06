import type { CompanionId, CompanionRelationshipLane } from "./companions.js";
import type { ID, Timestamp, ValidationStatus } from "./types.js";

/**
 * Governed relationship contracts shared by the runtime, API and persistence
 * adapters. PostgreSQL is the authoritative record; MongoDB holds rebuildable
 * adaptive projections.
 */
export type RelationshipLane = CompanionRelationshipLane;

export type RelationshipActorType =
  | "human-player"
  | "companion"
  | "npc"
  | "system";

export type RelationshipStatus =
  | "proposed"
  | "active"
  | "strained"
  | "separated"
  | "restored"
  | "completed";

export type RelationshipParticipantRole =
  | "sovereign"
  | "companion"
  | "witness"
  | "guardian"
  | "mentor"
  | "rival-ally";

export type RelationshipEventType =
  | "relationship.created"
  | "relationship.boundary-declared"
  | "relationship.boundary-superseded"
  | "relationship.quest-decision"
  | "relationship.state-transitioned";

export interface RelationshipActor {
  id: ID;
  actorType: RelationshipActorType;
  canonicalName: string;
  companionId?: CompanionId;
  externalIdentityRef?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RelationshipParticipant {
  relationshipId: ID;
  actorId: ID;
  role: RelationshipParticipantRole;
  joinedAt: Timestamp;
  leftAt?: Timestamp;
}

export interface RelationshipBoundary {
  id: ID;
  relationshipId: ID;
  boundaryType: string;
  boundaryValue: string;
  declaredByActorId: ID;
  status: "active" | "superseded" | "revoked";
  effectiveAt: Timestamp;
  supersedesBoundaryId?: ID;
}

export interface GovernedRelationship {
  id: ID;
  relationshipType: string;
  activeLane: RelationshipLane;
  status: RelationshipStatus;
  createdByActorId: ID;
  version: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface RelationshipEvent {
  id: ID;
  relationshipId: ID;
  eventType: RelationshipEventType;
  eventVersion: 1;
  sourceActorId: ID;
  correlationId: ID;
  causationId?: ID;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  occurredAt: Timestamp;
  recordedAt: Timestamp;
}

export interface RelationshipStateTransition {
  id: ID;
  relationshipId: ID;
  fromState: RelationshipStatus;
  toState: RelationshipStatus;
  triggerEventId: ID;
  governanceResult: ValidationStatus;
  createdAt: Timestamp;
}

export interface GovernedRelationshipReceipt {
  id: ID;
  eventId: ID;
  relationshipId: ID;
  protocol: "RIVM" | "KPGS-RELATIONSHIP";
  protocolVersion: string;
  result: ValidationStatus;
  checks: {
    participantsResolved: boolean;
    laneSupported: boolean;
    agencyPreserved: boolean;
    boundaryRespected: boolean;
    idempotencyPreserved: boolean;
    sourceClassesSeparated: boolean;
  };
  warnings: string[];
  failureCodes: string[];
  evidenceRefs: string[];
  humanValidated: boolean;
  integrityHash: string;
  createdAt: Timestamp;
}

export interface RelationshipQuestDecision {
  id: ID;
  questInstanceId: ID;
  relationshipId: ID;
  decisionType: string;
  selectedOption: string;
  triggerEventId: ID;
  receiptId: ID;
  createdAt: Timestamp;
}

export interface RelationshipOutboxEvent {
  id: ID;
  aggregateType: "relationship";
  aggregateId: ID;
  eventType: RelationshipEventType;
  payload: Record<string, unknown>;
  publishedAt?: Timestamp;
  attemptCount: number;
  lastError?: string;
  createdAt: Timestamp;
}

export interface RelationshipContextProjection {
  relationshipId: ID;
  activeLane: RelationshipLane;
  status: RelationshipStatus;
  participants: RelationshipParticipant[];
  activeBoundaries: RelationshipBoundary[];
  recentEvents: RelationshipEvent[];
  currentSummary: string;
  lastAuthoritativeEventId: ID;
  projectionVersion: number;
  updatedAt: Timestamp;
}

export interface RelationshipSnapshot {
  relationship: GovernedRelationship;
  actors: RelationshipActor[];
  participants: RelationshipParticipant[];
  boundaries: RelationshipBoundary[];
  events: RelationshipEvent[];
  receipts: GovernedRelationshipReceipt[];
  decisions: RelationshipQuestDecision[];
  projection?: RelationshipContextProjection;
}

export interface CreateRelationshipInput {
  relationshipType: string;
  lane: RelationshipLane;
  createdByActorId: ID;
  actors: Array<{
    id?: ID;
    actorType: RelationshipActorType;
    canonicalName: string;
    role: RelationshipParticipantRole;
    companionId?: CompanionId;
    externalIdentityRef?: string;
  }>;
  idempotencyKey: string;
  correlationId?: ID;
}

export interface DeclareRelationshipBoundaryInput {
  relationshipId: ID;
  declaredByActorId: ID;
  boundaryType: string;
  boundaryValue: string;
  idempotencyKey: string;
  correlationId?: ID;
}

export interface ApplyRelationshipQuestDecisionInput {
  relationshipId: ID;
  questInstanceId: ID;
  sourceActorId: ID;
  decisionType: string;
  selectedOption: string;
  nextStatus?: RelationshipStatus;
  idempotencyKey: string;
  correlationId?: ID;
  evidenceRefs?: string[];
}
