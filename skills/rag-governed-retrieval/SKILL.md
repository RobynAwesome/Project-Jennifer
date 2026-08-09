---
name: rag-governed-retrieval
description: Retrieve external and non-parametric evidence for generation while preserving Project Jennifer authority precedence, privacy lanes, provenance, CAG relevance, and receipts.
version: 0.1.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: governed-rag
  runtime_role: retriever
  orchestration_engine: free-mode
  portable: true
  evidence_schema: schemas/evidence-bundle.schema.json
  receipt_schema: schemas/retrieval-receipt.schema.json
  tags:
    - rag
    - retrieval
    - grounding
    - provenance
    - governance
---

# RAG — Governed Retrieval

## Purpose

Use this skill when the current task requires evidence outside the active model's parametric knowledge or when a governed source must be consulted before generation.

RAG keeps its ordinary technical meaning:

```text
retrieval
+
generation
=
retrieval-augmented generation
```

Project Jennifer adds authority, permissions, provenance, CAG relevance and receipts around the retrieval process. It does not redefine RAG.

## Authority tiers

Use this precedence **within each source's declared authority scope**:

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

A lower tier number does not make a source authoritative outside its scope.

## Persistence interpretation

```text
POSTGRESQL = authoritative relational / constitutional events and receipts
MONGODB    = mutable adaptive context and rebuildable world projection
SQLITE     = offline edge continuity, pending commands, local receipts, replay cache
```

Do not let MongoDB or SQLite silently overwrite a PostgreSQL-authoritative event. Do not let a remote source silently rewrite any governed authority record.

## Required inputs

- current CAG event or attention target;
- retrieval query;
- subject;
- target relational/context lane;
- permitted source tiers;
- explicit cross-lane authorization state;
- available retrieval adapters;
- authority scope for each source.

## Workflow

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

### 1. Classify knowledge requirement

Ask whether the current task needs retrieval. Do not retrieve merely because tools exist.

### 2. Determine authority tier

Identify which source families can legitimately answer the current claim.

### 3. Form retrieval query

Keep query terms centered on the active subject and CAG attention target.

### 4. Retrieve

Call only source adapters that are relevant and permitted.

### 5. Rank

Rank first by governed authority tier, then source-specific retrieval score. Preserve authority scope.

### 6. Deduplicate

Use checksum or normalized content fingerprints so repeated mirrors do not masquerade as independent evidence.

### 7. Check permissions

Private/intimate evidence must not cross into work/research/customer/public lanes without explicit authorization.

### 8. Attach provenance

Every admitted evidence item must carry:

- evidence ID;
- source ID;
- source URI or durable pointer when available;
- authority tier;
- authority scope;
- source lane;
- retrieval score;
- checksum when available;
- observed timestamp when available.

### 9. Produce EvidenceBundle

The bundle contains ranked evidence plus suppression/disposition reasons.

### 10. CAG relevance gate

Retrieved truth is still subject to current relevance:

```text
retrieved = true
source = valid
relevant_now = false
→ suppress from current generation frame
```

### 11. Generate

Generation may use admitted evidence and model reasoning. Model prior may help inference, but it must never be represented as retrieved evidence.

### 12. Validate grounding

Check whether claims requiring evidence are actually supported by the EvidenceBundle.

### 13. Receipt

Emit query, requested tiers, retrieved evidence IDs, suppressed IDs/reasons, grounding state and cross-lane authorization state.

## Offline reconciliation

When SQLite is the only available rail:

```text
retrieve / act offline
→ local SQLite receipt
→ reconnect
→ authority + idempotency validation
→ PostgreSQL admission or conflict receipt
→ MongoDB projection refresh
```

Never erase an offline conflict to create the appearance of clean synchronization.

## Required output

1. retrieval query plan;
2. evidence bundle;
3. suppressed evidence with reasons;
4. grounding result;
5. retrieval receipt;
6. any unresolved authority conflict.

## Final checks

- [ ] Retrieval was actually necessary.
- [ ] Source authority matches the claim scope.
- [ ] PostgreSQL / user-declared authority outranks adaptive or external sources where applicable.
- [ ] MongoDB remains adaptive context rather than silent authority.
- [ ] SQLite remains offline continuity rather than silent authority.
- [ ] Private context did not cross lanes without explicit authorization.
- [ ] Duplicates were not counted as independent evidence.
- [ ] Provenance is preserved.
- [ ] Model prior is not mislabeled as retrieved evidence.
- [ ] CAG removed evidence that is true but irrelevant now.
- [ ] A retrieval receipt can reconstruct what happened.
