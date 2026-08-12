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
| [`kpgs-runtime-pack`](skills/kpgs-runtime-pack/SKILL.md) | **PORTABLE / ROUTER** | You need KPGS authority, parser, model-routing, deployment or MAO/MMAO execution skills. | KPGS source + KMEC runtime |
| [`kpgs-authority`](skills/kpgs-authority/SKILL.md) | **PORTABLE / GOVERNANCE** | Establish KPGS renter posture, authority boundaries and receipt expectations. | `Kopano-Labs/Introduction-to-MCP` |
| [`kpgs-parser-protocol`](skills/kpgs-parser-protocol/SKILL.md) | **PORTABLE / CODED** | Parse heterogeneous provider docs, repo rules, skills, benchmarks and hardware evidence with provenance. | KMEC parser runtime |
| [`poc-foc-registry-parser`](skills/poc-foc-registry-parser/SKILL.md) | **PORTABLE / CODED** | Parse the authoritative VOC POC branch and emergent FOC-G## immune registry before operational groups influence Jennifer evaluation or governance. | `Kopano-Labs/Introduction-to-MCP/poc-vs-foc/` + `packages/conceptual/src/pocvsfoc/` |
| [`poc-foc-runtime-gate`](skills/poc-foc-runtime-gate/SKILL.md) | **PORTABLE / CODED** | Gate consequential runtime mutations through POC/FOC evaluation, evidence admission and Memory Receipts. | `packages/conceptual/src/pocvsfoc/POCFOCActionEvaluator.ts` + `packages/runtime/src/poc-foc-runtime-gate.ts` |
| [`kpgs-deployment-parser`](skills/kpgs-deployment-parser/SKILL.md) | **PORTABLE / CODED** | Normalize provider deployment truth into a KPGS `DeploymentRecipe`. | KMEC deployment parser contracts |
| [`kpgs-tool-script-runtime`](skills/kpgs-tool-script-runtime/SKILL.md) | **PORTABLE / CODED** | Require `SKILL.md → script → bounded tool plan → executor → receipt` instead of raw model tool calls. | KMEC `tool_scripts.py` |
| [`kpgs-apple-deployment-parser`](skills/kpgs-apple-deployment-parser/SKILL.md) | **PORTABLE / CODED** | Parse Xcode/Xcode Cloud/App Store Connect/TestFlight/build-upload/notarization workflows without flattening them into cloud-service deployment. | KMEC Apple parser + Apple first-party docs |
| [`kpgs-model-hardware-router`](skills/kpgs-model-hardware-router/SKILL.md) | **PORTABLE / CODED** | Route exact models/runtimes by hard hardware constraints, demanded skills and measured benchmarks. | KMEC model router |
| [`kpgs-mmao-mao-renter`](skills/kpgs-mmao-mao-renter/SKILL.md) | **PORTABLE / CODED** | Issue purpose-bound renter leases through non-linear MAO/MMAO workflows. | KMEC workflow graph + KPGS MMAO authority |
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

When a task depends on the KPGS immune-system registry itself, run `poc-foc-registry-parser` first so the source POC branch and `FOC-G##` groups remain provenance-bound and separate from Jennifer's semantic FOC risk categories.

### Runtime gate

When the action is consequential, conceptual evaluation is not enough. Route the decision through `poc-foc-runtime-gate`, bind it to verified evidence, issue a Memory Receipt and allow mutation only when the decision remains `ACCEPT` and the receipt is admitted.

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

Parse KPGS VOC / immune registry
→ source authority
→ poc-foc-registry-parser
→ VOCRegistry + VOCParseReceipt
→ poc-foc-evaluation only when conceptual scoring is needed
→ CEEP / CCP only when promotion or convergence is requested

Consequential runtime action
→ current VOCRegistry
→ POCFOCActionEvaluator
→ poc-foc-runtime-gate
→ verified evidence
→ Memory Receipt
→ ACCEPT: mutate once
→ HOLD/REJECT: do not mutate

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
→ kpgs-runtime-pack when KPGS workflow semantics are required
→ jennifer-stateless-renter
→ purpose-bound workflow node
→ exact specialist skill(s)
→ provider/source parser when required
→ model/hardware router
→ lease
→ SKILL.md
→ declared script entrypoint
→ bounded tool plan
→ authorized executor
→ consequence + receipt
→ validation
```

Not every request traverses every stage. **CAG applies to the skill graph too: use the minimum relevant governed path.**

---

## Tool execution membrane

For KPGS tool-bearing workflows, the portable law is:

```text
SKILL.md
→ SCRIPT
→ TOOL PLAN
→ EXECUTOR
→ RECEIPT
```

The model should not receive a raw list of high-impact tools and silently decide authority, workflow and parameters in one inference step.

A tool-bearing skill can declare:

```yaml
allowed-tools:
  - shell:xcodebuild
  - api:app-store-connect
script-entrypoints:
  - package.module:ScriptClass
```

The script is still not automatically trusted merely because discovery found it. Source authority, the active lease, executor permissions and receipts remain separate gates.

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
→ project-jennifer or kpgs-runtime-pack router
→ specialist SKILL.md
→ provider/source parser
→ provider/renter adapter
→ exact runtime capability manifest
→ skill-declared script where a tool is required
→ bounded execution
→ evidence + result + receipt
```

See [`skills/distribution/README.md`](skills/distribution/README.md), [`skills/distribution/engines.yaml`](skills/distribution/engines.yaml), and [`skills/distribution/awesome-skills-kpgs.yaml`](skills/distribution/awesome-skills-kpgs.yaml).

A provider-specific adapter may change *how* a skill reaches a runtime. It must not silently change Jennifer's authority, privacy, validation, memory, proof-state, or receipt semantics.

---

## Minimum renter load packet

```text
1. skills.md
2. skills/project-jennifer/SKILL.md OR skills/kpgs-runtime-pack/SKILL.md
3. selected specialist SKILL.md
4. current source/implementation named by that skill
5. relevant authority/privacy records
6. current tests/receipts when making proof claims
7. declared script only when the workflow requires a tool
```

Do **not** dump the whole repository into context by default.

> **A Project Jennifer skill tells a renter how to perform a governed workflow. The repository tells the renter what actually exists. Scripts compile tool actions. Executors perform side effects. Receipts tell the renter what actually passed. The human decides the task.**
