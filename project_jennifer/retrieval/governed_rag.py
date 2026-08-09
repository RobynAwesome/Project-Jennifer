"""Governed RAG implementation for Project Jennifer.

The retriever preserves ordinary RAG semantics: retrieve external/non-parametric
context and expose it to generation. Jennifer adds authority precedence,
privacy, provenance, CAG admission, and receipts around that retrieval.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass, field

from project_jennifer.attention import CommunicationAttentionGovernance
from project_jennifer.contracts import (
    AttentionCandidate,
    AuthorityTier,
    CAGEvent,
    EvidenceBundle,
    EvidenceItem,
    GovernanceReceipt,
    ReceiptOutcome,
    RelationalLane,
    RetrievalDisposition,
    RetrievalQuery,
    RetrievalReceiptData,
    RetrievalSource,
)
from project_jennifer.plugins import PluginKind


_PRIVATE_LANES = {RelationalLane.PRIVATE, RelationalLane.INTIMATE_FICTION}
_PUBLIC_OR_WORK_LANES = {
    RelationalLane.COLLEAGUE,
    RelationalLane.RESEARCH,
    RelationalLane.PUBLIC,
    RelationalLane.CUSTOMER,
}


@dataclass(slots=True)
class InMemoryRetrievalSource:
    """Deterministic source adapter for POC tests and local demonstrations."""

    source_id: str
    authority_tier: AuthorityTier
    authority_scope: str
    source_lane: RelationalLane = RelationalLane.OTHER
    items: tuple[EvidenceItem, ...] = field(default_factory=tuple)

    def retrieve(self, query: RetrievalQuery) -> tuple[EvidenceItem, ...]:
        terms = {term.lower() for term in query.query.split() if term.strip()}
        if not terms:
            return self.items

        ranked: list[EvidenceItem] = []
        for item in self.items:
            content = item.content.lower()
            hits = sum(1 for term in terms if term in content)
            if hits == 0:
                continue
            score = hits / max(1, len(terms))
            ranked.append(
                EvidenceItem(
                    evidence_id=item.evidence_id,
                    content=item.content,
                    source_id=item.source_id,
                    source_uri=item.source_uri,
                    authority_tier=item.authority_tier,
                    authority_scope=item.authority_scope,
                    score=max(item.score, score),
                    source_lane=item.source_lane,
                    observed_at=item.observed_at,
                    checksum=item.checksum,
                    metadata=item.metadata,
                )
            )
        return tuple(ranked)


class GovernedRAG:
    """Provider-neutral retrieval plugin with authority and privacy governance."""

    name = "rag-governed-retrieval"
    kind = PluginKind.RETRIEVER
    version = "0.1.0"

    def __init__(
        self,
        *,
        sources: tuple[RetrievalSource, ...] = (),
        cag: CommunicationAttentionGovernance | None = None,
    ) -> None:
        self._sources = sources
        self._cag = cag

    @property
    def sources(self) -> tuple[RetrievalSource, ...]:
        return self._sources

    def plan(
        self,
        *,
        query: str,
        subject: str,
        target_lane: RelationalLane = RelationalLane.OTHER,
        requested_tiers: tuple[AuthorityTier, ...] | None = None,
        explicit_cross_lane_authorization: bool = False,
        metadata: dict[str, object] | None = None,
    ) -> RetrievalQuery:
        return RetrievalQuery(
            query=query,
            subject=subject,
            target_lane=target_lane,
            requested_tiers=requested_tiers
            or (
                AuthorityTier.POSTGRES_GOVERNED_AUTHORITY,
                AuthorityTier.USER_DECLARED_AUTHORITY,
                AuthorityTier.GSMB_MONGODB_ADAPTIVE_CONTEXT,
                AuthorityTier.LOCAL_KNOWLEDGE,
                AuthorityTier.CONNECTED_EXTERNAL,
            ),
            explicit_cross_lane_authorization=explicit_cross_lane_authorization,
            metadata=metadata or {},
        )

    def retrieve(
        self,
        query: RetrievalQuery,
        *,
        cag_event: CAGEvent | None = None,
    ) -> EvidenceBundle:
        evidence: list[EvidenceItem] = []
        suppressed: list[tuple[str, RetrievalDisposition]] = []

        for source in self._sources:
            if source.authority_tier not in query.requested_tiers:
                continue

            if self._cross_lane_private(source.source_lane, query):
                suppressed.append((source.source_id, RetrievalDisposition.SUPPRESSED_BY_PRIVACY))
                continue

            try:
                source_items = source.retrieve(query)
            except Exception:  # adapter failure is receipted, not silently promoted
                suppressed.append((source.source_id, RetrievalDisposition.NOT_FOUND))
                continue

            for item in source_items:
                if self._cross_lane_private(item.source_lane, query):
                    suppressed.append((item.evidence_id, RetrievalDisposition.SUPPRESSED_BY_PRIVACY))
                    continue
                evidence.append(item)

        ranked, duplicate_suppressions = self._rank_and_deduplicate(evidence)
        suppressed.extend(duplicate_suppressions)

        if self._cag is not None and cag_event is not None and ranked:
            candidates = tuple(
                AttentionCandidate(
                    content=item.content,
                    is_true=None,
                    relevant_now=None,
                    authority=item.authority_scope,
                    provenance=item.source_uri or item.source_id,
                    privacy_lane=item.source_lane,
                    concerns_third_party=bool(item.metadata.get("concerns_third_party", False)),
                    metadata={"evidence_id": item.evidence_id},
                )
                for item in ranked
            )
            assessment = self._cag.gate_candidates(cag_event, candidates)
            admitted_ids = {
                str(candidate.metadata.get("evidence_id"))
                for candidate in assessment.admitted
                if candidate.metadata.get("evidence_id") is not None
            }
            filtered: list[EvidenceItem] = []
            for item in ranked:
                if item.evidence_id in admitted_ids:
                    filtered.append(item)
                else:
                    suppressed.append((item.evidence_id, RetrievalDisposition.SUPPRESSED_BY_CAG))
            ranked = tuple(filtered)

        return EvidenceBundle(
            query=query,
            evidence=tuple(ranked),
            suppressed=tuple(suppressed),
            model_prior_allowed=True,
            grounding_complete=bool(ranked),
            metadata={
                "authority_order": tuple(int(item.authority_tier) for item in ranked),
                "retrieved_count": len(ranked),
            },
        )

    def receipt_data(self, bundle: EvidenceBundle) -> RetrievalReceiptData:
        return RetrievalReceiptData(
            query=bundle.query.query,
            subject=bundle.query.subject,
            requested_tiers=bundle.query.requested_tiers,
            retrieved_ids=tuple(item.evidence_id for item in bundle.evidence),
            suppressed=bundle.suppressed,
            grounding_complete=bundle.grounding_complete,
            explicit_cross_lane_authorization=bundle.query.explicit_cross_lane_authorization,
        )

    def receipt(self, *, run_id: str, bundle: EvidenceBundle) -> GovernanceReceipt:
        privacy_blocked = any(
            disposition == RetrievalDisposition.SUPPRESSED_BY_PRIVACY
            for _, disposition in bundle.suppressed
        )
        outcome = (
            ReceiptOutcome.STOPPED_IMMUTABLE_BOUNDARY
            if privacy_blocked and not bundle.evidence
            else ReceiptOutcome.PROCEEDED_WITH_RECEIPT
        )
        return GovernanceReceipt(
            run_id=run_id,
            layer="rag",
            action="governed-retrieval",
            outcome=outcome,
            subject=bundle.query.subject,
            reason=(
                "Evidence bundle produced with authority precedence and provenance."
                if bundle.evidence
                else "No admissible retrieved evidence was available."
            ),
            evidence_ids=tuple(item.evidence_id for item in bundle.evidence),
            consequences=tuple(f"{item_id}:{disposition.value}" for item_id, disposition in bundle.suppressed),
            metadata={
                "query": bundle.query.query,
                "grounding_complete": bundle.grounding_complete,
                "requested_tiers": tuple(int(tier) for tier in bundle.query.requested_tiers),
            },
        )

    @staticmethod
    def _cross_lane_private(source_lane: RelationalLane, query: RetrievalQuery) -> bool:
        return (
            source_lane in _PRIVATE_LANES
            and query.target_lane in _PUBLIC_OR_WORK_LANES
            and not query.explicit_cross_lane_authorization
        )

    @staticmethod
    def _rank_and_deduplicate(
        evidence: list[EvidenceItem],
    ) -> tuple[tuple[EvidenceItem, ...], list[tuple[str, RetrievalDisposition]]]:
        ranked = sorted(
            evidence,
            key=lambda item: (int(item.authority_tier), -item.score, item.evidence_id),
        )
        seen: set[str] = set()
        deduped: list[EvidenceItem] = []
        suppressed: list[tuple[str, RetrievalDisposition]] = []

        for item in ranked:
            fingerprint = item.checksum or hashlib.sha256(
                " ".join(item.content.lower().split()).encode("utf-8")
            ).hexdigest()
            if fingerprint in seen:
                suppressed.append((item.evidence_id, RetrievalDisposition.DEDUPLICATED))
                continue
            seen.add(fingerprint)
            deduped.append(item)

        return tuple(deduped), suppressed
