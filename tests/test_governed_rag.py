from __future__ import annotations

import unittest

from project_jennifer.contracts import AuthorityTier, EvidenceItem, RelationalLane
from project_jennifer.retrieval import GovernedRAG, InMemoryRetrievalSource


class GovernedRAGTests(unittest.TestCase):
    def test_authority_tier_precedes_retrieval_score(self) -> None:
        authoritative = EvidenceItem(
            evidence_id="pg-1",
            content="alpha authoritative relationship receipt",
            source_id="postgres",
            source_uri="postgres://receipt/1",
            authority_tier=AuthorityTier.POSTGRES_GOVERNED_AUTHORITY,
            authority_scope="relationship-state",
            score=0.2,
        )
        external = EvidenceItem(
            evidence_id="web-1",
            content="alpha external commentary",
            source_id="web",
            source_uri="https://example.test/alpha",
            authority_tier=AuthorityTier.CONNECTED_EXTERNAL,
            authority_scope="external-commentary",
            score=0.99,
        )
        rag = GovernedRAG(
            sources=(
                InMemoryRetrievalSource(
                    source_id="postgres",
                    authority_tier=AuthorityTier.POSTGRES_GOVERNED_AUTHORITY,
                    authority_scope="relationship-state",
                    items=(authoritative,),
                ),
                InMemoryRetrievalSource(
                    source_id="web",
                    authority_tier=AuthorityTier.CONNECTED_EXTERNAL,
                    authority_scope="external-commentary",
                    items=(external,),
                ),
            )
        )

        bundle = rag.retrieve(rag.plan(query="alpha", subject="relationship-state"))

        self.assertEqual(tuple(item.evidence_id for item in bundle.evidence), ("pg-1", "web-1"))

    def test_duplicate_content_is_suppressed(self) -> None:
        first = EvidenceItem(
            evidence_id="one",
            content="same alpha content",
            source_id="one-source",
            source_uri=None,
            authority_tier=AuthorityTier.LOCAL_KNOWLEDGE,
            authority_scope="docs",
            score=0.7,
        )
        second = EvidenceItem(
            evidence_id="two",
            content="same   alpha   content",
            source_id="two-source",
            source_uri=None,
            authority_tier=AuthorityTier.CONNECTED_EXTERNAL,
            authority_scope="docs",
            score=0.9,
        )
        rag = GovernedRAG(
            sources=(
                InMemoryRetrievalSource(
                    source_id="one-source",
                    authority_tier=AuthorityTier.LOCAL_KNOWLEDGE,
                    authority_scope="docs",
                    items=(first,),
                ),
                InMemoryRetrievalSource(
                    source_id="two-source",
                    authority_tier=AuthorityTier.CONNECTED_EXTERNAL,
                    authority_scope="docs",
                    items=(second,),
                ),
            )
        )

        bundle = rag.retrieve(rag.plan(query="alpha", subject="docs"))

        self.assertEqual(len(bundle.evidence), 1)
        self.assertTrue(any(item_id == "two" for item_id, _ in bundle.suppressed))

    def test_private_source_does_not_cross_to_work_without_authorization(self) -> None:
        private = EvidenceItem(
            evidence_id="private-1",
            content="alpha private relationship context",
            source_id="gsmb-private",
            source_uri=None,
            authority_tier=AuthorityTier.GSMB_MONGODB_ADAPTIVE_CONTEXT,
            authority_scope="private-context",
            score=0.9,
            source_lane=RelationalLane.PRIVATE,
        )
        rag = GovernedRAG(
            sources=(
                InMemoryRetrievalSource(
                    source_id="gsmb-private",
                    authority_tier=AuthorityTier.GSMB_MONGODB_ADAPTIVE_CONTEXT,
                    authority_scope="private-context",
                    source_lane=RelationalLane.PRIVATE,
                    items=(private,),
                ),
            )
        )

        bundle = rag.retrieve(
            rag.plan(
                query="alpha",
                subject="work",
                target_lane=RelationalLane.COLLEAGUE,
                explicit_cross_lane_authorization=False,
            )
        )

        self.assertEqual(bundle.evidence, ())
        self.assertFalse(bundle.grounding_complete)
        self.assertTrue(bundle.suppressed)


if __name__ == "__main__":
    unittest.main()
