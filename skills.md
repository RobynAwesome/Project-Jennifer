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
| [`cdp-conceptual-divergence`](skills/cdp-conceptual-divergence/SKILL.md) | **PORTABLE / CODED** | Parse governed context and deliberately expand or reopen the possibility space when divergence is the admitted transition. | `packages/conceptual/src/cdp/` + Convergence Law |
| [`ceep-conceptual-evaluation`](skills/ceep-conceptual-evaluation/SKILL.md) | **PORTABLE / CODED** | Evaluate a conceptual subject and emit evaluation/evolution receipts. | `packages/conceptual/src/ceep/` |
| [`poc-foc-evaluation`](skills/poc-foc-evaluation/SKILL.md) | **PORTABLE / CODED** | Separate evidence-bearing proof from FOC risk before promotion. | `packages/conceptual/src/pocvsfoc/` |
| [`ccp-conceptual-convergence`](skills/ccp-conceptual-convergence/SKILL.md) | **PORTABLE / CODED** | Decide which conceptual pattern currently survives evidence/evaluation. | `packages/conceptual/src/ccp/` |
| [`ncmp-concept-intake`](skills/ncmp-concept-intake/SKILL.md) | **PORTABLE / CODED** | Govern an agent-originated concept from candidate through human recognition, validation and registration. | `packages/shared/src/ncmp.ts` |
| [`cag-communication-attention`](skills/cag-communication-attention/SKILL.md) | **PORTABLE / CODED** | Decide what deserves attention now; gate irrelevant/privacy-invalid context. | skill + CAG implementation |
| [`rag-governed-retrieval`](skills/rag-governed-retrieval/SKILL.md) | **PORTABLE / CODED** | Retrieve evidence with authority, privacy, provenance and receipt boundaries. | skill + governed RAG implementation |
| [`jennifer-stateless-renter`](skills/jennifer-stateless-renter/SKILL.md) | **PORTABLE / CODED** | Let an external/local runtime enter without inheriting memory or authority. | renter contracts/router |
| [`forge-rivm`](skills/forge-rivm/SKILL.md) | **PORTABLE / PROTOCOL** | Govern consequential relationship-bearing inference. | RIVM skill/governance source |
| [`authored-relational-attention`](skills/authored-relational-attention/SKILL.md) | **PORTABLE / PATTERN** | Preserve locally authored attention without ownership/coercion/ontology inflation. | skill |
| [`jennifer-authority-governance`](skills/jennifer-authority-governance/SKILL.md) | **PORTABLE / ROUTER** | Work on authority, governance, source classes, permissions, privacy or canon admission. | `packages/authority/`, `packages/governance/`, source registry |
| [`jennifer-runtime-memory`](skills/jennifer-runtime-memory/SKILL.md) | **PORTABLE / ROUTER** | Work on runtime continuity, relationships, GSMB, memory receipts or persistent consequence. | `packages/runtime/`, `packages/memory/` |
| [`jennifer-validation-poc-foc`](skills/jennifer-validation-poc-foc/SKILL.md) | **PORTABLE / GOVERNANCE** | Validate architecture/runtime claims and preserve POC/FOC evidence boundaries. | `VALIDATION_POLICY.md`, validation code/tests |
| [`jennifer-conceptual-convergence`](skills/jennifer-conceptual-convergence/SKILL.md) | **PORTABLE / ROUTER** | Apply CCP, CEEP, framework evolution or conceptual receipts. | `packages/conceptual/`, conceptual docs |
| [`jennifer-companions-npcs`](skills/jennifer-companions-npcs/SKILL.md) | **PORTABLE / ROUTER** | Work on companion identity, progression, NPC behavior, actor-relative divergence or character-state governance. | runtime/NPC packages, companion manifests |
| [`jennifer-telemetry-storage`](skills/jennifer-telemetry-storage/SKILL.md) | **PORTABLE / ROUTER** | Work on telemetry, receipts, persistence, replay or reconciliation. | telemetry/memory/storage code and infra |
| [`jennifer-ncmp-mmao`](skills/jennifer-ncmp-mmao/SKILL.md) | **PORTABLE / GOVERNANCE** | Govern NCMP, MMAO or multi-renter sessions and orchestration. | `NCMP.md`, `docs/mmao/`, NCMP contracts |
| [`jennifer-game-web-api`](skills/jennifer-game-web-api/SKILL.md) | **PORTABLE / ROUTER** | Build or debug the Next.js/Phaser web game, API or browser/runtime bridges. | `apps/web/`, `apps/api/`, shared/runtime contracts |
| [`jennifer-assets-lore`](skills/jennifer-assets-lore/SKILL.md) | **PORTABLE / GOVERNANCE** | Admit, audit or use assets, manifests, lore or canon sources. | `assets/`, lore docs, source registry |
| [`jennifer-ci-benchmarks`](skills/jennifer-ci-benchmarks/SKILL.md) | **PORTABLE / ROUTER** | Work on CI, tests, evals, benchmarks or validation receipts. | workflows, tests and benchmarks |
| [`jennifer-adoption-provider-onboarding`](skills/jennifer-adoption-provider-onboarding/SKILL.md) | **PORTABLE / ROUTER** | Qualify a provider or partner through manifests, adapters and measurable evidence. | distribution metadata, renter configs, benchmarks |
| [`jennifer-human-crisis-ingress`](skills/jennifer-human-crisis-ingress/SKILL.md) | **PORTABLE / GOVERNANCE** | Apply HUE, Collective Ingress or Crisis Connect to human/collective signals. | HUE, collective-ingress and crisis-connect packages |

