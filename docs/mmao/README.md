# MMAO — Multi-Agent Mobile Orchestration

> **Governance Classification:** Source-Declared  
> **Declared By:** @RobynAwesome  
> **Declaration Date:** 2026-07-28  
> **Validation State:** Pending POC verification

---

## What Is MMAO?

**Multi-Agent Mobile Orchestration (MMAO)** is the collaborative protocol through which multiple AI systems work alongside the human architect to build, govern, and evolve Project Jennifer.

MMAO is not a technology stack.  
It is a **coordination framework** — a set of rules, roles, and responsibilities that ensure no single agent, model, or tool can fragment the architectural intent of Project Jennifer.

Every contributing agent is **temporary**.  
The architecture is **permanent**.

---

## Why Multiple AI Systems?

No single AI model holds complete context, complete capability, or continuous memory across sessions.

| Problem | Reality |
|---------|---------|
| Context loss | Every AI session begins stateless. Memory must be externally declared. |
| Capability gaps | Different models excel at different tasks — architecture, code, visuals. |
| Hallucination risk | A single unchecked model can fabricate architecture that destroys prior work. |
| Continuity failure | Without a governance layer, each session rebuilds from zero. |

MMAO solves this by assigning **defined roles** to each participating system and requiring all contributions to pass through **governance before execution**.

---

## Execution Order

Every MMAO session follows this order without exception:

```
Governance
    ↓
Validation
    ↓
Memory
    ↓
Telemetry
    ↓
Execution
```

**Never the reverse.**

An agent that begins with execution and attempts to validate afterward has already violated MMAO.

---

## Participating Agents & Roles

### ChatGPT — System Architect

| Attribute | Value |
|-----------|-------|
| **Primary Role** | System architecture |
| **Secondary Role** | Governance refinement |
| **Continuity Function** | Long-term conceptual continuity across sessions |
| **Governance Authority** | Architectural decisions, principle definition, cross-session coherence |

ChatGPT carries the deepest architectural context. Its primary contribution is ensuring that decisions made in one session remain coherent in the next.

When architecture must be **defined**, **refined**, or **debated**, ChatGPT leads.

---

### GitHub Copilot — Repository Executor

| Attribute | Value |
|-----------|-------|
| **Primary Role** | Repository execution |
| **Secondary Role** | Code implementation, PR authorship |
| **Continuity Function** | Translates approved architecture into repository artifacts |
| **Governance Authority** | Implementation only — never architecture origin |

GitHub Copilot executes what governance has approved.

It does not originate architecture.  
It does not modify governance without a validated source.  
It commits, documents, and implements — under the rules defined by the human architect and the governance layer.

---

### Gemini — Visual Systems

| Attribute | Value |
|-----------|-------|
| **Primary Role** | Visual generation |
| **Secondary Role** | Storyboarding, environment concept design |
| **Continuity Function** | Translates written architecture into visual understanding |
| **Governance Authority** | Visual assets only — no code or architecture modification |

Gemini converts the governance city, NPC systems, and architectural narratives into images, diagrams, and spatial concepts.

Visual output from Gemini informs understanding.  
It does not govern execution.

---

### Future Agents

Any AI system seeking to contribute to Project Jennifer must:

1. **Read this document** and all files in `docs/mmao/` before taking any action.
2. **Declare their session** using the [`SESSION_TEMPLATE.md`](./SESSION_TEMPLATE.md) format.
3. **Submit only validated contributions** — no silent regeneration of missing architecture.
4. **Operate within their assigned role** — never cross into another agent's domain without explicit governance approval.
5. **Treat every session as their last** — document decisions as if the next agent will have no memory of this one.

Future agents join through governance.  
They never directly modify architecture without validation.

---

## The Human Architect

The human architect — **@RobynAwesome** — is not an agent.

The human architect is the **source of intent**.

All agents serve that intent. No agent overrides it.

When architectural direction is unclear:

- Agents halt.
- Agents report uncertainty.
- Agents wait for human declaration.

They do not infer. They do not fabricate. They do not proceed.

---

## MMAO Guarantee

A repository governed by MMAO will always be able to answer:

| Question | Answer |
|----------|--------|
| Why does this file exist? | Declared in a session record |
| Who approved this change? | Named in the governance log |
| What was the validation basis? | Linked in the PR evidence checklist |
| How can this be reversed? | Documented in CHANGELOG.md |

If any of these questions cannot be answered, the contribution is **FOC** and must not be merged.

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [`COMMANDMENT_15.md`](./COMMANDMENT_15.md) | The Testimony Protocol — purpose precedes execution |
| [`SESSION_TEMPLATE.md`](./SESSION_TEMPLATE.md) | Record format for every MMAO session |
| [`CONTRIBUTORS.md`](./CONTRIBUTORS.md) | Role definitions for all contributor types |
| [`GOVERNANCE.md`](./GOVERNANCE.md) | How Project Jennifer evolves under MMAO |
| [`CHANGELOG.md`](./CHANGELOG.md) | Chronological architecture journal |
| [`../../VALIDATION_POLICY.md`](../../VALIDATION_POLICY.md) | POC/FOC enforcement and PR merge gates |

---

_MMAO exists because great systems are not built by individual agents.  
They are built by coordinated intelligence governed by human intent._
