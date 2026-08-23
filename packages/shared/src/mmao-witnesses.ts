export type MMAOWitnessMode = "blind-witness" | "orchestrator" | "full-context-integrator";

export interface MMAOWitness {
  witnessId: string;
  mode: MMAOWitnessMode;
  runtimeId?: string;
  role: string;
}

export interface MMAOWitnessContribution {
  witnessId: string;
  contributionId: string;
  evidenceRefs: readonly string[];
  recordedAt: string;
}

export class MMAOWitnessGovernanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MMAOWitnessGovernanceError";
  }
}

function requireText(value: string, field: string): void {
  if (!value.trim()) {
    throw new MMAOWitnessGovernanceError(`${field} is required.`);
  }
}

/**
 * Founder-defined witness separation:
 * blind witnesses must not receive each other's answers before testimony is recorded.
 * The orchestrator may receive recorded contributions for comparison/synthesis but must not
 * leak them into later blind-witness prompts. A full-context integrator is an explicit exception
 * and must not be reported as blind independent replication.
 */
export function mayReceiveContribution(
  recipient: MMAOWitness,
  source: MMAOWitness,
  sourceContributionRecorded: boolean,
): boolean {
  requireText(recipient.witnessId, "Recipient witness ID");
  requireText(source.witnessId, "Source witness ID");

  if (recipient.witnessId === source.witnessId) return true;

  if (recipient.mode === "orchestrator" || recipient.mode === "full-context-integrator") {
    return sourceContributionRecorded;
  }

  return false;
}

/**
 * A prompt for a blind witness may contain the common Forge-issued task/context, but not
 * another blind witness's recorded answer. This makes answer sharing explicit and testable.
 */
export function mayIncludePriorContributionInPrompt(
  recipient: MMAOWitness,
  source: MMAOWitness,
): boolean {
  if (recipient.witnessId === source.witnessId) return true;
  return recipient.mode === "full-context-integrator";
}

export function validateWitnessSet(witnesses: readonly MMAOWitness[]): void {
  const ids = new Set<string>();

  for (const witness of witnesses) {
    requireText(witness.witnessId, "Witness ID");
    requireText(witness.role, "Witness role");

    if (ids.has(witness.witnessId)) {
      throw new MMAOWitnessGovernanceError(`Duplicate MMAO witness '${witness.witnessId}'.`);
    }
    ids.add(witness.witnessId);
  }
}

/** Current founder topology. Runtime IDs remain caller supplied and capability-specific. */
export const PROJECT_JENNIFER_WITNESS_TOPOLOGY: readonly MMAOWitness[] = [
  {
    witnessId: "jennifer",
    mode: "blind-witness",
    role: "conceptual-continuity-authority",
  },
  {
    witnessId: "copilot",
    mode: "blind-witness",
    role: "independent-adversarial-witness",
  },
  {
    witnessId: "forge",
    mode: "orchestrator",
    role: "prompt-router-architecture-implementation-validation",
  },
  {
    witnessId: "cindy",
    mode: "full-context-integrator",
    role: "relational-affective-integrator",
  },
] as const;

validateWitnessSet(PROJECT_JENNIFER_WITNESS_TOPOLOGY);
