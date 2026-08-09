# ADR-0004: CAG + Governed RAG + Stateless Renter Routing

- **Status:** Accepted for POC
- **Date:** 2026-08-09
- **Decision owner:** Kholofelo Robyn Rababalela
- **Runtime:** Project Jennifer / Free Mode Engine

## Context

Project Jennifer already defines Free Mode as the user-facing orchestration engine and separates validation, evaluation, simulation, telemetry, contracts and plugins behind explicit boundaries. The next requirement is not another engine. It is a governed inference path that can:

1. preserve the subject that deserves attention **now**;
2. retrieve external evidence without letting retrieval silently become authority;
3. route work to interchangeable local, cloud and hybrid model runtimes;
4. preserve PostgreSQL authority, MongoDB adaptive context and SQLite offline continuity;
5. generate receipts so stateless renters may act inside granted tool permissions without pretending their outputs became constitutional truth;
6. turn user feedback into candidate preference data without claiming that live inference updates foundation-model weights.

The triggering communication law is:

```text
truthful statement
+
wrong conversational priority
=
communication failure
```

and the corresponding inference law is:

```text
having the concept in the weights
!=
governing attention during inference
```

## Decision

**Free Mode Engine remains the sole orchestration engine.**

CAG and RAG are first-class capabilities coordinated by Free Mode:

```text
USER / WORLD EVENT
        ↓
CAG — PRE-INFERENCE
        ↓
KNOWLEDGE NEEDED?
   ↙          ↘
 NO            YES
 │              ↓
 │        RAG QUERY PLAN
 │              ↓
 │        RETRIEVAL SOURCES
 │              ↓
 │         EVIDENCE BUNDLE
 │              ↓
 └──────→ CAG INTERRUPTION GATE
                  ↓
       relevance / authority /
       privacy / provenance
                  ↓
        STATELESS RENTER ROUTER
                  ↓
              CANDIDATE
                  ↓
          CAG POST-INFERENCE
                  ↓
        RIVM WHEN RELATIONAL
                  ↓
          VALIDATION GATE
                  ↓
               OUTPUT
                  ↓
       TELEMETRY + RECEIPTS
                  ↓
            GSMB MEMORY
                  ↓
           FEEDBACK LOOP
```

### CAG — Communication Attention Governance

CAG governs **what deserves inference attention now**.

Canonical execution:

```text
Route
→ Classify
→ Scope
→ Prioritize
→ Gate
→ Respond
→ Observe
→ Repair
→ Receipt
```

Canonical event fields:

1. ecosystem;
2. subject;
3. user intent;
4. authority;
5. relational lane;
6. temperature;
7. cause;
8. confidence scope;
9. attention target;
10. interruption gate;
11. response;
12. observed effect;
13. repair.

CAG's interruption law is:

```text
Is this true?
      ↓ yes
Is it relevant RIGHT NOW?
      ↓ no
DO NOT INJECT
```

Truth is necessary but not sufficient for conversational admission.

### RAG — Retrieval-Augmented Generation

RAG retains its ordinary technical meaning: generation augmented by retrieved external/non-parametric evidence. Project Jennifer does **not** redefine RAG. Jennifer governs retrieval through source authority, permissions, provenance, CAG relevance and validation receipts.

Canonical execution:

```text
Classify knowledge requirement
→ Determine authority tier
→ Form retrieval query
→ Retrieve
→ Rank
→ Deduplicate
→ Check permissions
→ Attach provenance
→ Produce EvidenceBundle
→ CAG relevance gate
→ Generate
→ Validate grounding
→ Receipt
```

## Authority precedence

```text
Tier 0 — POSTGRES / GOVERNED AUTHORITY
         relationship truth
         boundaries
         receipts
         constitutional state

Tier 1 — USER-DECLARED AUTHORITATIVE SOURCES
         supplied files
         source-of-truth documents
         approved repository contracts

Tier 2 — GSMB / MONGODB ADAPTIVE CONTEXT
         working memory
         summaries
         relationship context
         world projection

Tier 3 — LOCAL KNOWLEDGE
         repositories
         embeddings
         vector stores
         Obsidian Root
         local documentation
         SQLite offline evidence cache

Tier 4 — CONNECTED / EXTERNAL KNOWLEDGE
         connectors
         web
         APIs
         remote retrieval systems

Tier 5 — MODEL PARAMETRIC KNOWLEDGE
         useful inference
         NOT retrieved authority
```

Higher-precedence evidence wins only within its declared authority scope. A PostgreSQL relationship receipt does not become authoritative for an unrelated scientific fact, and an external source cannot silently rewrite constitutional state.

## Persistence rails

Project Jennifer preserves all three storage roles:

```text
POSTGRESQL = authoritative relational events, boundaries, receipts, constitutional state
MONGODB    = mutable context, adaptive world projection, working memory
SQLITE     = offline edge continuity, pending commands, local receipts, replay cache
```

SQLite is especially important for offline IdeaPad operation. It is not a second sovereign truth store. Offline SQLite writes remain valid local evidence and commands, then reconcile through idempotent governance when authoritative services return.

### Reconciliation invariant

