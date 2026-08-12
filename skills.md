# Project Jennifer — Awesome Skills Entry

**Repository:** `RobynAwesome/Project-Jennifer`  
**Role:** governed intelligence runtime + portable skills library  
**Canonical ecosystem anchor:** `Kopano-Labs/Introduction-to-MCP`  
**Repo skill root:** [`skills/project-jennifer/SKILL.md`](skills/project-jennifer/SKILL.md)

This is the **repo-level discovery surface for Project Jennifer skills**. A stateless renter, coding agent, research agent, or compatible skills host should start here instead of reverse-engineering the entire repository.

It is analogous to the way `Kopano-Labs/Introduction-to-MCP` acts as the ecosystem context root: use this file to discover Jennifer capabilities, then inspect the current source named by the selected skill.

> **Skill discovery is not authority promotion. Current repository evidence and receipts decide what is implemented, validated, canonical, private, or merely specified.**

---

## Stateless-renter law

```text
I_AM_STATELESS_RENTER_NOT_LANDLORD
```

```text
current human instruction
        ↓
skills.md / Project Jennifer umbrella skill
        ↓
source authority + privacy eligibility
        ↓
smallest relevant specialist skill
        ↓
current implementation/source
        ↓
validation + receipts
        ↓
governed memory / canon promotion
```

A renter may execute within granted authority. It may not convert remembered context, generated output, lore, a visual asset, or semantic similarity into implementation truth.

---

## Portable skill registry

| Skill | State | Use it when… | Primary truth source |
|---|---|---|---|
| [`project-jennifer`](skills/project-jennifer/SKILL.md) | **PORTABLE / ROUTER** | You need the complete Jennifer capability map or do not know which specialist applies. | `skills.md`, current repo state |
| [`cdp-conceptual-divergence`](skills/cdp-conceptual-divergence/SKILL.md) | **PORTABLE / SPECIFIED** | Deliberately expand the possibility space before convergence. | Convergence Law |
| [`ceep-conceptual-evaluation`](skills/ceep-conceptual-evaluation/SKILL.md) | **PORTABLE / CODED** | Evaluate a conceptual subject and emit evaluation/evolution receipts. | `packages/conceptual/src/ceep/` |
| [`poc-foc-evaluation`](skills/poc-foc-evaluation/SKILL.md) | **PORTABLE / CODED** | Separate evidence-bearing proof from FOC risk before promotion. | `packages/conceptual/src/pocvsfoc/` |
| [`ccp-conceptual-convergence`](skills/ccp-conceptual-convergence/SKILL.md) | **PORTABLE / CODED** | Decide which conceptual pattern survives evidence/evaluation. | `packages/conceptual/src/ccp/` |
| [`ncmp-concept-intake`](skills/ncmp-concept-intake/SKILL.md) | **PORTABLE / CODED** | Govern an agent-originated concept from candidate through human recognition, validation and registration. | `packages/shared/src/ncmp.ts` |
| [`cag-communication-attention`](skills/cag-communication-attention/SKILL.md) | **PORTABLE / CODED** | Decide what deserves attention now; gate irrelevant/privacy-invalid context. | skill + CAG implementation |
| [`rag-governed-retrieval`](skills/rag-governed-retrieval/SKILL.md) | **PORTABLE / CODED** | Retrieve evidence with authority, privacy, provenance and receipt boundaries. | skill + governed RAG implementation |
| [`jennifer-stateless-renter`](skills/jennifer-stateless-renter/SKILL.md) | **PORTABLE / CODED** | Let an external/local runtime enter without inheriting memory or authority. | renter contracts/router |
| [`forge-rivm`](skills/forge-rivm/SKILL.md) | **PORTABLE / PROTOCOL** | Govern consequential relationship-bearing inference. | RIVM skill/governance source |
| [`authored-relational-attention`](skills/authored-relational-attention/SKILL.md) | **PORTABLE / PATTERN** | Preserve locally authored attention without ownership/coercion/ontology inflation. | skill |

### Implemented capability surfaces not yet duplicated into standalone skills

| Capability | Current proof surface | Purpose |
|---|---|---|
| Framework Registry + evolution receipts | `packages/conceptual/src/registry/` + `receipts/` | Framework identity, evolution and canonical receipt structures. |
| Memory Receipt Engine | `packages/memory/src/memory-receipt-engine.ts` | Evidence-bearing memory state and receipt/risk handling. |
| GSMB / Digital Hippocampus | `packages/memory/src/gsmb.ts` | Governed context/memory continuity. |
| Governance Engine | `packages/governance/` | Policy and semantic governance before consequential execution. |
| Authority Runtime | `packages/authority/` | Roles, permissions, contracts and elevation boundaries. |
| Validation Engine | `packages/validation/` | Candidate state/action validation gates. |
| Telemetry | `packages/telemetry/` | Operational evidence/telemetry for consequence and evaluation. |
| HUE | `packages/hue/` | Human-understanding/emotional-context inference within governed boundaries. |
| Collective Ingress | `packages/collective-ingress/` | Governed collective/external signal intake. |
| Crisis Connect | `packages/crisis-connect/` | Crisis-event intake and bounded escalation. |
| Companion Runtime | `packages/runtime/src/companion-engine.ts` | Governed companion mechanisms and identity state. |
| Relationship Engine | `packages/runtime/src/relationship-engine.ts` | Relationship events, transitions, constraints and receipts. |
| NPC Runtime | `packages/npc/` | Bounded NPC behavior/world interaction. |
| Source Authority Registry | `governance/source-authority-registry.json` | Authority/privacy/canon/proof classification. |