### Current implementation proof surfaces behind repository-native skills

| Capability | Current proof surface | Purpose |
|---|---|---|
| Framework Registry + evolution receipts | `packages/conceptual/src/registry/` + `receipts/` | Framework identity, evolution and canonical receipt structures. |
| CDP context parser + divergence runtime | `packages/conceptual/src/cdp/CDPContextParser.ts` + `packages/conceptual/src/cdp/ConceptualDivergenceRuntime.ts` | Provenance-bound context parsing, historical evidence separation and non-canonical possibility generation. |
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
| NPC Epistemic Divergence | `packages/npc/src/epistemic-divergence.ts` | Deterministic actor-relative observation/interpretation and policy-backed consequence-intent receipts. |
| Source Authority Registry | `governance/source-authority-registry.json` | Authority/privacy/canon/proof classification. |

The repository-native skills route work to these surfaces. **Packaged as a skill** does not mean the capability is wired into every runtime, validated, deployed or canonical; inspect the current code and receipts.

---

## Situational conceptual routing

Project Jennifer does not impose one global sequence on every conceptual state.

```text
CURRENT / KNOWN STATE
        │
        ├─ alternatives must open/reopen ─────────────► CDP / DIVERGE
        ├─ evidence must be evaluated ────────────────► CEEP + POC-vs-FOC
        ├─ stable evidence should compress ───────────► CCP / CONVERGE
        └─ evidence / authority is insufficient ──────► HOLD
```

A common exploration path is still:

```text
CDP
→ multiple possibilities
→ CEEP
→ POC-vs-FOC
→ CCP when convergence is requested/earned
→ Accepted / Experimental / Refine / Rejected / Deprecated
→ canonical / evolution receipt
→ NCMP when a genuinely new agent-originated concept needs recognition + registration
```

But valid transitions also include:

```text
CCP → contradictory evidence → CDP
CDP → HOLD
CCP → HOLD
```

Canonical boundary:

```text
DIVERGENCE != FOC
CONVERGENCE != POC
```

Either route may later validate or fail through consequence and evidence.

### CDP

**Question:** *What could this become, or which alternatives must remain open?*

CDP expands or reopens the possibility space. Current proof state:

```text
canonical semantics: YES
portable SKILL.md: YES
dedicated packages/conceptual/src/cdp parser/runtime: CODED + TESTED
runtime receipt dedicatedCdpEngineExecuted: true
```

The dedicated parser/runtime consumes only supplied or authorized context, preserves source provenance, and emits hypotheses without self-canonicalizing. Prior context-window personality or preference signals remain **historical evidence only** until current-human authority confirms them; a current human instruction outranks conflicting older preferences.

A renter may claim dedicated Jennifer CDP runtime execution only when the returned CDP runtime receipt records `dedicatedCdpEngineExecuted: true`. That receipt still does not promote any hypothesis to canon.

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

A prior CCP result may become input to later CDP when contradiction, novelty or changed context reopens the possibility field.

### NPC epistemic divergence

The NPC engine is deliberately separate from the conceptual CDP/CCP runtimes:

```text
objective event facts
→ actor-local observations
→ partial-known state
→ actor interpretation
→ CONVERGE | DIVERGE | HOLD
→ optional policy-backed consequence intent
```

These receipts remain `proofState: actor-model`, `validationState: UNVALIDATED`, and `canonical: false`. Local `DIVERGE` or `CONVERGE` never proves the conceptual CDP/CCP runtime executed.

### NCMP

NCMP governs the rare case where a new concept originates inside MMAO. Agents may propose; **only the human architect may recognize the concept as NCMP**. Recognition still does not equal validation or registration.

---

## Recommended routing

```text
Explore / reopen possibilities
→ CDP
→ CEEP
→ POC-vs-FOC
→ CCP only when convergence is requested/earned

Reopen a previously converged model
→ existing CCP/canonical receipt + new contradictory evidence
→ source authority
→ CDP
→ CEEP / POC-vs-FOC as needed
→ CCP again only if earned

Insufficient evidence / authority
→ HOLD
→ preserve uncertainty + receipt

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

NPC actor-relative consequence
→ authoritative event facts + evidence
→ jennifer-companions-npcs
→ EpistemicDivergenceEngine
→ actor-model receipt
→ policy-backed consequence intent only when evidence exists
→ persistent mutation only through runtime/memory + POC/FOC gates

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