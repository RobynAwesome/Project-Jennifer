import type { RoleDefinition } from "./RoleDefinition.js";

/**
 * Immutable registry of all constitutional roles defined by the Jennifer
 * Runtime Charter.  These definitions are the ground truth consulted by
 * RoleRegistry and AuthorityGate.
 *
 * Charter rule 1: Roles are permanent.
 * Charter rule 3: Authority belongs to the role, never the participant.
 */
export const SYSTEM_ROLES: ReadonlyArray<RoleDefinition> = Object.freeze([
  {
    id: "GovernanceArchitect",
    displayName: "Governance Architect",
    authorityLevel: "elevated",
    permissions: ["define:policies", "define:contracts"],
    prohibitions: ["modify:source", "execute:builds", "persist:state"],
  },
  {
    id: "CodeExecutor",
    displayName: "Code Executor",
    authorityLevel: "standard",
    permissions: ["modify:source", "execute:builds", "implement:contracts"],
    prohibitions: ["define:policies", "define:contracts"],
  },
  {
    id: "VisualCreator",
    displayName: "Visual Creator",
    authorityLevel: "standard",
    permissions: ["produce:images", "produce:media", "generate:assets"],
    prohibitions: ["define:policies", "define:contracts", "modify:source", "execute:builds"],
  },
  {
    id: "ValidationAgent",
    displayName: "Validation Agent",
    authorityLevel: "standard",
    permissions: ["evaluate:evidence", "produce:receipts"],
    prohibitions: ["execute:builds", "persist:state"],
  },
  {
    id: "MemoryAgent",
    displayName: "Memory Agent",
    authorityLevel: "standard",
    permissions: ["persist:state"],
    prohibitions: ["define:policies", "define:contracts"],
  },
  {
    id: "HumanStrategicAuthority",
    displayName: "Human Strategic Authority",
    authorityLevel: "sovereign",
    permissions: [
      "approve:strategy",
      "sign-off:execution",
      "delegate:roles",
      "define:policies",
      "define:contracts",
      "modify:source",
      "execute:builds",
      "implement:contracts",
      "produce:images",
      "produce:media",
      "generate:assets",
      "evaluate:evidence",
      "produce:receipts",
      "persist:state",
    ],
    prohibitions: [],
  },
] as const);