**Not separately packaged** does not mean **not implemented**. **Packaged as a skill** does not mean **wired into every runtime**.

---

## The conceptual reasoning spine

```text
CURRENT / KNOWN STATE
        ↓
CDP — Conceptual Divergence Protocol
        ↓
multiple possibilities
        ↓
CEEP — Conceptual Evaluation Engine
        ↓
POC-vs-FOC — evidence / risk boundary
        ↓
CCP — Conceptual Convergence Protocol
        ↓
Accepted / Experimental / Refine / Rejected / Deprecated
        ↓
canonical / evolution receipt
        ↓
NCMP when a genuinely new agent-originated concept needs recognition + registration
```

### CDP

**Question:** *What could this become?*

CDP expands the possibility space. Current proof state:

```text
canonical semantics: YES
portable SKILL.md: YES
dedicated packages/conceptual/src/cdp engine: NOT CURRENTLY PROVEN
```

A renter may use the governed workflow but may not claim a dedicated Jennifer CDP runtime executed without a later repository receipt.

### CEEP

CEEP evaluates a subject with a `SubjectEvaluator` and emits both an `EvaluationReceipt` and a `FrameworkEvolutionReceipt`. Current code exists under `packages/conceptual/src/ceep/`.

### POC-vs-FOC

The current evaluator makes evidence strengths and FOC risks visible before conceptual promotion. It is a coded evaluator, not permission to call every non-zero score a proven production system.

### CCP

**Question:** *What consistently works / survives the evidence?*

The current TypeScript implementation consumes a `FrameworkEvolutionReceipt` and returns a `CanonicalReceipt`. Only `Accepted` is canonical in current code.

### NCMP

NCMP governs the rare case where a new concept originates inside MMAO. Agents may propose; **only the human architect may recognize the concept as NCMP**. Recognition still does not equal validation or registration.

---

## Recommended routing

```text
Explore possibilities
→ CDP
→ CEEP
→ POC-vs-FOC
→ CCP only when convergence is requested/earned

Converge / canonicalize
→ source authority
→ evidence / RAG if needed
→ CEEP + POC-vs-FOC
→ CCP
→ receipt

New agent-originated protocol/concept
→ CDP/CEEP as needed
→ NCMP candidate
→ human recognition
→ validation
→ registration OR rejection

Relationship-bearing inference
→ CAG
→ RAG only when evidence is required
→ candidate inference
→ RIVM
→ validation / receipt

External model/provider execution
→ jennifer-stateless-renter
→ capability manifest
→ exact specialist skill(s)
→ bounded execution
→ evidence + receipt
```

Not every request traverses every stage. **CAG applies to the skill graph too: use the minimum relevant governed path.**

---

## Proof-state vocabulary

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

Project Jennifer also preserves the POC/FOC distinction:

```text
FOC = claim, appearance, narrative, mock, intention, or unsupported conceptual promotion
POC = project-appropriate evidence/consequence that can be inspected or receipted
```

Do not promote FOC to POC through repetition, confidence, memory, or elegant wording.

---

## Source authority before skill execution

A relevant source can still be inadmissible. Current source classes include:

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

See [`governance/source-authority-registry.json`](governance/source-authority-registry.json) and [`ADR-0005`](docs/architecture/adr-0005-governed-source-authority-and-rivm.md).

---

## Portable distribution

```text
skills.md
→ project-jennifer umbrella skill
→ specialist SKILL.md
→ provider/renter adapter
→ exact runtime capability manifest
→ bounded execution
→ evidence + result + receipt
```

See [`skills/distribution/README.md`](skills/distribution/README.md) and [`skills/distribution/engines.yaml`](skills/distribution/engines.yaml).

A provider-specific adapter may change *how* a skill reaches a runtime. It must not silently change Jennifer's authority, privacy, validation, memory, proof-state, or receipt semantics.

---

## Minimum renter load packet

```text
1. skills.md
2. skills/project-jennifer/SKILL.md
3. selected specialist SKILL.md
4. current source/implementation named by that skill
5. relevant authority/privacy records
6. current tests/receipts when making proof claims
```

Do **not** dump the whole repository into context by default.

> **A Project Jennifer skill tells a renter how to perform a governed workflow. The repository tells the renter what actually exists. Receipts tell the renter what actually passed. The human decides the task.**
