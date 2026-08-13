# Project Jennifer Skill Distribution

This directory defines how Project Jennifer's portable `SKILL.md` workflows are handed to stateless renters without changing the underlying governance contract.

## Discovery path

External agents no longer need to reverse-engineer the repository before selecting a skill.

```text
skills.md
→ skills/project-jennifer/SKILL.md
→ skills/SKILL.md when repository implementation routing is required
→ smallest relevant specialist skill(s)
→ current implementation/source
→ bounded execution
→ evidence + receipt
```

The root [`../../skills.md`](../../skills.md) is the repo-level **Awesome Skills entry**. The umbrella [`../project-jennifer/SKILL.md`](../project-jennifer/SKILL.md) handles capability routing.

## Distribution law

```text
SKILL.md source of truth
→ renter/provider adapter
→ exact runtime capability manifest
→ bounded execution
→ evidence + result + receipt
```

Provider-specific delivery mechanisms may change. Jennifer's CAG, RAG, conceptual-suite proof boundaries, privacy, authority and memory semantics do not silently change with them.

## Core portable catalog

```text
project-jennifer
cdp-conceptual-divergence
ceep-conceptual-evaluation
poc-foc-evaluation
ccp-conceptual-convergence
ncmp-concept-intake
cag-communication-attention
rag-governed-retrieval
jennifer-stateless-renter
forge-rivm
authored-relational-attention
project-jennifer-skill-router
jennifer-authority-governance
jennifer-runtime-memory
jennifer-validation-poc-foc
jennifer-conceptual-convergence
jennifer-companions-npcs
jennifer-telemetry-storage
jennifer-ncmp-mmao
jennifer-game-web-api
jennifer-assets-lore
jennifer-ci-benchmarks
jennifer-adoption-provider-onboarding
jennifer-human-crisis-ingress
```

A runtime may expose the catalog without invoking every skill on every request. CAG and task intent determine the smallest relevant path.

## Conceptual suite

```text
CDP
→ CEEP
→ POC-vs-FOC
→ CCP
→ canonical/evolution receipt
→ NCMP when a new agent-originated concept needs human recognition + governed registration
```

Important proof boundaries:

- **CDP** is canonically specified and packaged as a portable workflow; no dedicated `packages/conceptual/src/cdp/` runtime module is currently proven.
- **CEEP** has a current TypeScript implementation under `packages/conceptual/src/ceep/`.
- **POC-vs-FOC** has a current TypeScript evaluator under `packages/conceptual/src/pocvsfoc/`.
- **CCP** has a current TypeScript implementation under `packages/conceptual/src/ccp/`.
- **NCMP** has a coded storage-agnostic/in-memory registry; agents may propose but human recognition is mandatory before its recognition transition.

Adapters must preserve those distinctions.

## Why this matters for collaboration

A provider or partner should not need to reverse-engineer Project Jennifer before contributing. The minimum integration packet is:

1. `skills.md` or the umbrella `project-jennifer` skill;
2. the relevant specialist `SKILL.md` files;
3. JSON schemas for receipts/evidence/capability manifests where applicable;
4. the exact runtime capability manifest;
5. benchmark results for the requested task lanes;
6. the adapter that supplies the skill/context to the runtime;
7. evidence and receipts returned after execution.

This creates a clean B2B evaluation surface:

```text
provider capability
→ measurable Jennifer task
→ governed execution
→ benchmark + receipt
→ integration decision
→ partnership / deployment ROI
```

The collaboration question becomes **"What measured capability does this runtime add to Jennifer, under which constraints, at what cost?"** rather than a permanent brand ranking.

## Runtime categories

`engines.yaml` intentionally distinguishes:

- direct `SKILL.md` delivery where a product explicitly supports it;
- repository/context adapters for coding agents;
- retrieval/source adapters for evidence-oriented systems;
- local agent adapters for open-weight/offline runtimes;
- native Project Jennifer contracts for KC and RTCP agents.

For external products, validate current provider support at deployment time. Product capabilities change faster than Jennifer's governance contracts should.

## Benchmark dimensions

Every renter may be measured on:

- `extraction`;
- `planning`;
- `retrieval_grounding`;
- `coding`;
- `communication_attention`.

Additional dimensions can be versioned later. Missing scores remain `null`; they must not be fabricated.

## Data and privacy

Before sending context to a cloud renter:

1. classify the current CAG relational lane;
2. classify source privacy and authority;
3. apply the RAG authority/privacy guard;
4. respect the renter's `data_egress` constraint;
5. preserve provenance;
6. produce a receipt.

Private/intimate context stays out of work/research/customer/public lanes unless the user explicitly authorizes the crossing.

## Memory and training

A renter may return work and may generate consequences. It cannot silently declare that its output became Jennifer memory.

```text
renter result
→ candidate memory / preference artifact
→ receipt
→ human / authority validation
→ admitted state OR retained unpromoted evidence
```

Human validation is mandatory before CAG/RAG/RIVM receipts or chosen/rejected pairs are promoted into training datasets.

## Source skills

- `../SKILL.md`
- `../project-jennifer/SKILL.md`
- `../cdp-conceptual-divergence/SKILL.md`
- `../ceep-conceptual-evaluation/SKILL.md`
- `../poc-foc-evaluation/SKILL.md`
- `../ccp-conceptual-convergence/SKILL.md`
- `../ncmp-concept-intake/SKILL.md`
- `../cag-communication-attention/SKILL.md`
- `../rag-governed-retrieval/SKILL.md`
- `../jennifer-stateless-renter/SKILL.md`
- `../forge-rivm/SKILL.md`
- `../authored-relational-attention/SKILL.md`
- `../jennifer-authority-governance/SKILL.md`
- `../jennifer-runtime-memory/SKILL.md`
- `../jennifer-validation-poc-foc/SKILL.md`
- `../jennifer-conceptual-convergence/SKILL.md`
- `../jennifer-companions-npcs/SKILL.md`
- `../jennifer-telemetry-storage/SKILL.md`
- `../jennifer-ncmp-mmao/SKILL.md`
- `../jennifer-game-web-api/SKILL.md`
- `../jennifer-assets-lore/SKILL.md`
- `../jennifer-ci-benchmarks/SKILL.md`
- `../jennifer-adoption-provider-onboarding/SKILL.md`
- `../jennifer-human-crisis-ingress/SKILL.md`

## Provider onboarding checklist

A prospective AI provider, partner, accelerator, lab or enterprise collaborator should be able to supply:

- exact model/runtime identifier;
- local/cloud/hybrid execution mode;
- tool-use and retrieval capabilities;
- data-egress behavior;
- offline behavior;
- structured-output capability;
- benchmark evidence;
- pricing/usage assumptions when commercial evaluation is requested;
- licensing and deployment constraints;
- adapter/integration owner.

Project Jennifer then returns its own validation evidence and receipts so both sides can evaluate technical fit and ROI without confusing marketing claims with proof.
