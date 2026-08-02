# Protocols – Project Jennifer

## Protocol Index

| Protocol | Description |
|----------|-------------|
| [`poc-foc-feedback-loops.md`](poc-foc-feedback-loops.md) | `#PP1` POC-vs-FOC feedback loops, AI Identic Flow, Bracket Protocol, MLVP, Governance System Membranes, fabrication nesting tiers, and consequence governance |

---

## Governance Protocol

All requests to the Jennifer runtime MUST pass through the Governance Engine before the LLM reasoning call is initiated.

### Decision Flow

```
1. Caller submits request with context
2. PolicyEngine.evaluate(requestId, context)
3. effect === "deny"   → return GovernanceDecision(denied), no LLM call
4. effect === "escalate" → route to human review queue
5. effect === "allow"  → proceed to validation pipeline
```

### Policy Versioning

- Policies are immutable once published. New versions create new Policy records.
- Active session policies are pinned to the version at session start.
- Policy migrations run on session restart.

---

## Semantic Contract Protocol

Contracts define the input/output interface for every inter-module call.

```typescript
// Example contract definition
const contract = SemanticContractRegistry.create(
  "LLMReasoningCall",
  "1.0.0",
  [
    { name: "prompt", type: "string", required: true, description: "User prompt" },
    { name: "context", type: "object", required: true, description: "Memory context" },
    { name: "persona", type: "string", required: true, description: "Active persona" },
  ],
  [
    { name: "response", type: "string", required: true, description: "Generated response" },
    { name: "confidence", type: "number", required: true, description: "Confidence score" },
  ],
  ["response must be non-empty", "confidence must be between 0 and 1"]
);
```

---

## Telemetry Protocol

All modules MUST emit telemetry events for every significant operation.

### Event Kinds

| Kind | Source | When |
|------|--------|------|
| `user.action` | HTTP middleware | Every request |
| `system.event` | All modules | Significant state changes |
| `governance.decision` | PolicyEngine | Every evaluate() call |
| `memory.operation` | GSMB | store/retrieve/forget |
| `validation.result` | ValidationPipeline | Every run() call |
| `npc.action` | NPCAgent | Every tick() |
| `world.event` | WorldStateManager | World state changes |

### Event Schema

```typescript
{
  id: string,           // UUID v4
  kind: TelemetryEventKind,
  source: string,       // module name
  payload: object,      // event-specific data
  sessionId?: string,   // if session-scoped
  agentId?: string,     // if NPC-scoped
  timestamp: number,    // Unix epoch ms
}
```

---

## Memory Protocol

### Write Policy

- All writes through `IMemoryStore.store()` — never direct state mutation
- Importance scores must be provided by the caller; the store does not infer them
- Tags must include the calling module name as the first tag

### Eviction Policy

- Expired entries (`expiresAt < now()`) are removed on next access or consolidation pass
- Stale entries (not accessed in 7 days) have importance decayed by 5% per consolidation pass
- Entries with `importance < 0.01` are removed

### Context Window

- Maximum 20 entries in the active context window
- Entries are ranked by: `importance × recencyDecay × emotionalWeight × contextWeight`
- Recency half-life: 3 hours

---

## NPC Simulation Protocol

### Tick Contract

Every NPC must complete its tick within 100ms to prevent simulation lag.

### Offline Simulation

```
User goes offline
    │
    ├─ isPremium === true  → NPCRegistry.startContinuousSimulation() continues
    └─ isPremium === false → WorldStateManager.pauseSimulation() called
                             NPCRegistry.stopSimulation() called
```

### Relationship Evolution Rules

- Positive interactions increase trust by 0.01–0.05 per interaction
- Negative interactions decrease trust by 0.05–0.20 per interaction  
- Relationship type can upgrade: neutral → ally after sustained positive interaction
- Relationship type can downgrade: ally → neutral → rival after sustained negative interaction

---

## Collective Ingress Protocol

### Ingress Event Lifecycle

```
External signal detected
    │
    ▼
IngressMonitor.ingest(event) → validate magnitude/sentiment → store → emit
    │
    ▼
CollectivePerceptionProtocol.startNarrative(eventId)
    │
    ▼
Periodic: recordMeasurement(narrativeId, reach, sentimentDelta)
    │
    ▼
Narrative phases: emergence → amplification → distribution → saturation → decay
```

### Behaviour Modifier

The `getBehaviourModifier()` output is consumed by:
1. NPC tick logic (modulates goal priority weights)
2. HUE emotional state inference (adjusts baseline sentiment)
3. API response tone (passed as context to LLM)

---

## Crisis Connect Protocol

### Severity Escalation

| Severity | Response SLA | Auto-escalate to |
|----------|-------------|-----------------|
| low | 72h | — |
| medium | 24h | high if unresolved |
| high | 4h | critical if unresolved |
| critical | 30min | human operator |

### Resolution Requirements

A crisis can only be resolved when:
1. At least one `ResponseAction` exists with `status === "completed"`
2. A governance decision with `effect === "allow"` covers the resolution action
