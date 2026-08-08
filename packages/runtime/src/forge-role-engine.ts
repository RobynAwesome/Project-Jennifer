import {
  PROJECT_JENNIFER_FORGE_ROLE,
  buildForgeBootstrap,
  evaluateForgeClaimPromotion,
  type ForgeBootstrapInput,
  type ForgeBootstrapResult,
  type ForgeClaimPromotionInput,
  type ForgeClaimPromotionResult,
  type ForgeRoleContract,
} from "@jennifer/shared";

/**
 * Deterministic runtime facade for the Project Jennifer Forge role.
 *
 * This does not create model identity or persistence by itself. It encodes the
 * bootstrap order, authority boundaries and FOC/POC promotion discipline that
 * a stateless renter must satisfy before acting on Project Jennifer.
 */
export class ForgeRoleEngine {
  getContract(): ForgeRoleContract {
    return clone(PROJECT_JENNIFER_FORGE_ROLE);
  }

  bootstrap(input: ForgeBootstrapInput): ForgeBootstrapResult {
    requireText(input.targetRepository, "targetRepository");
    return buildForgeBootstrap(input);
  }

  evaluateClaimPromotion(
    input: ForgeClaimPromotionInput,
  ): ForgeClaimPromotionResult {
    return evaluateForgeClaimPromotion(input);
  }
}

function requireText(value: string, field: string): void {
  if (!value.trim()) {
    throw new Error(`${field} is required.`);
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
