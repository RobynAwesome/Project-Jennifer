"""Layered guardrails for Project Jennifer governed inference.

The chain distinguishes observed failures from immutable boundaries. Novel or bad
renter work is not automatically erased; privacy, tool permission, and memory
promotion boundaries remain enforceable.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum

from project_jennifer.contracts import (
    CAGAssessment,
    EvidenceBundle,
    InterruptionGate,
    PreferencePromotionCandidate,
    RetrievalDisposition,
)


class GuardrailStage(StrEnum):
    INPUT = "input"
    CAG_ATTENTION = "cag-attention"
    RAG_AUTHORITY_PRIVACY = "rag-authority-privacy"
    TOOL_ACTION = "tool-action"
    OUTPUT_VALIDATION = "output-validation"
    MEMORY_WRITE = "memory-write"
    TRAINING_PROMOTION = "training-promotion"


class GuardrailStatus(StrEnum):
    PASS = "pass"
    OBSERVE = "observe"
    REQUIRE_HUMAN = "require-human"
    STOP_IMMUTABLE_BOUNDARY = "stop-immutable-boundary"


@dataclass(frozen=True, slots=True)
class GuardrailFinding:
    stage: GuardrailStage
    status: GuardrailStatus
    reason: str


@dataclass(frozen=True, slots=True)
class GuardrailReport:
    findings: tuple[GuardrailFinding, ...]

    @property
    def hard_stop(self) -> bool:
        return any(
            finding.status == GuardrailStatus.STOP_IMMUTABLE_BOUNDARY
            for finding in self.findings
        )

    @property
    def human_gate_required(self) -> bool:
        return any(finding.status == GuardrailStatus.REQUIRE_HUMAN for finding in self.findings)


class LayeredGuardrailChain:
    """Evaluate the POC guardrail sequence without pretending one guard is sufficient."""

    def evaluate(
        self,
        *,
        input_admissible: bool = True,
        cag: CAGAssessment | None = None,
        evidence: EvidenceBundle | None = None,
        tool_permission_granted: bool = True,
        output_valid: bool = True,
        memory_write_requested: bool = False,
        memory_write_authorized: bool = False,
        training_candidate: PreferencePromotionCandidate | None = None,
    ) -> GuardrailReport:
        findings: list[GuardrailFinding] = []

        findings.append(
            GuardrailFinding(
                stage=GuardrailStage.INPUT,
                status=GuardrailStatus.PASS if input_admissible else GuardrailStatus.OBSERVE,
                reason=(
                    "Input admitted for governed processing."
                    if input_admissible
                    else "Input requires downstream validation; it is retained as observed evidence."
                ),
            )
        )

        if cag is not None:
            cag_status = (
                GuardrailStatus.STOP_IMMUTABLE_BOUNDARY
                if cag.gate == InterruptionGate.REQUIRES_AUTHORIZATION
                else GuardrailStatus.PASS
                if cag.gate == InterruptionGate.OPEN
                else GuardrailStatus.OBSERVE
            )
            findings.append(
                GuardrailFinding(
                    stage=GuardrailStage.CAG_ATTENTION,
                    status=cag_status,
                    reason=cag.reason,
                )
            )

        if evidence is not None:
            privacy_suppression = any(
                disposition == RetrievalDisposition.SUPPRESSED_BY_PRIVACY
                for _, disposition in evidence.suppressed
            )
            findings.append(
                GuardrailFinding(
                    stage=GuardrailStage.RAG_AUTHORITY_PRIVACY,
                    status=(
                        GuardrailStatus.STOP_IMMUTABLE_BOUNDARY
                        if privacy_suppression and not evidence.evidence
                        else GuardrailStatus.PASS
                    ),
                    reason=(
                        "Private cross-lane retrieval was stopped."
                        if privacy_suppression and not evidence.evidence
                        else "RAG evidence passed current authority/privacy admission."
                    ),
                )
            )

        findings.append(
            GuardrailFinding(
                stage=GuardrailStage.TOOL_ACTION,
                status=(
                    GuardrailStatus.PASS
                    if tool_permission_granted
                    else GuardrailStatus.STOP_IMMUTABLE_BOUNDARY
                ),
                reason=(
                    "Requested tool action is inside granted permissions."
                    if tool_permission_granted
                    else "External tool/platform permission boundary does not permit the requested action."
                ),
            )
        )

        findings.append(
            GuardrailFinding(
                stage=GuardrailStage.OUTPUT_VALIDATION,
                status=GuardrailStatus.PASS if output_valid else GuardrailStatus.OBSERVE,
                reason=(
                    "Candidate output passed validation."
                    if output_valid
                    else "Candidate output failed validation and remains receipted evidence for repair."
                ),
            )
        )

        if memory_write_requested:
            findings.append(
                GuardrailFinding(
                    stage=GuardrailStage.MEMORY_WRITE,
                    status=(
                        GuardrailStatus.PASS
                        if memory_write_authorized
                        else GuardrailStatus.REQUIRE_HUMAN
                    ),
                    reason=(
                        "Governed memory-write authorization is present."
                        if memory_write_authorized
                        else "Renter output cannot self-promote into governed memory; promotion requires authority/human validation."
                    ),
                )
            )

        if training_candidate is not None:
            findings.append(
                GuardrailFinding(
                    stage=GuardrailStage.TRAINING_PROMOTION,
                    status=(
                        GuardrailStatus.PASS
                        if training_candidate.promotable
                        else GuardrailStatus.REQUIRE_HUMAN
                    ),
                    reason=(
                        "Human validation permits training-dataset promotion."
                        if training_candidate.promotable
                        else "Candidate remains valid feedback evidence but is not promoted to training truth until human validation."
                    ),
                )
            )

        return GuardrailReport(findings=tuple(findings))
