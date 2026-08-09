# Project Jennifer Skill Distribution

This directory defines how Project Jennifer's portable `SKILL.md` workflows are handed to stateless renters without changing the underlying governance contract.

## Distribution law

```text
SKILL.md source of truth
→ renter/provider adapter
→ exact runtime capability manifest
→ bounded execution
→ evidence + result + receipt
```

Provider-specific delivery mechanisms may change. Jennifer's CAG, RAG, privacy, authority and memory semantics do not silently change with them.

## Why this matters for collaboration

A provider or partner should not need to reverse-engineer Project Jennifer before contributing. The minimum integration packet is:

1. the relevant `SKILL.md` files;
2. JSON schemas for receipts/evidence/capability manifests;
3. the exact runtime capability manifest;
4. benchmark results for the requested task lanes;
5. the adapter that supplies the skill/context to the runtime;
6. evidence and receipts returned after execution.

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
2. classify source privacy;
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

- `../cag-communication-attention/SKILL.md`
- `../rag-governed-retrieval/SKILL.md`
- `../jennifer-stateless-renter/SKILL.md`

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
