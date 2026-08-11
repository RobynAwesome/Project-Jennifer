# ADR-0005 — Governed Source Authority + RIVM Boundary

**Status:** Proposed  
**Date:** 2026-08-11

## Context

Project Jennifer now combines:

- user-controlled private source material;
- public-derivative frameworks;
- executable governance skills;
- historical design documents;
- generated visual assets;
- adaptive GSMB / Mongo context;
- authoritative receipts and relational state;
- stateless external/local renters.

Persistency, consistency and context are not sufficient when the wrong root is selected. Retrieval must preserve authority, privacy, chronology and validation state.

## Decision

Project Jennifer will classify durable source artifacts with an explicit authority lane before they are eligible for retrieval, publication or canon promotion.

### Source classes

```text
PRIVATE_SOVEREIGN
PUBLIC_DERIVATIVE
EXECUTABLE_PROTOCOL
PROJECT_CANON
HISTORICAL_REFERENCE
RESEARCH_REFERENCE
VISUAL_SOURCE
VISUAL_DERIVATIVE
```

### Admission states

```text
SOURCE
CANON_CANDIDATE
CANON
SUPERSEDED
REJECTED
```

### Required source fields

Every governed source record must support:

```text
id
class
path_or_external_ref
title
source_owner
privacy_lane
status
canonical_for
supersedes
contradicts
source_lineage
public_transform_allowed
human_validated
sha256
notes
```

A missing value must remain missing / unknown; the renter may not infer authority from filename, emotional importance or repetition.

## Private/public law

Private sovereign source material remains outside the public repository by default.

A public artifact may be derived from private source only through an explicit transformation boundary:

```text
PRIVATE SOVEREIGN SOURCE
        ↓ consent + purpose
MINIMIZED DERIVATIVE
        ↓ anonymize / classify / validate
PUBLIC TRANSFORMATION BLUEPRINT
        ↓
PUBLIC ARTIFACT + TRANSFORMATION RECEIPT
```

The public derivative never silently becomes the private source of truth.

## RIVM position

RIVM is an inference-validation membrane for consequential relationship-bearing interactions.

```text
Human Context Authority
        ↓
Governance Intimacy / relationship contract
        ↓
RIVM
   ↙          ↘
private lane   public derivative lane
   ↘          ↙
  validation / receipt ledger
```

RIVM is not the sovereign source. It evaluates whether relational inference preserves truth, warmth, agency, ontology, privacy, execution and historical continuity.

## Retrieval consequence

Governed RAG must not treat all matching sources as equally admissible.

A source can be semantically relevant and still be rejected because it is:

- private in the current lane;
- superseded;
- historical rather than current canon;
- a visual source with no canonical semantic authority;
- a public derivative that cannot overwrite private source;
- unsupported FOC presented as POC.

## Companion lineage consequence

The uploaded In-Depth Companion Matrix is admitted as `HISTORICAL_REFERENCE`, not current executable canon. Its `Eira` naming is preserved as historical lineage. Current runtime `Fira` remains current canon unless a governed identity receipt explicitly changes that state.

## Visual asset consequence

Valid binaries are admitted through a manifest containing dimensions and SHA-256. A generated image can become source or canon-candidate but cannot define runtime powers, relationships or economic promises by appearance alone.

## Consequences

### Positive

- reduces root-node collapse;
- prevents private/public leakage;
- lets renters rehydrate bounded context safely;
- preserves contradictions and supersession;
- makes asset/source admission auditable;
- gives RIVM a portable public implementation without publishing private source.

### Cost

- more manifests and receipts;
- source intake requires classification before convenience;
- some useful private material remains unavailable to public renters by design.

## Validation boundary

This ADR defines the target architecture. It is not implementation proof until code/manifests/tests and CI receipts exist on a branch or merged commit.
