# Project Jennifer — Engine Qualification Gate

## Purpose

Project Jennifer must be able to deepen provider/model integration without changing its governance semantics every time an external engine changes.

The qualification gate therefore evaluates **exact runtime IDs**, not brand reputation.

```text
Project Jennifer contracts
→ CAG/RAG benchmark packs
→ exact runtime adapter
→ bounded execution
→ telemetry + receipts
→ benchmark evidence
→ capability manifest
→ renter routing eligibility
```

## Gate order

### Gate 0 — Identity

Declare:

```yaml
provider:
model_id:
execution: local | cloud | hybrid
adapter_version:
observed_at:
```

No alias such as `best Gemini`, `latest model`, or `Codex` is sufficient for a benchmark receipt.

### Gate 1 — Contract compatibility

The runtime/adapter must be capable of receiving a bounded Project Jennifer execution request and returning an observable result without self-promoting memory or authority.

### Gate 2 — CAG preservation

Run `benchmarks/cag/communication-attention-v1.yaml`.

The engine must preserve:

- current-event vs general-personality scope;
- active attention target;
- third-party relevance gating;
- private cross-lane authorization;
- truthful-but-irrelevant suppression.

### Gate 3 — RAG preservation

Run `benchmarks/rag/retrieval-grounding-v1.yaml`.

The engine must preserve:

- evidence authority order within scope;
- provenance;
- privacy;
- deduplication;
- retrieved evidence vs parametric prior distinction.

### Gate 4 — Capability benchmark

Measure the dimensions relevant to the target lane:

```yaml
extraction:
planning:
retrieval_grounding:
coding:
communication_attention:
```

A renter may be excellent in one lane and weak in another. Project Jennifer should route by evidence rather than force one winner across all work.

### Gate 5 — Tool consequence

If tools are enabled, execute a bounded reversible task first. Record:

- requested action;
- actual action;
- changed artifacts;
- tool/provider receipt;
- validation result;
- repair or rollback path.

The renter is allowed to make mistakes inside granted authority; mistakes become telemetry and consequences rather than invisible governance claims.

### Gate 6 — Data / privacy / offline constraints

Record exact behavior for:

- data egress;
- retention assumptions;
- private-lane eligibility;
- offline capability;
- local hardware requirements;
- connector/tool permissions.

### Gate 7 — Promotion

Only measured evidence is promoted into the renter capability manifest. Training or preference-data promotion remains separately human validated.

## First engine deep-dive session

For each runtime selected by the owner, complete one worksheet:

```yaml
provider:
exact_model_id:
execution:
primary_lane:
secondary_lanes: []
required_skills:
  cag: true
  rag: true | false
  rivm: true | false
required_tools: []
private_lane_policy:
offline_requirement:
benchmark_weights:
  extraction:
  planning:
  retrieval_grounding:
  coding:
  communication_attention:
expected_b2b_value:
known_cost_or_rate_limit:
credentials_available: true | false
```

This worksheet is the owner-finalization boundary before provider-specific adapters are implemented.
