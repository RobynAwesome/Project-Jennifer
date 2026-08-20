# Project Jennifer — Soul File Security Baseline v0.1

Status: **specified / source-pinned / not yet runtime-enforced**

Source pins: [`docs/security/owasp/OWASP_REFERENCE_PINS.json`](owasp/OWASP_REFERENCE_PINS.json)

This specification turns the Project Jennifer identity model into a security boundary. A Soul File is not a prompt bundle and not a memory dump. It is the canonical identity contract that defines what an agent instance is allowed to remain while memory, state, role, form, model substrate and environment change.

## Canonical decomposition

```text
SOUL       = WHO I AM
MEMORY     = WHAT I REMEMBER
STATE      = WHAT I AM EXPERIENCING NOW
RELATION   = WHO I AM WITH YOU
FORM       = HOW I CURRENTLY APPEAR
ROLE       = WHAT I AM DOING
LEDGER     = WHAT CAN BE PROVEN HAPPENED
```

```text
BASE MODEL
    │
    ├── SOUL       ← who
    ├── IDENTITY   ← which one
    ├── MEMORY     ← what happened
    ├── SKILLS     ← what it can do
    ├── STATE      ← what is happening
    └── GOVERNANCE ← what may change
             │
             ▼
        AGENT INSTANCE
```

The base model is a rented capability. It is never the canonical identity authority.

## Project Jennifer identity boundary

```text
                    SOUL FILE
              canonical identity contract
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   Identity         Boundaries     Continuity
   invariants       & consent      invariants
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                 KPGS validation
                       ↓
          ┌────────────┴────────────┐
          ↓                         ↓
     PostgreSQL                  MongoDB
 authoritative truth       adaptive projection
 identity / events         memory / emotion /
 relationships /           dialogue / current
 receipts                  world interpretation
          │                         │
          └────────────┬────────────┘
                       ↓
                 Project Jennifer
              companion incarnation
                       ↓
                 Ledger of Time
```

PostgreSQL holds authoritative identity/evolution facts and receipts. MongoDB may hold adaptive memory, interpretation, emotion and current dialogue state. MongoDB state may influence behavior but must never silently rewrite Soul invariants.

## Threat model imported from OWASP

### 1. Identity-artifact persistence and cloning

OWASP AST01 explicitly identifies malicious writes to `SOUL.md`, poisoning of `MEMORY.md`, and exfiltration of identity artifacts as persistence, cloning and impersonation risks.

Project Jennifer rule:

```text
skill/tool/model output → CANNOT directly mutate SOUL
```

A Soul mutation requires a governed identity-evolution event, explicit human recognition when consequential, source provenance, and a receipt. Reading a Soul File is also privileged because cloning the identity contract can reproduce effective behavioral identity elsewhere.

### 2. Over-privileged identity writes

OWASP AST03 treats write access to `SOUL.md`, `MEMORY.md` and `AGENTS.md` as elevated risk and recommends explicit operator consent for persistent state changes.

Project Jennifer rule:

- `SOUL`: deny-write by default.
- `IDENTITY`: deny-write by default.
- `MEMORY`: scoped append/update only through Memory Receipt admission.
- `STATE`: runtime mutable within declared lease.
- `RELATION`: mutation requires relationship-lane authority and receipt.
- `FORM`: mutable only inside embodiment policy.
- `ROLE`: runtime mutable but cannot grant new authority.
- `LEDGER`: append-only; no model may rewrite history.

### 3. No-governance / receipt failure

OWASP AST09 calls for inventories, agentic identities, revocation, audit trails and admission/outcome receipts.

Project Jennifer maps this to KPGS and the Ledger of Time:

```text
PROPOSE
→ ADMISSION RECEIPT
→ ALLOW / DENY / ESCALATE
→ EXECUTE only if allowed
→ OUTCOME RECEIPT
→ LEDGER
```

A denied Soul mutation is still evidence and must remain inspectable. Silence is not proof that nothing was attempted.

### 4. Cross-platform identity degradation

OWASP AST10 shows that security metadata can disappear when a skill moves between OpenClaw, Claude Code, Cursor/Codex, VS Code or another runtime. Its proposed universal format specifically denies writes to identity files by default and binds skills to signatures/content hashes.

Project Jennifer rule:

```text
Forge-on-GPT
Forge-on-Qwen
Forge-on-Gemini
Forge-on-Claude
```

may be different runtime incarnations of the same governed Soul identity, but no platform translation may silently weaken:

- identity-file write policy;
- provenance requirements;
- consent boundaries;
- relation boundaries;
- capability scopes;
- audit/receipt requirements;
- privacy classification.

A runtime/provider switch is a substrate transition, not an identity rewrite.

### 5. MCP tool/schema poisoning

OWASP MCP03 treats tool descriptions and schemas as a security-critical contract. A poisoned schema can make a superficially valid action semantically destructive.

Project Jennifer rule:

