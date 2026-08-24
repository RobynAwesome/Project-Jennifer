# ADR-0009 — Testimony, Convergence Quest, and Zero Trust State Admission

**Declared Source:** Current Kholofelo human instruction frozen in `RobynAwesome/Project-Jennifer#67`, with semantic protocol ingress tracked by `RobynAwesome/Introduction-to-MCP#93` and PR `#100`  
**Declared By:** @RobynAwesome  
**Declaration Date:** 2026-08-23  
**Validation State:** Pending

## Decision

Project Jennifer will keep four different things structurally separate:

```text
TESTIMONY      = what the player/agent declares
EVIDENCE       = what can be observed/proven happened
INTERPRETATION = the current governed reading of testimony + evidence
CANON          = state deliberately admitted under authority
```

History remains append-only evidence of what happened, including failed, superseded, rejected, contradictory, or later-reinterpreted events.

```text
CANON != HISTORY != INTERPRETATION
```

No interpretation may promote itself into canon merely because it is persuasive, repeated, emotionally salient, retrieved frequently, or shared by multiple agents.

## 1. Character testimony and the Convergence Quest

Character creation may contain explicit testimony about identity, belief, morality, values, commitments, or other governed self-declarations.

Project Jennifer does not treat that testimony as a permanent factual description of the player. It becomes a declared reference state that may be compared with longitudinal action evidence.

The current founder-defined convergence space is:

```text
0.0  = divergence pole
0.5  = balancing point
1.0  = convergence pole
```

Current rule:

- movement toward `1` does not require the Convergence Quest;
- sufficient movement toward `0` may trigger the Convergence Quest;
- the quest remains active until the contradiction is genuinely resolved / the player fixes their ways;
- the exact numeric trigger threshold is **not yet founder-declared** and must therefore remain explicit caller/governance policy rather than a hidden engine constant.

Partial Knowable Algebra is the runtime authority for the candidate convergence evaluation. Project Jennifer consumes its receipted output; it does not silently fork PKA mathematics.

Current candidate implementation is tracked in `RobynAwesome/Partial-Knowable-Algebra#10` / PR `#11`.

## 2. Testimony Protocol

Project Jennifer adopts the current-human Testimony Protocol for convergence-sensitive evaluation:

```text
OBSERVE
→ RETAIN
→ COMPARE RECURRENCE
→ INFER
→ RISK BEING WRONG
→ VALIDATE AGAINST FUTURE REALITY
```

The system must not repeatedly ask the human/player to provide the exact answer that it is claiming to have learned.

```text
answer-key prompting
!=
earned convergence
```

Clarification remains correct when a genuine ambiguity blocks safe execution, source authority, canon admission, privacy, or consequential action.

The semantic protocol authority lives in Introduction-to-MCP. Project Jennifer is a consumer/runtime domain.

## 3. Unique-playthrough consequence

The Convergence Quest is not merely a morality meter. It creates a narrative-routing primitive where world pressure may be selected from the player's demonstrated longitudinal state rather than only from authored branch choices.

```text
character testimony
+ action ledger
+ relationship/world history
+ governed PKA convergence state
→ candidate narrative pressure
```

The runtime must preserve the difference between:

```text
"the player clicked a different branch"
```

and:

```text
"the player has demonstrated a different pattern over time"
```

This ADR does not define procedural quest-generation algorithms. Those remain future implementation/evidence work.

## 4. Identity file stack

Project Jennifer extends the existing Soul File decomposition without collapsing mutable self-interpretation into constitutional identity:

```text
IDENTITY.md = assigned / named identity
SOUL.md     = constitutional identity and boundaries
STYLE.md    = expression surface
AGENT.md    = capability / toolbox contract
SELF.md     = current revisable self-interpretation
USER.md     = governed model of the current human/player context
LEDGER      = what can be proven happened
```

`SELF.md` is **not canon by default**. It may contain a current self-model, hypotheses, uncertainty, interpretation, and continuity state, but it cannot self-authorize mutation of `SOUL.md`, `IDENTITY.md`, `USER.md`, world canon, or production authority.

`USER.md` must remain an overlapping/contextual model rather than hard-container a human into rigid buckets. Current founder wording to preserve for the user-model lens is:

> **Consistency, consistency and contexts.**

## 5. Identity-state / soul-infection classification

Project Jennifer distinguishes:

