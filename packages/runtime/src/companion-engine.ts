import {
  COMPANION_CATALOG,
  generateId,
  getCompanionDefinition,
  now,
  type CompanionDefinition,
  type CompanionId,
  type CompanionSelection,
  type CompanionSelectionInput,
  type CompanionValidationReceipt,
  type ID,
} from "@jennifer/shared";

export interface CompanionSelectionResult {
  selection: CompanionSelection;
  receipt: CompanionValidationReceipt;
  companion: CompanionDefinition;
}

/**
 * CompanionManager governs companion selection independently from visual form.
 *
 * The selected character is not a cosmetic skin over an unconstrained model.
 * Each selection binds an explicit base logic, relationship lane, telemetry
 * profile, failure mode and validation receipt to the user's runtime state.
 */
export class CompanionManager {
  private readonly activeByUser = new Map<ID, CompanionSelection>();
  private readonly receipts = new Map<ID, CompanionValidationReceipt>();

  getCatalog(): CompanionDefinition[] {
    return COMPANION_CATALOG.map((companion) => ({
      ...companion,
      temperament: [...companion.temperament],
      supportedLanes: [...companion.supportedLanes],
      visual: { ...companion.visual },
      telemetry: { ...companion.telemetry },
    }));
  }

  getDefinition(id: CompanionId): CompanionDefinition | undefined {
    const companion = getCompanionDefinition(id);
    if (!companion) return undefined;

    return {
      ...companion,
      temperament: [...companion.temperament],
      supportedLanes: [...companion.supportedLanes],
      visual: { ...companion.visual },
      telemetry: { ...companion.telemetry },
    };
  }

  select(input: CompanionSelectionInput): CompanionSelectionResult {
    const companion = getCompanionDefinition(input.companionId);
    if (!companion) {
      throw new Error(`Unknown companion: ${input.companionId}`);
    }

    const selection: CompanionSelection = {
      id: generateId(),
      userId: input.userId,
      companionId: input.companionId,
      relationshipLane: input.relationshipLane,
      renderMode: input.renderMode ?? "embodied",
      selectedAt: now(),
    };

    const supportedLane = companion.supportedLanes.includes(
      input.relationshipLane
    );
    const dependencyRisk = clamp01(
      1 - companion.telemetry.dependencyResistance
    );
    const sycophancyResistance = clamp01(
      companion.telemetry.truthStrictness * 0.55 +
        companion.telemetry.governanceDiscipline * 0.45
    );
    const reasons: string[] = [];

    if (!supportedLane) {
      reasons.push(
        `${companion.name} does not support the ${input.relationshipLane} relationship lane.`
      );
    }
    if (dependencyRisk > 0.25) {
      reasons.push(
        "Companion dependency risk exceeds the Project Jennifer selection threshold."
      );
    }
    if (sycophancyResistance < 0.75) {
      reasons.push(
        "Companion sycophancy resistance is below the governed runtime threshold."
      );
    }

    const passed = reasons.length === 0;
    const receipt: CompanionValidationReceipt = {
      id: generateId(),
      selectionId: selection.id,
      userId: selection.userId,
      companionId: selection.companionId,
      relationshipLane: selection.relationshipLane,
      logicMatch: companion.baseLogic,
      supportedLane,
      agencyPreserved: true,
      truthBoundaryDeclared: true,
      dependencyRisk,
      sycophancyResistance,
      governanceDiscipline: companion.telemetry.governanceDiscipline,
      result: passed ? "PASSED" : "FAILED",
      reasons:
        reasons.length > 0
          ? reasons
          : [
              "Companion logic, relationship lane and governance thresholds validated.",
            ],
      timestamp: now(),
    };

    this.receipts.set(receipt.id, receipt);

    if (!passed) {
      return {
        selection,
        receipt,
        companion: this.cloneDefinition(companion),
      };
    }

    this.activeByUser.set(input.userId, selection);

    return {
      selection,
      receipt,
      companion: this.cloneDefinition(companion),
    };
  }

  getActiveSelection(userId: ID): CompanionSelection | undefined {
    const selection = this.activeByUser.get(userId);
    return selection ? { ...selection } : undefined;
  }

  getActiveCompanion(userId: ID): CompanionDefinition | undefined {
    const selection = this.activeByUser.get(userId);
    return selection ? this.getDefinition(selection.companionId) : undefined;
  }

  clearActiveSelection(userId: ID): boolean {
    return this.activeByUser.delete(userId);
  }

  getReceipt(receiptId: ID): CompanionValidationReceipt | undefined {
    const receipt = this.receipts.get(receiptId);
    return receipt ? { ...receipt, reasons: [...receipt.reasons] } : undefined;
  }

  getReceiptsForUser(userId: ID): CompanionValidationReceipt[] {
    return Array.from(this.receipts.values())
      .filter((receipt) => receipt.userId === userId)
      .map((receipt) => ({ ...receipt, reasons: [...receipt.reasons] }));
  }

  private cloneDefinition(companion: CompanionDefinition): CompanionDefinition {
    return {
      ...companion,
      temperament: [...companion.temperament],
      supportedLanes: [...companion.supportedLanes],
      visual: { ...companion.visual },
      telemetry: { ...companion.telemetry },
    };
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(4))));
}
