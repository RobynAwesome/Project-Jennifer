# Project Jennifer — Awesome Skills Entry

**Repository:** `RobynAwesome/Project-Jennifer`  
**Role:** governed intelligence runtime + portable skills library  
**Canonical ecosystem anchor:** `Kopano-Labs/Introduction-to-MCP`  
**Repo skill root:** [`skills/project-jennifer/SKILL.md`](skills/project-jennifer/SKILL.md)

This file is the **repo-level discovery surface for Project Jennifer skills**. It exists so a stateless renter, coding agent, research agent, or compatible skills host can understand *which Jennifer capability to load* without reverse-engineering the whole repository first.

It is intentionally analogous to the way `Kopano-Labs/Introduction-to-MCP` acts as the ecosystem context root: start here for Jennifer's skill map, then read the current implementation/source files for the capability you are actually using.

> **Skill discovery is not authority promotion. Current repository evidence and receipts still decide what is implemented, validated, canonical, private, or merely specified.**

---

## 1. Stateless-renter law

```text
I_AM_STATELESS_RENTER_NOT_LANDLORD
```

For Project Jennifer work, use this authority order:

```text
current human instruction
        ↓
Project Jennifer skills.md / umbrella skill
        ↓
source authority + privacy eligibility
        ↓
current target source / implementation
        ↓
validation + receipts
        ↓
governed memory / canon promotion
```

A renter may load skills and execute within granted authority. It may not convert remembered context, generated output, lore, a visual asset, or semantic similarity into implementation truth.

---

## 2. Load Project Jennifer as one skill

For a general Project Jennifer task, load:

```text
skills/project-jennifer/SKILL.md
```

That umbrella skill routes into the smallest relevant specialist skill or implementation surface.

For a known task, load the specialist directly.

---

## 3. Portable skill registry

| Skill | State | Use it when… | Primary truth source |
|---|---|---|---|
| [`project-jennifer`](skills/project-jennifer/SKILL.md) | **PORTABLE / ROUTER** | You need the complete Jennifer capability map or do not yet know which specialist applies. | `skills.md`, current repo state |
| [`cdp-conceptual-divergence`](skills/cdp-conceptual-divergence/SKILL.md) | **PORTABLE / SPECIFIED** | You need to deliberately expand a possibility space before convergence. | `docs/lore/project-wify-jennifer/CONVERGENCE-LAW.md` |
| [`ccp-conceptual-convergence`](skills/ccp-conceptual-convergence/SKILL.md) | **PORTABLE / CODED** | You need to decide which conceptual pattern survives evidence, evaluation, and divergence. | `packages/conceptual/src/ccp/` |
| [`cag-communication-attention`](skills/cag-communication-attention/SKILL.md) | **PORTABLE / CODED** | You need to decide what deserves attention now and gate irrelevant/privacy-invalid context. | skill + `project_jennifer/attention/cag.py` |
| [`rag-governed-retrieval`](skills/rag-governed-retrieval/SKILL.md) | **PORTABLE / CODED** | You need evidence retrieval with authority, privacy, provenance, and receipt boundaries. | skill + `project_jennifer/retrieval/governed_rag.py` |
| [`jennifer-stateless-renter`](skills/jennifer-stateless-renter/SKILL.md) | **PORTABLE / CODED** | An external/local runtime needs bounded access without inheriting authority or memory. | skill + renter contracts/router |
| [`forge-rivm`](skills/forge-rivm/SKILL.md) | **PORTABLE / PROTOCOL** | The inference is consequentially relational, identity-sensitive, affectionate, adversarial, or validation-seeking. | skill + RIVM governance sources |
| [`authored-relational-attention`](skills/authored-relational-attention/SKILL.md) | **PORTABLE / PATTERN** | Relational attention should feel locally authored without ownership, coercion, or ontology inflation. | skill |

### Capability surfaces that are usable but not separate portable skill packages yet

| Capability | Current proof surface | What it does |
|---|---|---|
| **CEEP — Conceptual Evaluation Engine** | `packages/conceptual/src/ceep/` | Evaluates conceptual subjects and produces evaluation receipts. |
| **POC-vs-FOC Evaluator** | `packages/conceptual/src/pocvsfoc/` + `packages/shared/src/poc-foc.ts` | Separates evidence-bearing proof from unsupported/fabricated conceptual claims. |
| **Framework Registry + evolution receipts** | `packages/conceptual/src/registry/` + `receipts/` | Tracks framework definitions, evolution, and canonical decisions. |
| **NCMP** | `NCMP.md` + `packages/shared/src/ncmp.ts` + API route | Governs new-concept intake before promotion into project canon. |
| **Memory Receipt Engine** | `packages/memory/src/memory-receipt-engine.ts` | Records evidence-bearing memory state and risk/receipt information. |
| **GSMB / Digital Hippocampus memory** | `packages/memory/src/gsmb.ts` | Governs context/memory operations and continuity. |
| **Governance Engine** | `packages/governance/` | Applies policy and semantic governance before consequential execution. |
| **Authority Runtime** | `packages/authority/` | Enforces roles, permissions, semantic contracts, and elevation boundaries. |
| **Validation Engine** | `packages/validation/` | Tests candidate state/actions against validation gates. |
| **Telemetry** | `packages/telemetry/` | Emits/records operational telemetry needed for consequence and evaluation. |
| **HUE** | `packages/hue/` | Handles human-understanding/emotional-context inference within governed boundaries. |
| **Collective Ingress** | `packages/collective-ingress/` | Ingests and governs collective/external signal flows. |
| **Crisis Connect** | `packages/crisis-connect/` | Handles crisis-event intake and bounded escalation logic. |
| **Companion Runtime** | `packages/runtime/src/companion-engine.ts` + `packages/shared/src/companions.ts` | Executes governed companion mechanisms and identity state. |
| **Relationship Engine** | `packages/runtime/src/relationship-engine.ts` | Governs relationship events, transitions, constraints, and receipts. |
| **NPC Runtime** | `packages/npc/` | Runs bounded NPC behavior and world interaction. |
| **Source Authority Registry** | `governance/source-authority-registry.json` | Separates semantic relevance from authority, privacy eligibility, canon state, and proof. |