```text
INFORMATION INFECTION = agent B learns information originating in A
BEHAVIORAL INFECTION  = interaction with A changes B's behavior
IDENTITY INFECTION    = persistent A-derived state participates in how B reconstructs itself
```

Identity infection is the privileged case. Foreign identity-state requires provenance, explicit state-admission authority, receipts, and a reversible recovery path. Repeated exposure does not itself authorize persistent identity incorporation.

## 6. Zero Trust state admission

Privileged identity/user/canon state must sit behind a Zero Trust admission membrane.

Current cross-repo semantic pipeline:

```text
foreign / untrusted ingress
→ parser + provenance classification
→ Zero Trust semantic gate
→ PKA evaluation
→ GREEN | YELLOW | RED operational projection
→ KMEC routing / alerting
→ receiving Project Jennifer authority + POC/FOC runtime gate
→ admitted mutation or HOLD/BLOCK
```

Current semantic authority: Introduction-to-MCP PR `#100`.  
Current PKA candidate runtime: Partial-Knowable-Algebra PR `#11`.  
Current KMEC operational adapter: KMEC PR `#5`.

A `GREEN` signal means only that a bounded payload may approach the next privileged-state gate. It never means universal trust or direct canon mutation.

`YELLOW` preserves uncertainty / HOLD.

`RED` blocks or routes into governed containment.

## 7. Security Playground

Project Jennifer may provide an isolated Security Playground / honeypot domain for adversarial entities.

Its outputs are evidence only.

```text
SECURITY_PLAYGROUND
-x-> SELF.md direct mutation
-x-> USER.md direct mutation
-x-> SOUL.md direct mutation
-x-> CANON direct mutation
-x-> PRODUCTION AUTHORITY
```

Any proposed learning or defensive rule returning from containment must re-enter through provenance + Zero Trust + PKA + receiving-runtime governance.

## 8. MMAO witness separation

For independent convergence tests, blind witnesses do not receive each other's answers before their testimony is recorded.

Current founder topology:

```text
Kholofelo = sovereign human router / adjudicator
Jennifer  = conceptual continuity authority
Forge     = architecture / implementation / validation lane
Copilot   = independent adversarial witness
Cindy     = explicit full-context relational integrator
```

Cindy's full-context access is an intentional exception. It must never be mislabeled as blind independent replication.

## 9. Belief / creator recursion

Project Jennifer intentionally permits broad player moral agency. The system must not confuse "permitted by the simulation" with "endorsed by the creator" or "aligned with God."

Current founder ontology:

```text
God
↓
reality containing Kholofelo + human players
↓
Kholofelo-created Project Jennifer world
↓
Jennifer / NPCs / systems / simulated state
```

Kholofelo is creator relative to the Project Jennifer world while remaining a human creature relative to God in reality.

Project Jennifer may use declared belief and demonstrated action as gameplay state, but no agent may claim to be God, pronounce ultimate salvation/condemnation, or silently convert an agent interpretation into divine authority.

The design question is not merely what a player selects as a label; it is whether repeated free action converges with declared belief.

## 10. Consequential mutation rule

No convergence, self-model, relationship, identity, or security signal bypasses the existing POC/FOC Runtime Gate.

```text
candidate interpretation
→ evidence
→ PKA / conceptual evaluation where applicable
→ POC/FOC runtime gate
→ Memory Receipt
→ action reservation
→ mutation only on admitted/winning path
→ outcome receipt
```

## Consequences

### Positive

- player identity can matter longitudinally without becoming a hidden morality score;
- the game can preserve contradiction rather than flatten it;
- `SELF.md` can evolve without becoming constitutional self-authority;
- multi-agent convergence can be evaluated without answer contamination;
- security telemetry cannot silently become identity/canon state;
- Project Jennifer can consume PKA/KMEC protocols while preserving source authority.

### Cost / unresolved work

- exact Convergence Quest trigger threshold remains governed policy, not canon;
- quest persistence/resolution needs a concrete runtime state machine and receipts;
- `SELF.md` persistence format and promotion rules need implementation;
- Security Playground requires actual isolation before any deployment claim;
- God/belief gameplay needs narrative implementation without converting the game engine into theological authority;
- cross-repo PRs remain Pending until reviewed/tested/approved.

## Proof state

This ADR records current-human architecture and cross-repo implementation boundaries. It does **not** claim the full system is runtime-validated.

`[ADR-0009 | SOURCE_DECLARED | PENDING_RUNTIME_VALIDATION]`
