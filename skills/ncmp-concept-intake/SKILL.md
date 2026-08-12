---
name: ncmp-concept-intake
title: "New Concept MMAO Protocol Intake"
protocol_id: "MMAO.NCMP"
version: "1.0.0"
status: "CODED_PORTABLE_WORKFLOW"
class: "Project Jennifer Concept Governance Skill"
implementation: "packages/shared/src/ncmp.ts"
execution_model: "Candidate -> Human Recognition -> Validation -> Registration / Rejection -> Supersession"
---

# NCMP — New Concept MMAO Protocol

## Purpose

Use NCMP for the rare case where a new concept originates inside a Multi-Agent Mobile Orchestration session rather than being supplied beforehand by the human architect.

Current code exists in `packages/shared/src/ncmp.ts`.

## Sovereignty rule

Agents may originate and propose a concept.

> **Only the human architect may recognize it as an NCMP concept.**

Recognition is not validation. Validation is not registration. Registration is the transition into Project Jennifer canon.

## Current state machine

```text
candidate
→ recognized
→ validated
→ registered

recognized
→ rejected

registered
→ superseded
```

`deferred` validation returns the concept to the recognized state rather than promoting it.

## Candidate requirements

Current validation requires:

```text
id
acronym
name
definition
problemRecognized
protocolContribution
origin.focusStationId
origin.originatingAgent
origin.sourceEvidence[]
origin.originatedAt
```

At least one source-evidence reference is required.

## Workflow

### 1. Propose

An agent or governed group may produce a candidate. Proposal emits a receipt from `none` to `candidate`.

### 2. Human recognition

Recognition requires the recognizing architect, recognition statement, and timestamp.

Do not fabricate recognition on behalf of the human.

### 3. Validate

Validation requires evidence and returns `passed`, `failed`, or `deferred`.

```text
passed   → validated
failed   → rejected
deferred → recognized
```

### 4. Register

Only a validated concept may be registered. Registration emits a receipt and enters the concept into Project Jennifer canon.

### 5. Supersede when necessary

A registered concept may be superseded only by another registered concept. Preserve the replacement reference and receipt rather than deleting history.

## Hard failures

Do not:

- treat agent generation as human recognition;
- register an unvalidated concept;
- register without evidence-bearing prior transitions;
- erase a rejected or superseded history;
- claim PostgreSQL persistence merely because the current registry class exists—the current implementation explicitly remains storage-agnostic/in-memory;
- call a candidate permanent Jennifer canon before registration.

## Success condition

NCMP succeeds when agent-originated novelty can enter Project Jennifer without stealing human authority: the origin is preserved, recognition is explicit, validation is evidenced, registration is gated, and every transition leaves a receipt.