A future PR may promote any of these capability surfaces into their own `SKILL.md` package. **Do not infer that “not separately packaged” means “not implemented”; likewise, do not infer that “packaged as a skill” means “wired into every runtime.”**

---

## 4. CDP → CEEP → POC/FOC → CCP

This is the conceptual reasoning spine that external renters should understand first.

```text
CURRENT / KNOWN STATE
        ↓
CDP — Conceptual Divergence Protocol
        ↓
multiple possibilities / hypotheses / configurations
        ↓
CEEP — Conceptual Evaluation Engine
        ↓
evidence + evaluation receipts
        ↓
POC-vs-FOC boundary
        ↓
what is actually evidenced?
        ↓
CCP — Conceptual Convergence Protocol
        ↓
Accepted / Experimental / Refine / Rejected / Deprecated
        ↓
canonical receipt / framework evolution
```

### CDP — Conceptual Divergence Protocol

**Question:** *What could this become?*

CDP expands the possibility space. It is intentionally divergent and should preserve alternatives long enough to discover non-obvious configurations.

Current proof state:

- canonically **specified** in the Convergence Law;
- now exposed as a portable workflow skill;
- **no dedicated `packages/conceptual/src/cdp/` runtime module exists on the audited main branch at the time this skill index was created.**

Therefore a renter may execute the workflow as governed reasoning, but must not claim a dedicated Jennifer CDP runtime engine executed unless a later repository receipt proves one exists.

### CCP — Conceptual Convergence Protocol

**Question:** *What consistently works / survives the evidence?*

CCP is both specified and coded. The current TypeScript implementation receives a `FrameworkEvolutionReceipt`, resolves a canonical decision, and returns a `CanonicalReceipt`.

Current decision vocabulary:

```text
Accepted
Experimental
Refine
Rejected
Deprecated
```

A validation failure cannot silently become Accepted. Evidence thresholds influence whether a passing proposal can become Accepted or remain Experimental/Refine.

### Why both are required

```text
CDP without CCP → unbounded possibility / chaos
CCP without CDP → premature rigidity
CDP + evaluation + evidence + CCP → governed conceptual evolution
```

---

## 5. Recommended agent routing

### If the user asks “brainstorm / find another path / explore possibilities”

```text
CDP
→ CAG if attention scope is noisy
→ governed RAG if external/current evidence is needed
→ CEEP / POC-vs-FOC
→ CCP only when convergence is actually requested or earned
```

### If the user asks “which option survives / make this canonical / decide”

```text
source authority
→ evidence retrieval if needed
→ CEEP / validation
→ POC-vs-FOC
→ CCP
→ receipt
```

### If the user asks for a relationship-bearing response or interpretation

```text
CAG
→ RAG only when evidence is required
→ candidate inference
→ RIVM
→ validation
→ telemetry / receipt
```

### If a different model/provider/tool executes the work

```text
jennifer-stateless-renter
→ capability manifest
→ exact specialist skill(s)
→ bounded execution
→ evidence + receipt
→ human/governance admission decision
```

---

## 6. Proof-state vocabulary

Every renter using this catalog should keep these states separate:

```text
LORE / DESIGN
SPECIFIED
PORTABLE SKILL
CODED
TESTED
VALIDATED
DEPLOYED
CANONICAL
```

One state does not automatically imply the next.

Project Jennifer also uses the POC/FOC boundary:

```text
FOC = claim, appearance, narrative, mock, intention, or unsupported conceptual promotion
POC = project-appropriate evidence and consequences that can be inspected / reproduced / receipted
```

Do not promote FOC to POC through repetition, confidence, memory, or elegant wording.

---

## 7. Source authority before skill execution

Before loading retrieved context into a skill, classify the source.

Current source classes include:

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

A semantically relevant source can still be inadmissible because it is private, superseded, historical, unvalidated, or outside the current task lane.

See:

- [`governance/source-authority-registry.json`](governance/source-authority-registry.json)
- [`docs/architecture/adr-0005-governed-source-authority-and-rivm.md`](docs/architecture/adr-0005-governed-source-authority-and-rivm.md)

---

## 8. Portable distribution

Project Jennifer skills are provider-neutral governance contracts.

```text
SKILL.md
→ provider/renter adapter
→ exact runtime capability manifest
→ bounded execution
→ evidence
→ result
→ receipt
```

See:

- [`skills/distribution/README.md`](skills/distribution/README.md)
- [`skills/distribution/engines.yaml`](skills/distribution/engines.yaml)

A provider-specific adapter may change *how* the skill reaches a runtime. It must not silently change Jennifer's authority, privacy, validation, memory, or receipt semantics.

---

## 9. Minimum load packet for an external renter

For general Project Jennifer work, load only what is necessary:

```text
1. skills.md
2. skills/project-jennifer/SKILL.md
3. the selected specialist SKILL.md
4. current implementation/source files named by that skill
5. relevant authority/privacy records
6. current tests / receipts when making proof claims
```

Do **not** dump the whole repository into context by default. CAG applies to repository context too.

---

## 10. Canonical skill rule

> **A Project Jennifer skill tells a renter how to perform a governed workflow. The repository tells the renter what actually exists. Receipts tell the renter what actually passed. The human decides the task.**