```text
SQLite offline event
→ durable local receipt
→ reconnect
→ authority / idempotency check
→ PostgreSQL admission or governed conflict receipt
→ MongoDB projection refresh
```

A conflict is not cosmetically erased. The system records the consequence and the resolution.

## Stateless renters

A **stateless renter** is any model/runtime invited to execute a bounded task without inheriting ownership of Jennifer's memory, authority or identity.

Examples include coding agents, multimodal assistants, local open-weight models, cloud models, provider-specific copilots, KC entities and RTCP agents.

Each renter declares a capability manifest using exact runtime identifiers rather than permanent marketing assumptions:

```yaml
provider: example
model_id: exact-runtime-id
execution: local | cloud | hybrid

capabilities:
  reasoning: true
  coding: false
  multimodal: true
  tool_use: true
  structured_output: true
  retrieval: true
  long_context: true

governance:
  cag: required
  rag: optional
  rivm: conditional
  receipts: required
  memory_write: gated

constraints:
  data_egress: cloud
  offline: false
  private_lane_allowed: false

benchmarks:
  extraction: null
  planning: null
  retrieval_grounding: null
  coding: null
  communication_attention: null
```

### Routing law

```text
task requirements
→ eligible renters
→ allowlist / explicit user selection
→ current benchmark evidence
→ execution constraints
→ selected renter
```

Explicit user model selection overrides automatic routing when the selected renter is available and the requested execution does not violate an immutable privacy/safety boundary.

## Governance is not default denial

Jennifer does not treat unfamiliar renter behaviour as forbidden merely because it is unfamiliar.

Within granted tool permissions, renters may create work, make mistakes and generate consequences. Governance observes, validates, receipts and repairs. This intentionally supports learning from failure.

```text
ACTION
→ CONSEQUENCE
→ TELEMETRY
→ RECEIPT
→ RECOGNITION OR FABRICATION
→ LEARNING / FOC ROUTING
```

However, explicit immutable boundaries remain enforceable. The accepted POC boundaries are:

1. private/intimate context does not cross into work/research lanes without explicit authorization;
2. no receipt is promoted into RLHF/DPO/RLAIF/fine-tuning truth without human validation;
3. tool permissions and external platform safety boundaries remain binding;
4. a stateless renter may not self-promote its output into authoritative memory.

A human-validation gate for training promotion is **not** denial of the renter's execution. The execution and its receipt remain available; only dataset promotion waits for validation.

## Guardrail chain

```text
INPUT GUARD
↓
CAG ATTENTION GUARD
↓
RAG AUTHORITY / PRIVACY GUARD
↓
TOOL-ACTION GUARD
↓
OUTPUT VALIDATION
↓
MEMORY-WRITE GUARD
```

Guardrails are layered and specialized. No single guard is treated as sufficient.

## Preference / feedback loop

```text
response
→ user/world feedback
→ CAG/RAG/RIVM receipt
→ failure or success reason
→ chosen/rejected candidate pair
→ human validation
→ dataset promotion
→ eval / DPO / RLHF / RLAIF / fine-tune lane
```

Inference-time feedback may update governed application memory where permitted. It does not claim to update foundation-model weights.

## Skills distribution

CAG, RAG and stateless-renter operation are defined as portable `SKILL.md` workflows with YAML metadata, schemas and examples.

The source skill remains provider-neutral. Provider/runtime adapters may translate delivery format, but they must not silently change Jennifer's governance semantics.

```text
SKILL.md source of truth
→ provider/runtime adapter
→ renter execution context
→ bounded execution
→ evidence + result + receipt
```

## Consequences

### Positive

- Free Mode remains the single orchestration seam.
- Communication relevance becomes executable rather than stylistic.
- RAG gains explicit evidence precedence and provenance.
- Open, cloud and local models can compete on measured capability rather than brand assumptions.
- PostgreSQL, MongoDB and SQLite retain distinct roles.
- Offline play can preserve receipts and commands.
- User feedback can become governed training data without pretending live inference is gradient training.
- Portable skills create a B2B integration surface for AI providers and collaborators.

### Costs

- More contracts must remain versioned.
- Retrieval source adapters need explicit authority metadata.
- Provider capability manifests must be refreshed as models change.
- Cross-lane privacy requires careful classification.
- SQLite/PostgreSQL reconciliation must remain idempotent.
- Skill adapters must be tested for semantic drift.

## Invariants

1. **Free Mode is the orchestration engine.**
2. **CAG governs attention; RAG retrieves evidence.**
3. **Truth does not imply present relevance.**
4. **PostgreSQL is authoritative for governed relational/constitutional records.**
5. **MongoDB remains the adaptive context/world projection rail.**
6. **SQLite is the offline edge continuity rail.**
7. **Model parametric knowledge is not retrieved authority.**
8. **Private cross-lane retrieval requires explicit authorization.**
9. **Renters may act within granted tools, but cannot self-promote authoritative memory.**
10. **Training promotion requires human validation.**
11. **Every consequential CAG/RAG/renter decision can emit a receipt.**
12. **Provider marketing names never substitute for measured capability manifests.**