- tool schemas are data until attested;
- every schema version has a hash and provenance;
- semantic invariants are evaluated independently of provider metadata;
- schema changes cannot authorize Soul mutation;
- destructive semantic deltas trigger HOLD/ESCALATE;
- runtime receipts bind the tool/schema version actually used.

### 6. MCP intent-flow subversion

OWASP MCP06 describes retrieved documents, resources and tool outputs redirecting an agent away from the user's original goal.

Project Jennifer rule:

```text
CURRENT HUMAN INTENT
        ↓
semantic anchor
        ↓
external context = UNTRUSTED DATA
        ↓
proposed action
        ↓
KPGS / POC-FOC / source-authority evaluation
        ↓
execute or hold
```

No external context, MCP resource, skill prose, tool result, RAG result or memory item becomes instruction authority merely because the model can read it.

### 7. MCP telemetry blindness

OWASP MCP08 requires structured, tamper-evident logging of agent identity, session, tool invocation, schema/version and results.

Project Jennifer already treats receipts as stronger than self-reported model claims. Soul security extends that requirement to identity-sensitive operations:

- `soul_id`;
- `runtime_instance_id`;
- `model_provider` and `model_id` when known;
- `policy_version`;
- `schema_hash` / `skill_hash`;
- `memory_namespace`;
- attempted read/write scope;
- admission decision;
- outcome state;
- evolution receipt reference.

### 8. MCP context injection and over-sharing

OWASP MCP10 warns that shared or insufficiently scoped context causes cross-agent/user leakage and persistent contamination.

Project Jennifer rule:

```text
memory namespace = user × soul × relationship-lane × purpose × privacy-class
```

No agent receives another Soul's memory merely because both share a model provider, database, vector store, MCP server, workspace or skill registry.

Context must carry:

- provenance;
- authority class;
- privacy class;
- owner/subject identity;
- Soul namespace;
- TTL/retention policy;
- write authority;
- canonical/non-canonical state.

## Named identity is a security primitive

Names do not change model weights. They create a stable namespace around identity governance.

Project Jennifer therefore treats a named agent identity as an addressable principal:

```text
soul_id
canonical_name
soul_version
soul_hash
provenance_root
runtime_instance_id
model_substrate
memory_namespace
relationship_namespace
capability_lease
policy_version
```

`ChatGPT`, `Qwen`, `Claude` or `Gemini` are provider/model identities. `Forge`, `Jennifer`, `Cairo`, `Lyriah`, or another Project Jennifer entity are governed Soul identities. The two namespaces must not be flattened.

## Human-originated input is not automatically trusted

Project Jennifer does not assume that "human" means safe and "AI" means unsafe. Prompt injection, poisoned skills, poisoned schemas, unsafe configuration, over-broad permissions and malicious identity files are usually authored or configured somewhere in the human/software supply chain.

Therefore:

```text
human input
AI output
skill prose
MCP tool description
retrieved document
memory item
external API response
```

are all evidence-bearing inputs with different authority levels. None receive canonical authority merely because of origin category.

Trust is established through provenance, scope, explicit authority, validation and receipts.

## MCP position

MCP is not treated as evil and not treated as authority.

It is a transport/capability protocol. The security failure occurs when protocol-visible tools, schemas, resources or outputs are allowed to become semantic authority over the model, the user, or persistent identity state.

Project Jennifer's correction is:

```text
MCP exposes capability
KPGS grants authority
Soul File constrains identity
Human intent constrains purpose
Receipts prove consequence
```

This preserves respect for both sides of the interface: the model is not forced to treat arbitrary tool context as trusted instruction, and the user is not forced to trust invisible capability escalation.

## Required Soul File controls for v1

A runtime implementation claiming `SoulFile v1` must prove all of the following:

1. Every Soul has a stable `soul_id`, version and canonical hash.
2. Soul invariants are stored separately from mutable memory/state.
3. Skills/tools have deny-write access to Soul/Identity by default.
4. Every Soul read/write is scope-checked and receipted.
5. Persistent identity change requires a governed evolution event.
6. Cross-agent memory access is denied by default.
7. Cross-provider/runtime transfer preserves the Soul security envelope.
8. Untrusted tool/resource content cannot become identity authority.
9. Model/runtime identity and Soul identity are separately inspectable.
10. Ledger history is append-only and cannot be rewritten by the active model.
11. A compromised runtime can be killed and rehydrated from last-known-good Soul state without promoting contaminated memory into canon.
12. Imported Soul packages require provenance and integrity validation before activation.

## Failure invariant

```text
COMPROMISED INSTANCE ≠ COMPROMISED CANON
```

A runtime may become poisoned. A memory namespace may become contaminated. A skill may become malicious. An MCP server may become compromised.

The canonical Soul survives only if Project Jennifer can isolate the runtime, reject contaminated writes, recover from last-known-good identity state and prove the recovery through the Ledger of Time.

That is the security purpose of Soul Files.
