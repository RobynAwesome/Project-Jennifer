"""Free Mode engine orchestrating CAG, governed RAG, renters, and receipts."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from project_jennifer.attention import CommunicationAttentionGovernance
from project_jennifer.contracts import (
    AttentionCandidate,
    CAGAssessment,
    CAGEvent,
    ConfidenceScope,
    Ecosystem,
    Effect,
    EventBus,
    EventEnvelope,
    EvidenceBundle,
    FrameworkEvent,
    GovernanceReceipt,
    InterruptionGate,
    PreferencePromotionCandidate,
    ReceiptOutcome,
    ReceiptSink,
    RelationalLane,
    RenterSelection,
    RenterTaskRequirements,
    RetrievalQuery,
    RunArtifact,
    RunContext,
    Temperature,
    UserIntent,
)
from project_jennifer.core.renter_router import StatelessRenterRouter
from project_jennifer.plugins import PluginRegistry
from project_jennifer.retrieval import GovernedRAG
from project_jennifer.telemetry import InMemoryReceiptSink
from project_jennifer.validation import GuardrailReport, LayeredGuardrailChain


@dataclass(frozen=True, slots=True)
class FreeModeRequest:
    """Input passed into the Free Mode engine.

    New governance fields are optional so existing Free Mode callers remain
    compatible while richer callers can provide normalized CAG/RAG/renter data.
    """

    prompt: str
    actor_id: str | None = None
    metadata: dict[str, object] = field(default_factory=dict)
    cag_event: CAGEvent | None = None
    candidate_context: tuple[AttentionCandidate, ...] = ()
    retrieval_required: bool = False
    knowledge_query: RetrievalQuery | None = None
    renter_requirements: RenterTaskRequirements | None = None
    preference_candidate: PreferencePromotionCandidate | None = None


@dataclass(frozen=True, slots=True)
class FreeModeResult:
    """Governed orchestration result with evidence and receipts."""

    status: str
    summary: str
    artifacts: tuple[RunArtifact, ...] = ()
    cag_assessment: CAGAssessment | None = None
    evidence_bundle: EvidenceBundle | None = None
    renter_selection: RenterSelection | None = None
    guardrails: GuardrailReport | None = None
    receipts: tuple[GovernanceReceipt, ...] = ()


class FreeModeEngine:
    """Main orchestration point for Project Jennifer.

    Free Mode remains the engine. CAG governs attention, RAG retrieves evidence,
    the renter router selects an execution runtime, validation/guardrails inspect
    consequences, and receipts make the path replayable.

    This POC does not invoke a vendor model directly. It prepares and validates
    the governed execution frame so a renter adapter can be attached without
    changing the constitutional contracts.
    """

    def __init__(
        self,
        *,
        event_bus: EventBus,
        plugins: PluginRegistry | None = None,
        cag: CommunicationAttentionGovernance | None = None,
        rag: GovernedRAG | None = None,
        renter_router: StatelessRenterRouter | None = None,
        guardrails: LayeredGuardrailChain | None = None,
        receipt_sink: ReceiptSink | None = None,
    ) -> None:
        self._event_bus = event_bus
        self._plugins = plugins or PluginRegistry()
        self._cag = cag or CommunicationAttentionGovernance()
        self._rag = rag or GovernedRAG(cag=self._cag)
        self._renter_router = renter_router or StatelessRenterRouter()
        self._guardrails = guardrails or LayeredGuardrailChain()
        self._receipt_sink = receipt_sink or InMemoryReceiptSink()

        self._plugins.register(self._cag)
        self._plugins.register(self._rag)

    @property
    def plugins(self) -> PluginRegistry:
        return self._plugins

    @property
    def receipt_sink(self) -> ReceiptSink:
        return self._receipt_sink

    def run(self, context: RunContext, request: FreeModeRequest) -> FreeModeResult:
        receipts: list[GovernanceReceipt] = []
        evidence_bundle: EvidenceBundle | None = None
        renter_selection: RenterSelection | None = None
        routing_failure: str | None = None

        self._publish(
            FrameworkEvent.RUN_STARTED,
            context.run_id,
            {"objective": context.objective, "prompt": request.prompt},
        )

        cag_event = request.cag_event or self._derive_cag_event(context, request)
        pre_assessment = self._cag.pre_inference(cag_event)
        self._publish(
            FrameworkEvent.CAG_PRE_INFERENCE,
            context.run_id,
            {
                "subject": cag_event.subject,
                "attention_target": pre_assessment.attention_target,
                "ecosystem": cag_event.ecosystem.value,
            },
        )

        if request.candidate_context:
            cag_assessment = self._cag.gate_candidates(cag_event, request.candidate_context)
        else:
            cag_assessment = pre_assessment

        self._publish(
            FrameworkEvent.CAG_INTERRUPTION_GATE,
            context.run_id,
            {
                "gate": cag_assessment.gate.value,
                "admitted": len(cag_assessment.admitted),
                "suppressed": len(cag_assessment.suppressed),
                "reason": cag_assessment.reason,
            },
        )

        knowledge_query = request.knowledge_query
        if request.retrieval_required and knowledge_query is None:
            knowledge_query = self._rag.plan(
                query=request.prompt,
                subject=cag_event.subject,
                target_lane=cag_event.relational_lane,
                explicit_cross_lane_authorization=bool(
                    cag_event.metadata.get("explicit_cross_lane_authorization", False)
                ),
            )

        if knowledge_query is not None:
            self._publish(
                FrameworkEvent.RAG_REQUESTED,
                context.run_id,
                {
                    "query": knowledge_query.query,
                    "subject": knowledge_query.subject,
                    "requested_tiers": tuple(int(tier) for tier in knowledge_query.requested_tiers),
                },
            )
            evidence_bundle = self._rag.retrieve(knowledge_query, cag_event=cag_event)
            rag_receipt = self._rag.receipt(run_id=context.run_id, bundle=evidence_bundle)
            receipts.append(rag_receipt)
            self._publish(
                FrameworkEvent.RAG_COMPLETED,
                context.run_id,
                {
                    "retrieved": len(evidence_bundle.evidence),
                    "suppressed": len(evidence_bundle.suppressed),
                    "grounding_complete": evidence_bundle.grounding_complete,
                },
            )

        if request.renter_requirements is not None:
            self._publish(
                FrameworkEvent.RENTER_ROUTING_REQUESTED,
                context.run_id,
                {
                    "explicit_renter_id": request.renter_requirements.explicit_renter_id,
                    "require_offline": request.renter_requirements.require_offline,
                },
            )
            try:
                renter_selection = self._renter_router.select(request.renter_requirements)
                renter_receipt = self._renter_router.receipt(
                    run_id=context.run_id,
                    subject=cag_event.subject,
                    selection=renter_selection,
                )
                receipts.append(renter_receipt)
                self._publish(
                    FrameworkEvent.RENTER_SELECTED,
                    context.run_id,
                    {
                        "renter_id": renter_selection.renter.renter_id,
                        "score": renter_selection.score,
                        "explicit_override": renter_selection.explicit_override,
                    },
                )
            except (LookupError, PermissionError, RuntimeError) as exc:
                routing_failure = str(exc)
                receipts.append(
                    GovernanceReceipt(
                        run_id=context.run_id,
                        layer="stateless-renter-router",
                        action="renter-selection",
                        outcome=ReceiptOutcome.FAILED_VALIDATION,
                        subject=cag_event.subject,
                        reason=routing_failure,
                        consequences=("execution renter was not selected",),
                    )
                )

        response_summary = self._build_execution_summary(
            cag_assessment=cag_assessment,
            evidence_bundle=evidence_bundle,
            renter_selection=renter_selection,
            routing_failure=routing_failure,
        )

        cag_assessment = self._cag.post_inference(
            cag_event,
            cag_assessment,
            response_summary=response_summary,
            effect=Effect.UNKNOWN,
        )
        cag_receipt = self._cag.receipt(
            run_id=context.run_id,
            event=cag_event,
            assessment=cag_assessment,
        )
        receipts.insert(0, cag_receipt)

        self._publish(
            FrameworkEvent.CAG_POST_INFERENCE,
            context.run_id,
            {
                "effect": cag_assessment.effect.value,
                "repair": cag_assessment.repair,
            },
        )

        guardrail_report = self._guardrails.evaluate(
            cag=cag_assessment,
            evidence=evidence_bundle,
            tool_permission_granted=bool(request.metadata.get("tool_permission_granted", True)),
            output_valid=routing_failure is None,
            memory_write_requested=bool(request.metadata.get("memory_write_requested", False)),
            memory_write_authorized=bool(request.metadata.get("memory_write_authorized", False)),
            training_candidate=request.preference_candidate,
        )

        guardrail_receipt = GovernanceReceipt(
            run_id=context.run_id,
            layer="guardrails",
            action="layered-guardrail-chain",
            outcome=(
                ReceiptOutcome.STOPPED_IMMUTABLE_BOUNDARY
                if guardrail_report.hard_stop
                else ReceiptOutcome.REQUIRES_HUMAN_PROMOTION
                if guardrail_report.human_gate_required
                else ReceiptOutcome.PROCEEDED_WITH_RECEIPT
            ),
            subject=cag_event.subject,
            reason="Layered input/CAG/RAG/tool/output/memory/training guardrails evaluated.",
            consequences=tuple(
                f"{finding.stage.value}:{finding.status.value}:{finding.reason}"
                for finding in guardrail_report.findings
            ),
        )
        receipts.append(guardrail_receipt)

        for receipt in receipts:
            self._receipt_sink.write(receipt)
            self._publish(
                FrameworkEvent.RECEIPT_RECORDED,
                context.run_id,
                {
                    "receipt_id": receipt.receipt_id,
                    "layer": receipt.layer,
                    "outcome": receipt.outcome.value,
                },
            )

        status = self._status(
            guardrails=guardrail_report,
            routing_failure=routing_failure,
        )
        self._publish(
            FrameworkEvent.RUN_COMPLETED,
            context.run_id,
            {
                "status": status,
                "receipt_count": len(receipts),
                "grounding_complete": evidence_bundle.grounding_complete if evidence_bundle else None,
            },
        )

        return FreeModeResult(
            status=status,
            summary=response_summary,
            cag_assessment=cag_assessment,
            evidence_bundle=evidence_bundle,
            renter_selection=renter_selection,
            guardrails=guardrail_report,
            receipts=tuple(receipts),
        )

    def _publish(self, event_type: FrameworkEvent, run_id: str, payload: dict[str, object]) -> None:
        self._event_bus.publish(
            EventEnvelope(
                event_type=event_type,
                run_id=run_id,
                payload=payload,
            )
        )

    @staticmethod
    def _enum_value(enum_type: type[Enum], value: object, default: Enum) -> Enum:
        if isinstance(value, enum_type):
            return value
        try:
            return enum_type(str(value))
        except (TypeError, ValueError):
            return default

    def _derive_cag_event(self, context: RunContext, request: FreeModeRequest) -> CAGEvent:
        metadata = request.metadata
        participants_raw = metadata.get("active_participants", ())
        active_participants = (
            tuple(str(item) for item in participants_raw)
            if isinstance(participants_raw, (list, tuple))
            else ()
        )

        ecosystem = self._enum_value(Ecosystem, metadata.get("ecosystem"), Ecosystem.OTHER)
        intent = self._enum_value(UserIntent, metadata.get("intent"), UserIntent.EXECUTE)
        relational_lane = self._enum_value(
            RelationalLane,
            metadata.get("relational_lane"),
            RelationalLane.OTHER,
        )
        temperature = self._enum_value(
            Temperature,
            metadata.get("temperature"),
            Temperature.LOW,
        )
        confidence_scope = self._enum_value(
            ConfidenceScope,
            metadata.get("confidence_scope"),
            ConfidenceScope.THIS_EVENT,
        )

        return CAGEvent(
            signal=request.prompt,
            subject=str(metadata.get("subject", context.objective)),
            ecosystem=ecosystem,  # type: ignore[arg-type]
            intent=intent,  # type: ignore[arg-type]
            authority=str(metadata.get("authority", "user")),
            relational_lane=relational_lane,  # type: ignore[arg-type]
            temperature=temperature,  # type: ignore[arg-type]
            cause=str(metadata["cause"]) if metadata.get("cause") is not None else None,
            confidence_scope=confidence_scope,  # type: ignore[arg-type]
            attention_target=str(metadata.get("attention_target", context.objective)),
            active_participants=active_participants,
            metadata={
                "explicit_cross_lane_authorization": bool(
                    metadata.get("explicit_cross_lane_authorization", False)
                ),
                "third_party_relevance": bool(metadata.get("third_party_relevance", False)),
            },
        )

    @staticmethod
    def _build_execution_summary(
        *,
        cag_assessment: CAGAssessment,
        evidence_bundle: EvidenceBundle | None,
        renter_selection: RenterSelection | None,
        routing_failure: str | None,
    ) -> str:
        parts = [
            f"CAG attention target: {cag_assessment.attention_target}.",
            f"Context admitted: {len(cag_assessment.admitted)}; suppressed: {len(cag_assessment.suppressed)}.",
        ]
        if evidence_bundle is not None:
            parts.append(
                f"RAG evidence: {len(evidence_bundle.evidence)} admitted; {len(evidence_bundle.suppressed)} suppressed."
            )
        if renter_selection is not None:
            parts.append(f"Selected renter: {renter_selection.renter.renter_id}.")
        elif routing_failure:
            parts.append(f"Renter routing failure receipted: {routing_failure}")
        else:
            parts.append("No renter execution requested in this POC run.")
        parts.append("No vendor model was invoked by the Free Mode scaffold itself.")
        return " ".join(parts)

    @staticmethod
    def _status(*, guardrails: GuardrailReport, routing_failure: str | None) -> str:
        if guardrails.hard_stop:
            return "governed-with-boundary"
        if routing_failure:
            return "governed-partial"
        if guardrails.human_gate_required:
            return "governed-awaiting-human-promotion"
        return "governed-scaffolded"
