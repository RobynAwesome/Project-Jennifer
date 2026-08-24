---
name: jennifer-game-web-api
description: Build, debug or extend Project Jennifer's executable web game and API surface. Use whenever work touches apps/web, Phaser scenes/entities/bridges, Next.js UI, apps/api routes/server, runtime-governance-memory APIs, adaptive policy, browser-to-runtime integration, or player-facing consequence journal/reveal surfaces.
version: 1.1.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: game-web-api
  tags: [nextjs, phaser, api, game, typescript, consequence-journal]
---

# Jennifer Web Game + API

## Sources
- `apps/web/`
- `apps/api/`
- `apps/web/src/components/game/ConsequenceTrace.tsx`
- `apps/web/src/app/game/consequences/`
- `packages/runtime/`
- `packages/shared/`
- `packages/shared/src/consequence-reveal.ts`

## Runtime shape
The web surface combines Next.js UI with Phaser game code and explicit bridges for governance, memory and validation. The API exposes bounded routes including runtime, governance, memory, NCMP and Crisis Connect.

## Build law
Do not create a visually convincing scene that bypasses Jennifer state/validation contracts. Player-facing consequence must connect to the governed runtime when it claims persistence or authority.

## Consequence journal law
The player-facing consequence journal consumes the shared `ConsequenceRevealReceipt` contract. Do not define a parallel client-only truth model.

```text
DEMO / POC
→ visibly labelled non-authoritative
→ may validate layout + reveal comprehension mechanics
→ may NOT claim current-player world state

AUTHORITATIVE
→ requires runtime admission evidence
→ consumes governed reveal receipt
→ preserves origin + interpretation history + revisions
→ may render only the player-safe disclosed fields
```

The UI may humanize labels, group evidence and improve mobile readability. It may not invent retrospective cause prose, expose internal provenance, or convert an NPC interpretation into objective truth.

A `REVISED` reveal must display the earlier interpretation as history. Never replace it with only the newest belief.

Causal legibility is not narrative fairness. A readable journal surface does not prove that the consequence was fun, balanced, fair, consented to, or understood by a human player.

## Workflow
1. Identify UI/scene/API boundary.
2. Reuse shared contracts before introducing parallel types.
3. Route persistent state through runtime/memory skills.
4. Route governed decisions through authority/validation rather than client-only flags.
5. Keep fallback/demo state visibly distinguishable from authoritative state.
6. For consequence UI, require runtime admission before marking a trace authoritative.
7. Preserve state-gated disclosure and append-only revision history.
8. Design mobile-first before widening layouts.
9. Run relevant TypeScript/build/test checks.
10. Test scene/navigation/API failure paths as well as happy paths.

## Scene work
When adding a Phaser scene/entity, preserve `SceneManager`, bridge contracts and source asset provenance. Do not invent canon from a render or placeholder asset.

## API work
Validate input, permission/role, semantic contract, failure state and returned receipt/evidence. A 200 response does not itself prove the underlying world claim is validated.

If no authoritative API/read bridge exists for a new UI surface, do not fake one. Use an explicitly labelled demo fixture and leave the authoritative read-path as a separate validation gate.

## Output
Return affected route/scene/component, shared contracts used, source mode (demo or authoritative), state boundary, tests/build checks, validation state and receipt/evidence.
