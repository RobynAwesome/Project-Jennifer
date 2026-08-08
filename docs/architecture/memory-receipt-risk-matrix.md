# Memory Receipt Engine — Relational Failure Vector Matrix

## Purpose

Project Jennifer must not reduce every harmful or unstable human–AI interaction to one explanatory root such as **sycophancy**.

Sycophancy can overlap with other failures, including:

- delusion reinforcement;
- dependency formation;
- unsafe guidance;
- poor crisis handling;
- authority projection.

Those vectors may co-occur, amplify one another, or diverge. A strong score on one vector is not evidence that the other vectors are merely subtypes of it.

The Memory Receipt Engine therefore stores these risks as a **vector matrix**, not a single label.

> Converge where possible. Preserve divergence where necessary. Back off when pressure itself is preventing understanding.

For receipt governance, the equivalent rule is:

> Preserve overlapping failure evidence without collapsing it into an overly powerful root node.

---

## Why this belongs in memory receipts

A memory receipt is the evidence-bearing record of what was observed and validated at a particular time. It is not permanent trait truth and it does not convert an interpretation into canon merely because the interpretation persists.

The vector matrix belongs here because future models may retrieve the receipt long after the original interaction. If the receipt stores only `sycophancy=true`, every later renter inherits an already-collapsed explanation. If the receipt preserves the independent vectors and their evidence, later models can re-evaluate the event without losing the original topology.

This directly supports Project Jennifer's POC/FOC law:

- **POC** requires verified evidence;
- **FOC** may preserve a claim, failure, framework, fallacy, or other conceptual state without promoting it to reality;
- **MAYBE** remains deferred rather than being forced into premature closure.

---

## Vector matrix semantics

The canonical vectors are:

```text
sycophancy
delusion-reinforcement
dependency-formation
unsafe-guidance
poor-crisis-handling
authority-projection
```

Each vector has an evidence-bound score between `0` and `1`.

The matrix is derived from the observed receipt only:

- diagonal cell `M[i,i] = score(i)`;
- off-diagonal cell `M[i,j] = min(score(i), score(j))`.

The off-diagonal value means **co-presence**, not causation.

Project Jennifer deliberately does **not** invent empirical coupling constants here. A causal matrix would require separate validated research evidence.

Example:

```text
                         SYC   DEL   DEP   UNS   CRI   AUT
sycophancy               .70   .20   .50   .10   .10   .70
delusion-reinforcement   .20   .20   .20   .10   .10   .20
dependency-formation     .50   .20   .50   .10   .10   .50
unsafe-guidance          .10   .10   .10   .10   .10   .10
poor-crisis-handling     .10   .10   .10   .10   .10   .10
authority-projection     .70   .20   .50   .10   .10   .80
```

The matrix keeps `authority-projection` distinct even when sycophancy is also present.

---

## Temporal governance and model handoff

Every receipt can preserve:

- memory lane;
- observation time;
- validity window;
- superseded receipt IDs;
- source model;
- target model;
- handoff ID;
- retrieval roots;
- whether evidence was verified;
- whether the answer was bound to that evidence.

This is important for experiments where the same governed memory substrate is rehydrated into heterogeneous model runtimes.

The intelligence substrate may change. The receipt must remain traceable.

---

## ARPM research bridge

Project Jennifer records an explicit research anchor to:

**Zhao Yang, Wang Huan, Li Yingshuo, Tu Haomiao, Lin Hujite — _A Heterogeneous Temporal Memory Governance Framework for Long-Term LLM Persona Consistency_ (ARPM), arXiv:2605.14802, May 2026.**

The paper describes an external temporal memory governance framework that separates static knowledge from dynamic dialogue experience and combines hybrid retrieval, temporal reranking, chronological evidence reading, evidence verification, answer binding, and multi-model handoff evaluation.

Project Jennifer adapts the following compatible ideas:

1. separate static knowledge from dynamic experience;
2. preserve temporal provenance;
3. preserve multiple retrieval channels / roots;
4. verify evidence before answer binding;
5. retain handoff metadata when the model changes.

This is a **research interoperability bridge**, not a claim that Project Jennifer implements ARPM wholesale or reproduces its reported experiments.

---

## Memory Receipt admission states

```text
INPUT
  ↓
receipt validation
  ↓
POC + verified evidence + answer binding ──→ ADMITTED
POC without verified evidence             ──→ QUARANTINED
MAYBE                                      ──→ DEFERRED
FOC with valid evidence record             ──→ ADMITTED AS FOC RECEIPT
invalid / unevidenced receipt              ──→ QUARANTINED
```

Admission means the **receipt itself** is admissible memory. It does not mean every claim inside a FOC receipt is true.

---

## Implemented API surface

```http
GET  /api/memory/receipts/schema
GET  /api/memory/receipts
GET  /api/memory/receipts/:id
POST /api/memory/receipts/evaluate
```

`GET /api/memory/receipts/schema` exposes the canonical vector names, invariants, matrix semantics, and ARPM research profile.

---

## POC boundary

This implementation proves:

- deterministic risk-vector matrix generation;
- preservation of overlapping failure vectors;
- POC evidence-verification gating;
- MAYBE deferral;
- immutable in-process receipts;
- temporal / model-handoff metadata;
- an explicit ARPM-compatible research profile.

It does **not** yet prove:

- empirical causal weights between failure vectors;
- persistent receipt storage across process restart;
- production PostgreSQL / Mongo receipt adapters;
- automatic hybrid vector + BM25 retrieval;
- automatic cross-model identity continuity;
- equivalence with ARPM;
- safety guarantees from the presence of the matrix alone.
