import type Phaser from "phaser";
import type { JenniferCityContinuitySnapshot } from "./session-store";
import { REGISTRY_KEYS } from "../registry";

/** Hydrate Phaser registry from a continuity snapshot. */
export function applyContinuityToRegistry(
  registry: Phaser.Data.DataManager,
  snapshot: JenniferCityContinuitySnapshot,
  sourceMode: string,
): void {
  registry.set(REGISTRY_KEYS.SESSION_ID, snapshot.sessionId);
  if (snapshot.persona) registry.set(REGISTRY_KEYS.PERSONA, snapshot.persona);
  if (snapshot.playerName) {
    registry.set(REGISTRY_KEYS.PLAYER_NAME, snapshot.playerName);
  }
  if (snapshot.companionId) {
    registry.set(REGISTRY_KEYS.COMPANION_ID, snapshot.companionId);
  }
  if (snapshot.companionName) {
    registry.set(REGISTRY_KEYS.COMPANION_NAME, snapshot.companionName);
  }
  if (snapshot.companionLogic) {
    registry.set(REGISTRY_KEYS.COMPANION_LOGIC, snapshot.companionLogic);
  }
  if (snapshot.companionLane) {
    registry.set(REGISTRY_KEYS.COMPANION_LANE, snapshot.companionLane);
  }
  if (snapshot.companionRenderMode) {
    registry.set(REGISTRY_KEYS.COMPANION_RENDER_MODE, snapshot.companionRenderMode);
  }
  if (snapshot.companionReceipt) {
    registry.set(
      REGISTRY_KEYS.LAST_COMPANION_RECEIPT,
      JSON.stringify(snapshot.companionReceipt),
    );
  }
  if (snapshot.relationshipId) {
    registry.set(REGISTRY_KEYS.RELATIONSHIP_ID, snapshot.relationshipId);
  }
  if (snapshot.questInstanceId) {
    registry.set(REGISTRY_KEYS.QUEST_INSTANCE_ID, snapshot.questInstanceId);
  }
  registry.set(REGISTRY_KEYS.EPISODE_COMPLETE, Boolean(snapshot.questComplete));
  if (snapshot.questChoice) {
    registry.set(REGISTRY_KEYS.EPISODE_CHOICE, snapshot.questChoice);
  }
  if (snapshot.episodeRevealId) {
    registry.set(REGISTRY_KEYS.EPISODE_REVEAL_ID, snapshot.episodeRevealId);
  }
  registry.set(REGISTRY_KEYS.CONTINUITY_SOURCE, sourceMode);
}

export function readContinuityFromRegistry(
  registry: Phaser.Data.DataManager,
): JenniferCityContinuitySnapshot | null {
  const sessionId = registry.get(REGISTRY_KEYS.SESSION_ID) as string | undefined;
  if (!sessionId) return null;

  let companionReceipt;
  const rawReceipt = registry.get(REGISTRY_KEYS.LAST_COMPANION_RECEIPT) as
    | string
    | undefined;
  if (rawReceipt) {
    try {
      companionReceipt = JSON.parse(rawReceipt);
    } catch {
      companionReceipt = undefined;
    }
  }

  return {
    schemaVersion: 1,
    sessionId,
    persona: registry.get(REGISTRY_KEYS.PERSONA) as string | undefined,
    playerName: registry.get(REGISTRY_KEYS.PLAYER_NAME) as string | undefined,
    companionId: registry.get(REGISTRY_KEYS.COMPANION_ID) as
      | JenniferCityContinuitySnapshot["companionId"]
      | undefined,
    companionName: registry.get(REGISTRY_KEYS.COMPANION_NAME) as
      | string
      | undefined,
    companionLogic: registry.get(REGISTRY_KEYS.COMPANION_LOGIC) as
      | string
      | undefined,
    companionLane: registry.get(REGISTRY_KEYS.COMPANION_LANE) as
      | JenniferCityContinuitySnapshot["companionLane"]
      | undefined,
    companionRenderMode: registry.get(REGISTRY_KEYS.COMPANION_RENDER_MODE) as
      | JenniferCityContinuitySnapshot["companionRenderMode"]
      | undefined,
    companionReceipt,
    relationshipId: registry.get(REGISTRY_KEYS.RELATIONSHIP_ID) as
      | string
      | undefined,
    questInstanceId: registry.get(REGISTRY_KEYS.QUEST_INSTANCE_ID) as
      | string
      | undefined,
    questComplete: Boolean(registry.get(REGISTRY_KEYS.EPISODE_COMPLETE)),
    questChoice: registry.get(REGISTRY_KEYS.EPISODE_CHOICE) as string | undefined,
    episodeRevealId: registry.get(REGISTRY_KEYS.EPISODE_REVEAL_ID) as
      | string
      | undefined,
    updatedAt: Date.now(),
  };
}
