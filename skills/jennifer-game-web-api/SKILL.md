---
name: jennifer-game-web-api
description: Build, debug or extend Project Jennifer's executable web game and API surface. Use whenever work touches apps/web, Phaser scenes/entities/bridges, Next.js UI, apps/api routes/server, runtime-governance-memory APIs, adaptive policy, or browser-to-runtime integration.
version: 1.0.0
license: MIT
metadata:
  project: Project Jennifer
  owner: Kholofelo Robyn Rababalela
  capability: game-web-api
  tags: [nextjs, phaser, api, game, typescript]
---

# Jennifer Web Game + API

## Sources
- `apps/web/`
- `apps/api/`
- `packages/runtime/`
- `packages/shared/`

## Runtime shape
The web surface combines Next.js UI with Phaser game code and explicit bridges for governance, memory and validation. The API exposes bounded routes including runtime, governance, memory, NCMP and Crisis Connect.

## Build law
Do not create a visually convincing scene that bypasses Jennifer state/validation contracts. Player-facing consequence must connect to the governed runtime when it claims persistence or authority.

## Workflow
1. Identify UI/scene/API boundary.
2. Reuse shared contracts before introducing parallel types.
3. Route persistent state through runtime/memory skills.
4. Route governed decisions through authority/validation rather than client-only flags.
5. Keep fallback/demo state visibly distinguishable from authoritative state.
6. Run relevant TypeScript/build/test checks.
7. Test scene/navigation/API failure paths as well as happy paths.

## Scene work
When adding a Phaser scene/entity, preserve `SceneManager`, bridge contracts and source asset provenance. Do not invent canon from a render or placeholder asset.

## API work
Validate input, permission/role, semantic contract, failure state and returned receipt/evidence. A 200 response does not itself prove the underlying world claim is validated.

## Output
Return affected route/scene/component, shared contracts used, state boundary, tests/build checks, validation state and receipt/evidence.
