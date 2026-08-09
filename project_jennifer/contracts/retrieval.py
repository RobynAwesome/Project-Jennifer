"""Contracts for governed retrieval-augmented generation (RAG)."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import IntEnum, StrEnum
from typing import Protocol

from .attention import RelationalLane


class AuthorityTier(IntEnum):
    """Project Jennifer evidence precedence.

    Lower numeric value means stronger governed precedence within the evidence
    item's declared authority scope.
    """

    POSTGRES_GOVERNED_AUTHORITY = 0
    USER_DECLARED_AUTHORITY = 1
    GSMB_MONGODB_ADAPTIVE_CONTEXT = 2
    LOCAL_KNOWLEDGE = 3
    CONNECTED_EXTERNAL = 4
    MODEL_PARAMETRIC_PRIOR = 5


class RetrievalDisposition(StrEnum):
    RETRIEVED = "retrieved"
    SUPPRESSED_BY_CAG = "suppressed-by-cag"
    SUPPRESSED_BY_PRIVACY = "suppressed-by-privacy"
    DEDUPLICATED = "deduplicated"
    NOT_FOUND = "not-found"


@dataclass(frozen=True, slots=True)
class RetrievalQuery:
    """Provider-neutral query plan for a governed retrieval operation."""

    query: str
    subject: str
    target_lane: RelationalLane = RelationalLane.OTHER
    requested_tiers: tuple[AuthorityTier, ...] = (
        AuthorityTier.POSTGRES_GOVERNED_AUTHORITY,
        AuthorityTier.USER_DECLARED_AUTHORITY,
        AuthorityTier.GSMB_MONGODB_ADAPTIVE_CONTEXT,
        AuthorityTier.LOCAL_KNOWLEDGE,
        AuthorityTier.CONNECTED_EXTERNAL,
    )
    explicit_cross_lane_authorization: bool = False
    metadata: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class EvidenceItem:
    """A retrieved evidence fragment with explicit authority and provenance."""

    evidence_id: str
    content: str
    source_id: str
    source_uri: str | None
    authority_tier: AuthorityTier
    authority_scope: str
    score: float = 0.0
    source_lane: RelationalLane = RelationalLane.OTHER
    observed_at: str | None = None
    checksum: str | None = None
    metadata: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class EvidenceBundle:
    """Ranked, deduplicated, provenance-preserving RAG result."""

    query: RetrievalQuery
    evidence: tuple[EvidenceItem, ...]
    suppressed: tuple[tuple[str, RetrievalDisposition], ...] = ()
    model_prior_allowed: bool = True
    grounding_complete: bool = False
    metadata: dict[str, object] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class RetrievalReceiptData:
    query: str
    subject: str
    requested_tiers: tuple[AuthorityTier, ...]
    retrieved_ids: tuple[str, ...]
    suppressed: tuple[tuple[str, RetrievalDisposition], ...]
    grounding_complete: bool
    explicit_cross_lane_authorization: bool


class RetrievalSource(Protocol):
    """Adapter contract implemented by Postgres, Mongo, local, or remote sources."""

    source_id: str
    authority_tier: AuthorityTier
    authority_scope: str
    source_lane: RelationalLane

    def retrieve(self, query: RetrievalQuery) -> tuple[EvidenceItem, ...]:
        """Return evidence without mutating Project Jennifer memory."""
