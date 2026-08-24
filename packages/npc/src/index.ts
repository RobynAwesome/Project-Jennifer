export {
  AwarenessEngine,
  RelationshipGraph,
  NPCAgent,
  NPCRegistry,
} from "./npc-runtime.js";
export type {
  LocalAwarenessSnapshot,
  NPCBroadcastEpistemicInput,
  NPCGoal,
  NPCQueuedEpistemicEvent,
  NPCTickDecision,
} from "./npc-runtime.js";

export {
  EpistemicDivergenceEngine,
  EpistemicDivergenceError,
} from "./epistemic-divergence.js";
export type {
  ActorObservation,
  ConsequenceRule,
  ConsequenceVisibility,
  DivergenceActorContext,
  DivergenceAwarenessSnapshot,
  DivergenceCapability,
  DivergenceConsequenceIntent,
  DivergenceEvent,
  DivergenceEventFact,
  DivergenceGoalSnapshot,
  EpistemicDisposition,
  EpistemicDivergenceInput,
  EpistemicDivergenceReceipt,
  EpistemicDivergenceThresholds,
  InterpretationCandidate,
  InterpretationLabel,
  ObservationMeaning,
} from "./epistemic-divergence.js";
