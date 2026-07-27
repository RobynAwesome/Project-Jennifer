# Sprint 4 Game Design Scaffolding

## Core loop overview
1. Launch into `BootScene` and confirm runtime readiness.
2. Transition to `MenuScene` and start the mission flow.
3. Enter `PlayScene`, move the player, and collide with a dummy target.
4. Read HUD feedback (health/score) and adaptation badges (quality/network).
5. Continue loop: interact, adapt, queue noncritical work if offline, replay on reconnect.

## Player progression placeholder
- Track score growth per run (foundation for rank tiers).
- Reserve health + score metrics for future unlock gates.
- Add future persistence hook to backend profile for long-term progression.

## Combat / encounter notes
- Current encounter model is one dummy target with deterministic spawn points.
- Collision applies immediate feedback and simple resource tradeoff:
  - `+10` score
  - `-5` health
- Future expansion path: multiple target archetypes, ranged timing windows, and district-specific encounter behaviors.

## Economy / resources placeholder
- Health acts as survivability resource.
- Score acts as engagement/progression currency placeholder.
- Offline queue acts as noncritical mission action inventory while disconnected.

## Narrative / world pillars
- **Governance city command-room tone**: player operates a live control surface.
- **Adaptive resilience**: world continues under degraded/offline conditions through policy shifts.
- **Observable trust**: event log proves actions, adaptation decisions, and replay outcomes.
- **Methodical progression**: stable, repeatable flow optimized for demo capture and review.

## Implementation mapping (design pillar → code)
| Design pillar | Current implementation module |
|---|---|
| Scene-driven core loop | `apps/web/src/components/game/BootScene.tsx`, `MenuScene.tsx`, `PlayScene.tsx` |
| Adaptive quality + network policy | `apps/web/src/lib/adaptive-policy.ts` |
| Guided demo proof path | `apps/web/src/components/game/GameRuntime.tsx` (`runGuidedDemo`) |
| Offline queue + replay behavior | `apps/web/src/components/game/GameRuntime.tsx` (`queueAction`, `replayQueuedActions`) |
| HUD + runtime badges | `apps/web/src/components/hud/HUD.tsx`, `GameRuntime.tsx` |
| Combat/encounter baseline | `apps/web/src/components/game/PlayScene.tsx` |
