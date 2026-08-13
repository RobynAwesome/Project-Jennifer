---
name: jennifer-adoption-provider-onboarding
description: Onboard AI providers, local models, coding agents, partners or contributors into Project Jennifer using capability manifests, distribution adapters, benchmarks, data-egress constraints and repo-native skills. Use whenever a new renter/provider/partner is evaluated or integrated.
version: 1.0.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: provider-partner-onboarding
  tags: [provider, onboarding, renters, adapters, partnerships]
---

# Jennifer Provider + Partner Onboarding

## Sources
- `skills/distribution/README.md`
- `skills/distribution/engines.yaml`
- `config/renters/`
- `docs/adoption-and-migration.md`
- `docs/architecture/engine-qualification-gate.md`
- `skills/jennifer-stateless-renter/SKILL.md`

## Minimum integration packet
A provider/partner should supply:
- exact model/runtime identifier;
- local/cloud/hybrid execution mode;
- tool/retrieval/structured-output capabilities;
- data-egress and offline behavior;
- licensing/deployment constraints;
- current benchmark evidence;
- pricing/usage assumptions when commercial evaluation is requested;
- integration owner.

Jennifer supplies the relevant SKILL.md contracts, schemas, task/eval definition, authority/privacy rules and receipt requirements.

## Evaluation law
Do not rank a vendor permanently by brand. Evaluate the exact runtime against the current Jennifer task under explicit constraints.

## Workflow
1. Create/validate capability manifest.
2. Determine data/privacy eligibility.
3. Select required Jennifer skills and adapter type.
4. Run benchmark/evaluation workload.
5. Inspect evidence and receipts.
6. Classify technical fit, gaps, cost and constraints.
7. Make integration decision without converting marketing claims into proof.

## Output
Return provider/runtime ID, capability manifest, selected adapter/skills, privacy decision, benchmark evidence, cost/constraint assumptions, integration recommendation and receipts.
