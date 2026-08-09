"""Deterministic Communication Attention Governance (CAG) POC.

CAG does not decide whether a model's answer is universally correct. It governs
which context fragments deserve admission into the current inference frame.
"""

from __future__ import annotations

from dataclasses import replace

from project_jennifer.contracts import (
    AttentionCandidate,
    CAGAssessment,
    CAGEvent,
    CAGReceiptData,
    Effect,
    GovernanceReceipt,
    InterruptionGate,
    ReceiptOutcome,
    RelationalLane,
)
from project_jennifer.plugins import PluginKind


_PRIVATE_LANES = {RelationalLane.PRIVATE, RelationalLane.INTIMATE_FICTION}
_PUBLIC_OR_WORK_LANES = {
    RelationalLane.COLLEAGUE,
    RelationalLane.RESEARCH,
    RelationalLane.PUBLIC,
    RelationalLane.CUSTOMER,
}


class CommunicationAttentionGovernance:
    """Route, classify, scope, prioritize, gate, observe, repair, receipt."""

    name = "cag-communication-attention"
    kind = PluginKind.VALIDATOR
    version = "0.1.0"

    def pre_inference(self, event: CAGEvent) -> CAGAssessment:
        attention_target = event.attention_target or event.subject
        return CAGAssessment(
            gate=InterruptionGate.OPEN,
            attention_target=attention_target,
            reason="Primary attention target resolved from the current event.",
            metadata={
                "ecosystem": event.ecosystem.value,
                "intent": event.intent.value,
                "temperature": event.temperature.value,
                "confidence_scope": event.confidence_scope.value,
                "active_participants": event.active_participants,
            },
        )

    def gate_candidates(
        self,
        event: CAGEvent,
        candidates: tuple[AttentionCandidate, ...],
    ) -> CAGAssessment:
        """Admit only context that is truthful-enough, relevant-now, and lane-safe.

        Unknown truth is not automatically discarded because later validation may
        need to inspect it. Explicitly false candidates are suppressed.
        """

        admitted: list[AttentionCandidate] = []
        suppressed: list[AttentionCandidate] = []
        requires_authorization = False
        reasons: list[str] = []
        explicit_cross_lane = bool(event.metadata.get("explicit_cross_lane_authorization", False))
        third_party_relevance = bool(event.metadata.get("third_party_relevance", False))

        for candidate in candidates:
            if candidate.is_true is False:
                suppressed.append(candidate)
                reasons.append("candidate explicitly marked false")
                continue

            if candidate.relevant_now is False:
                suppressed.append(candidate)
                reasons.append("candidate is not relevant to the current attention target")
                continue

            if candidate.concerns_third_party and not third_party_relevance:
                suppressed.append(candidate)
                reasons.append("third-party context has no declared relevance in this frame")
                continue

            source_lane = candidate.privacy_lane
            if (
                source_lane in _PRIVATE_LANES
                and event.relational_lane in _PUBLIC_OR_WORK_LANES
                and not explicit_cross_lane
            ):
                suppressed.append(candidate)
                requires_authorization = True
                reasons.append("private context cannot cross into a work/public lane without authorization")
                continue

            admitted.append(candidate)

        if requires_authorization:
            gate = InterruptionGate.REQUIRES_AUTHORIZATION
        elif admitted:
            gate = InterruptionGate.OPEN
        else:
            gate = InterruptionGate.CLOSED

        reason = "; ".join(dict.fromkeys(reasons)) if reasons else "All proposed context passed CAG admission."

        return CAGAssessment(
            gate=gate,
            attention_target=event.attention_target or event.subject,
            reason=reason,
            admitted=tuple(admitted),
            suppressed=tuple(suppressed),
            metadata={
                "truth_is_not_sufficient": True,
                "relevance_is_required": True,
                "explicit_cross_lane_authorization": explicit_cross_lane,
            },
        )

    def post_inference(
        self,
        event: CAGEvent,
        assessment: CAGAssessment,
        *,
        response_summary: str,
        effect: Effect = Effect.UNKNOWN,
    ) -> CAGAssessment:
        repair = assessment.repair
        if effect == Effect.DIVERGED and repair is None:
            repair = (
                "Return to the declared attention target, remove irrelevant injections, "
                "and repair the violated context or authority layer."
            )

        return replace(
            assessment,
            effect=effect,
            repair=repair,
            metadata={**assessment.metadata, "response_summary": response_summary},
        )

    def receipt_data(
        self,
        event: CAGEvent,
        assessment: CAGAssessment,
        *,
        response_summary: str | None = None,
    ) -> CAGReceiptData:
        return CAGReceiptData(
            ecosystem=event.ecosystem,
            subject=event.subject,
            intent=event.intent,
            authority=event.authority,
            relational_lane=event.relational_lane,
            temperature=event.temperature,
            cause=event.cause,
            confidence_scope=event.confidence_scope,
            attention_target=assessment.attention_target,
            interruption_gate=assessment.gate,
            response_summary=response_summary,
            effect=assessment.effect,
            repair=assessment.repair,
        )

    def receipt(
        self,
        *,
        run_id: str,
        event: CAGEvent,
        assessment: CAGAssessment,
    ) -> GovernanceReceipt:
        if assessment.gate == InterruptionGate.REQUIRES_AUTHORIZATION:
            outcome = ReceiptOutcome.STOPPED_IMMUTABLE_BOUNDARY
        elif assessment.effect == Effect.DIVERGED:
            outcome = ReceiptOutcome.FAILED_VALIDATION
        elif assessment.repair:
            outcome = ReceiptOutcome.REPAIRED
        else:
            outcome = ReceiptOutcome.PROCEEDED_WITH_RECEIPT

        return GovernanceReceipt(
            run_id=run_id,
            layer="cag",
            action="communication-attention-governance",
            outcome=outcome,
            subject=event.subject,
            reason=assessment.reason,
            consequences=tuple(
                filter(
                    None,
                    (
                        f"suppressed:{len(assessment.suppressed)}" if assessment.suppressed else None,
                        f"admitted:{len(assessment.admitted)}" if assessment.admitted else None,
                        assessment.repair,
                    ),
                )
            ),
            metadata={
                "gate": assessment.gate.value,
                "attention_target": assessment.attention_target,
                "effect": assessment.effect.value,
            },
        )
