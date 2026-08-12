---
name: poc-foc-registry-parser
description: Parse the KPGS VOC Proof-of-Concept branch and emergent FOC-G## failure groups from authoritative Introduction-to-MCP sources into a provenance-preserving Project Jennifer registry and parser receipt. Use before FOC groups influence evaluation, convergence, governance, or automated defensive recommendations.
license: MIT
compatibility: Portable Agent Skills SKILL.md package; AwesomeSkills-ready; TypeScript implementation in @jennifer/conceptual.
metadata:
  author: Kholofelo Robyn Rababalela / Kopano Labs
  version: "1.0.0"
  capability: voc-poc-foc-registry-parser
  portable: true
  tags: poc, foc, voc, parser, kpgs, governance, agent-skills
---

# POC / FOC Registry Parser

## Purpose

This skill converts the authoritative **VOC — Validation of Concept** registry in `Kopano-Labs/Introduction-to-MCP` into a bounded Project Jennifer data structure without flattening or renaming the source semantics.

Authoritative source paths:

```text
Kopano-Labs/Introduction-to-MCP
├── poc-vs-foc/INDEX.md
├── poc-vs-foc/VOC_MANIFEST.md
└── poc-vs-foc/FOC_CLASSIFICATION_INDEX.md
```

Current coded implementation:

```text
packages/conceptual/src/pocvsfoc/VOCRegistry.ts
packages/conceptual/src/pocvsfoc/VOCRegistryParser.ts
```

## Source authority law

```text
Introduction-to-MCP = authority origin for KPGS VOC semantics
Project Jennifer      = current implementation authority for this parser
AwesomeSkills          = discovery/distribution surface, not constitutional authority
```

Do not treat an AwesomeSkills listing, copied SKILL.md, generated summary, or model memory as stronger than the current source repository.

## Canonical source structure parsed

```text
VOC — Validation of Concept
        │
        ├── POC — Proof of Concept
        │       └── one parent POC branch in the current VOC manifest
        │
        └── FOC — Failure of Concept / Freedom of Concept
                └── emergent FOC-G## groups that grow as new failure patterns are recognized
```

Current source-defined FOC groups:

```text
FOC-G01  NeuralFailureFirewall
FOC-G02  ContextBleedAnomaly
FOC-G03  SemanticDriftLeak
FOC-G04  GhostExecutionLoop
FOC-G05  ContextCorruptionBreach
```

These names come from the current Introduction-to-MCP registry. The parser must preserve source IDs, designations, detection mechanisms, and defensive loops exactly as observed.

## Important distinction

Project Jennifer already has evaluator risk categories such as:

```text
FakeOfConcept
FreedomOfConcept
FabricationOfConcept
FailureOfConcept
...
```

Those are **evaluation risk categories**.

`FOC-G01` through `FOC-G05` are **operational immune-system groups** from Introduction-to-MCP.

```text
FOCType risk category ≠ FOC-G## operational group
```

Do not collapse the two namespaces.

## Execution path

```text
ACQUIRE CURRENT SOURCE
→ CLASSIFY SOURCE AUTHORITY
→ PARSE POC BRANCH
→ PARSE FOC-G## TABLE
→ PRESERVE SOURCE REF
→ HASH INPUT SURFACES
→ EMIT VOCRegistry
→ EMIT VOCParseReceipt
→ POC-vs-FOC evaluator when conceptual scoring is needed
→ CEEP / CCP only when promotion or convergence is requested
```

## TypeScript usage

```ts
import { VOCRegistryParser } from "@jennifer/conceptual";

const parser = new VOCRegistryParser();

const result = parser.parse({
  indexMarkdown,
  manifestMarkdown,
  classificationMarkdown,
  sourceRef: "<Introduction-to-MCP commit SHA>",
});

console.log(result.registry.poc);
console.log(result.registry.foc.groups);
console.log(result.receipt);
```

## Parser receipt

Each parse emits evidence containing:

```yaml
parser: VOCRegistryParser
sourceAuthority: Kopano-Labs/Introduction-to-MCP
sourceRef: exact commit/ref supplied by caller
sourceHashes:
  indexSha256: ...
  classificationSha256: ...
  manifestSha256: ...
pocParsed: true
focGroupsParsed: integer
promotionStatus: evidence-only
```

`evidence-only` is deliberate. Parsing proves what the source says; it does not prove that a Project Jennifer runtime has executed every defensive loop.

## Matching law

`matchFOCGroups()` is deterministic and conservative. It matches observed text against the exact group ID, designation, or detection mechanism already present in the parsed registry.

It does **not** semantically invent a new FOC group.

New group emergence remains governed by the Introduction-to-MCP growth protocol and human/KPGS authority.

## Success condition

The skill succeeds when:

1. POC is parsed as the Proof of Concept branch;
2. FOC retains Failure/Freedom semantics from source;
3. every observed `FOC-G##` row is preserved with detection and defense fields;
4. source ref and content hashes survive the parse;
5. downstream Project Jennifer evaluators can consume the registry without pretending discovery equals proof.

## Hard failures

Do not:

- rename FOC groups for aesthetic consistency;
- replace the source group table with Project Jennifer's semantic FOC risk categories;
- invent `FOC-G06+` because a model sees a similar failure;
- execute destructive defensive actions merely because a group matched;
- strip commit/ref provenance;
- claim runtime proof from a parser receipt;
- allow an AwesomeSkills registry entry to outrank KPGS source authority.

> **Parse what exists. Preserve what it means. Let receipts decide what passed.**
