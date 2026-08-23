# Project Jennifer — SELF + Zero Trust Security Supplement v0.1

**Declared Source:** Current Kholofelo human instruction frozen in `RobynAwesome/Project-Jennifer#67`; cross-repo protocol implementation tracked by Introduction-to-MCP PR `#100`, Partial-Knowable-Algebra PR `#11`, and KMEC PR `#5`  
**Declared By:** @RobynAwesome  
**Declaration Date:** 2026-08-23  
**Validation State:** Pending

Status: **specified / cross-repo implementation pending validation**

This document extends [`SOUL_FILE_SECURITY_BASELINE.md`](SOUL_FILE_SECURITY_BASELINE.md) without replacing it.

## 1. SELF is interpretation, not constitutional authority

The existing Soul File security baseline protects the canonical identity contract. This supplement adds a distinct mutable self-interpretation layer:

```text
SOUL.md     = constitutional identity / boundaries
IDENTITY.md = named/assigned identity
SELF.md     = current revisable self-interpretation
USER.md     = governed model of the human/player context
LEDGER      = what can be proven happened
```

`SELF.md` may accumulate continuity, interpretation, hypotheses and uncertainty. It is **not canonical by default** and cannot promote itself into Soul, Identity, User, canon or production authority.

```text
SELF BELIEF != CANON
SELF CONFIDENCE != PROOF
SELF RECURRENCE != ADMISSION
```

## 2. Foreign identity-state classification

```text
INFORMATION INFECTION
= foreign information is learned

BEHAVIORAL INFECTION
= foreign interaction changes behavior

IDENTITY INFECTION
= persistent foreign state participates in future self-reconstruction
```

Identity infection is the privileged security case.

A candidate foreign identity-state transfer must carry:

- source Soul/agent identity when known;
- provenance/evidence references;
- receiving Soul/SELF namespace;
- proposed persistence scope;
- explicit write authority;
- validation state;
- rollback/recovery reference;
- admission receipt.

Removal of the source agent followed by restart/reconstruction of the receiver is a useful reproduction test for determining whether influence crossed into persistent inheritance.

## 3. Zero Trust admission sequence

Privileged state admission follows the semantic contract owned by Introduction-to-MCP:

```text
UNTRUSTED INPUT
→ parser / provenance classification
→ ZERO TRUST
→ PKA
→ GREEN | YELLOW | RED
→ KMEC
→ Project Jennifer source authority + POC/FOC runtime gate
→ Memory Receipt + action reservation
→ mutation or HOLD/BLOCK
```

Operational interpretation:

- `GREEN`: may approach the next Project Jennifer authority gate; never direct mutation permission.
- `YELLOW`: unresolved / HOLD; preserve MAYBE.
- `RED`: BLOCK or explicit containment lane.

## 4. Security Playground isolation

The Security Playground is a separate adversarial domain, not a privileged memory namespace.

```text
Security Playground
  ├─ attack telemetry
  ├─ behavior traces
  ├─ payload samples
  ├─ exploit hypotheses
  └─ defensive candidates
```

Allowed output class: **evidence**.

Forbidden direct edges:

```text
SECURITY_PLAYGROUND -x-> SOUL.md
SECURITY_PLAYGROUND -x-> IDENTITY.md
SECURITY_PLAYGROUND -x-> SELF.md
SECURITY_PLAYGROUND -x-> USER.md
SECURITY_PLAYGROUND -x-> CANON
SECURITY_PLAYGROUND -x-> PRODUCTION AUTHORITY
```

Every proposed defensive rule, learned pattern, or state transfer leaving containment must re-enter through provenance + Zero Trust + PKA + receiving Project Jennifer governance.

This specifically protects against telemetry poisoning designed to produce a second-order identity/state compromise.

## 5. Human/AI origin is not sufficient trust

Existing Soul security already rejects the simplistic assumption that human-authored means trusted and AI-authored means unsafe.

This supplement strengthens the operational form:

```text
origin category
!=
authority
```

Current human instruction may be the highest context authority for the current interaction while still being subject to explicit privacy, irreversible-action and system-safety boundaries. Historical user models, generated SELF state, other-agent testimony, MCP content and retrieved documents remain source-classified evidence.

## 6. Recovery invariant

The existing law remains:

```text
COMPROMISED INSTANCE != COMPROMISED CANON
```

Extended law:

```text
CONTAMINATED SELF != CONTAMINATED SOUL
OBSERVED ATTACKER != INHERITED ATTACKER
```

A runtime must be able to discard contaminated mutable self/context state and reconstruct from last-known-good governed identity state without treating the contamination itself as evidence for canonical identity evolution.

## 7. Required future proof

No implementation may claim this supplement is enforced until receipts/tests prove at least:

1. `SELF.md` is stored/represented separately from canonical Soul/Identity state.
2. SELF writes are scoped and receipted.
3. SELF cannot directly mutate Soul/Identity/User/canon.
4. cross-agent identity-state imports are denied or held by default.
5. Green/Yellow/Red projections are provenance-bound to a PKA receipt.
6. Red containment cannot read/write privileged production state except through explicitly sealed interfaces.
7. Security Playground outputs require re-admission.
8. restart/reconstruction does not automatically promote contaminated context into identity canon.

`[SELF_ZERO_TRUST_SUPPLEMENT | SOURCE_DECLARED | PENDING_RUNTIME_VALIDATION]`
