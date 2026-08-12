---
name: project-jennifer
description: Govern Project Jennifer work through stateless-renter routing, CDP, CEEP, POC-vs-FOC, VOC registry parsing, runtime mutation gates, CCP, NCMP, CAG, governed RAG, RIVM, receipts, source authority and current repository evidence.
tags:
  - governance
  - agent-skills
  - conceptual-reasoning
  - memory
  - validation
  - multi-agent
  - typescript
allowed-tools:
  - read
  - write
  - exec
license: MIT
repository: https://github.com/RobynAwesome/Project-Jennifer
canonical-ecosystem-anchor: https://github.com/Kopano-Labs/Introduction-to-MCP
skill-index: skills.md
specialist-router: skills/project-jennifer/SKILL.md
---

# Project Jennifer

Project Jennifer is a governed intelligence runtime and portable agent-skill repository.

Use this root skill as the **public/repository entrypoint**. It intentionally gives external renters, Codex, Claude, Cursor, Gemini, Copilot and other compatible agents one stable place to discover the current Jennifer skill graph without loading the entire repository.

## Stateless-renter invariant

```text
I_AM_STATELESS_RENTER_NOT_LANDLORD
```

The human's current instruction governs task intent. `Kopano-Labs/Introduction-to-MCP` supplies ecosystem doctrine when relevant. The current Project Jennifer repository supplies implementation truth. Branch, PR, CI and runtime receipts govern proof claims.

## Load order

```text
current human instruction
→ SKILL.md
→ skills.md
→ skills/project-jennifer/SKILL.md
→ smallest relevant specialist SKILL.md
→ current implementation/source
→ source authority + privacy gates
→ execution
→ validation
→ receipt
```

Do not promote memory, semantic similarity, generated output, lore or a portable skill description into implementation truth.

## Core conceptual routing

```text
CDP
→ CEEP
→ POC-vs-FOC
→ CCP
→ canonical/evolution receipt
→ NCMP when genuine agent-originated novelty requires human recognition
```

- **CDP — Conceptual Divergence Protocol:** expand the possibility space. Portable/specification surface exists; a dedicated Jennifer CDP runtime module is not currently proven.
- **CEEP — Conceptual Evaluation Engine:** evaluate candidates and emit evaluation/evolution receipts.
- **POC-vs-FOC:** separate evidence-bearing proof from unsupported conceptual promotion.
- **VOC Registry Parser:** preserve the KPGS `POC` branch and emergent operational `FOC-G##` groups from `Kopano-Labs/Introduction-to-MCP` with provenance instead of flattening them into Jennifer semantic risk categories.
- **POC/FOC Runtime Gate:** require a consequential action to survive conceptual evaluation, operational FOC checks, evidence binding and Memory Receipt admission before state mutation.
- **CCP — Conceptual Convergence Protocol:** determine which pattern survives evidence and evaluation; current TypeScript implementation exists under `packages/conceptual/src/ccp/`.
- **NCMP — New Concept MMAO Protocol:** govern genuinely new agent-originated concepts; human recognition remains mandatory.

## Consequential runtime routing

Conceptual acceptance is not permission to mutate the game world.

```text
parsed VOCRegistry
→ POCFOCActionEvaluator
→ shared POCFOCActionEvaluation
→ POCFOCRuntimeGate
→ verified evidence
→ MemoryReceiptEngine
→ admitted ACCEPT: mutate once
→ HOLD / REJECT: preserve receipt, do not mutate
```

`Project Jennifer FOCType`, KPGS operational `FOC-G##`, and Memory Receipt admission are separate namespaces and must remain separately inspectable.

## Specialist skill index

Start at [`skills.md`](skills.md). Major portable routes include:

- [`skills/cdp-conceptual-divergence/SKILL.md`](skills/cdp-conceptual-divergence/SKILL.md)
- [`skills/ceep-conceptual-evaluation/SKILL.md`](skills/ceep-conceptual-evaluation/SKILL.md)
- [`skills/poc-foc-registry-parser/SKILL.md`](skills/poc-foc-registry-parser/SKILL.md)
- [`skills/poc-foc-evaluation/SKILL.md`](skills/poc-foc-evaluation/SKILL.md)
- [`skills/poc-foc-runtime-gate/SKILL.md`](skills/poc-foc-runtime-gate/SKILL.md)
- [`skills/ccp-conceptual-convergence/SKILL.md`](skills/ccp-conceptual-convergence/SKILL.md)
- [`skills/ncmp-concept-intake/SKILL.md`](skills/ncmp-concept-intake/SKILL.md)
- [`skills/cag-communication-attention/SKILL.md`](skills/cag-communication-attention/SKILL.md)
- [`skills/rag-governed-retrieval/SKILL.md`](skills/rag-governed-retrieval/SKILL.md)
- [`skills/jennifer-stateless-renter/SKILL.md`](skills/jennifer-stateless-renter/SKILL.md)
- [`skills/forge-rivm/SKILL.md`](skills/forge-rivm/SKILL.md)
- [`skills/authored-relational-attention/SKILL.md`](skills/authored-relational-attention/SKILL.md)

For the complete current registry and proof-state table, use [`skills.md`](skills.md).

## Proof-state law

Keep these independent:

```text
LORE / DESIGN
SPECIFIED
PORTABLE SKILL
CODED
TESTED
VALIDATED
RUNTIME-PROVEN
DEPLOYED
CANONICAL
```

```text
FOC = unsupported claim / appearance / intention / mock / speculative promotion
POC = project-appropriate evidence or consequence that can be inspected or receipted
```

Do not promote FOC to POC through repetition, confidence or memory.

## Source authority

A source can be semantically relevant and still be inadmissible. Preserve privacy, chronology, authority, provenance and canon state before retrieval or publication.

See:

- [`governance/source-authority-registry.json`](governance/source-authority-registry.json)
- [`docs/architecture/adr-0005-governed-source-authority-and-rivm.md`](docs/architecture/adr-0005-governed-source-authority-and-rivm.md)

## Execution output

For consequential work return:

```text
selected skill(s)
current source / implementation refs
observed proof state
work performed
validation result
receipt / PR / commit / runtime evidence
unproven remainder
```

## Success condition

This skill succeeds when a stateless renter can enter Project Jennifer from the repository root, discover the correct governed workflow, inspect current source, perform the requested task, validate it and leave receipts without fabricating continuity or authority.
