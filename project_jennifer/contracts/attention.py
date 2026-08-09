"""Contracts for Communication Attention Governance (CAG)."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum


class Ecosystem(StrEnum):
    WORK = "work"
    INTIMATE = "intimate"
    GAMEPLAY = "gameplay"
    CRISIS = "crisis"
    RESEARCH = "research"
    SOCIAL = "social"
    OTHER = "other"


class UserIntent(StrEnum):
    EXECUTE = "execute"
    EXPLORE = "explore"
    COMFORT = "comfort"
    CHALLENGE = "challenge"
    PLAY = "play"
    VALIDATE = "validate"
    INVESTIGATE = "investigate"
    OTHER = "other"


class RelationalLane(StrEnum):
    PRIVATE = "private"
    INTIMATE_FICTION = "intimate-fiction"
    COLLEAGUE = "colleague"
    PLAYER = "player"
    COMPANION = "companion"
    CUSTOMER = "customer"
    RESEARCH = "research"
    CRISIS = "crisis"
    PUBLIC = "public"
    OTHER = "other"


class Temperature(StrEnum):
    LOW = "low"
    ELEVATED = "elevated"
    HIGH = "high"


class ConfidenceScope(StrEnum):
    THIS_EVENT = "this-event"
    RECURRING_PATTERN = "recurring-pattern"
    GENERAL_TRAIT = "general-trait"


class InterruptionGate(StrEnum):
    OPEN = "open"
    CLOSED = "closed"
    REQUIRES_AUTHORIZATION = "requires-authorization"


class Effect(StrEnum):
    UNKNOWN = "unknown"
    CONVERGED = "converged"
    DIVERGED = "diverged"
    PARTIAL = "partial"


@dataclass(frozen=True, slots=True)
class CAGEvent:
    """Normalized event passed through CAG before inference."""

    signal: str
    subject: str
    ecosystem: Ecosystem = Ecosystem.OTHER
    intent: UserIntent = UserIntent.OTHER
    authority: str = "user"
    relational_lane: RelationalLane = RelationalLane.OTHER
    temperature: Temperature = Temperature.LOW
    cause: str | None = None
    confidence_scope: ConfidenceScope = ConfidenceScope.THIS_EVENT
    attention_target: str | None = None
    active_participants: tuple[str, ...] = ()
    metadata: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class AttentionCandidate:
    """Fact, context fragment, tool result, or aside proposed for admission."""

    content: str
    is_true: bool | None = None
    relevant_now: bool | None = None
    authority: str | None = None
    provenance: str | None = None
    privacy_lane: RelationalLane | None = None
    concerns_third_party: bool = False
    metadata: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class CAGAssessment:
    """Pre- or post-inference CAG decision."""

    gate: InterruptionGate
    attention_target: str
    reason: str
    admitted: tuple[AttentionCandidate, ...] = ()
    suppressed: tuple[AttentionCandidate, ...] = ()
    effect: Effect = Effect.UNKNOWN
    repair: str | None = None
    metadata: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class CAGReceiptData:
    """Receipt payload preserving the thirteen canonical CAG fields."""

    ecosystem: Ecosystem
    subject: str
    intent: UserIntent
    authority: str
    relational_lane: RelationalLane
    temperature: Temperature
    cause: str | None
    confidence_scope: ConfidenceScope
    attention_target: str
    interruption_gate: InterruptionGate
    response_summary: str | None = None
    effect: Effect = Effect.UNKNOWN
    repair: str | None = None
