---
name: jennifer-authority-governance
description: Govern Project Jennifer roles, permissions, semantic contracts, elevation, source authority, privacy lanes, canon admission and architecture changes. Use whenever work touches packages/authority, packages/governance, governance/source-authority-registry.json, permissions, role elevation, source classification or authoritative project truth.
version: 1.0.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: authority-governance
  tags: [authority, governance, source-authority, privacy, canon]
---

# Jennifer Authority + Governance

## Sources
Read as applicable:
- `packages/authority/`
- `packages/governance/`
- `governance/source-authority-registry.json`
- `VALIDATION_POLICY.md`
- `docs/architecture/adr-0005-governed-source-authority-and-rivm.md`

## Governing invariant

**Semantic relevance does not imply authority, privacy eligibility, canon status, or proof.**

Preserve source classes and admission states declared by the registry. A renter may propose a change but cannot self-grant authority, elevate its role, cross privacy lanes, or declare its own output canon.

## Change protocol
1. Identify current actor/runtime and granted role.
2. Resolve the source class and admission state of every consequential input.
3. Check permission and semantic contracts before execution.
4. Route elevation through the repository's elevation firewall/authority gate rather than bypassing it.
5. Preserve contradictions, supersession and lineage explicitly.
6. Validate under `VALIDATION_POLICY.md`.
7. Return an authority/source receipt.

## Hard failures
- private source published without explicit authorization;
- historical/reference material silently promoted to canon;
- visual source treated as proof of runtime behavior;
- generated content marked validated without evidence;
- renter grants itself owner/admin/maintainer semantics;
- current human instruction overwritten by retrieved historical preference.

## Output
Return actor, requested operation, authority decision, source classes, privacy decision, evidence, resulting validation state and unresolved conflicts.
