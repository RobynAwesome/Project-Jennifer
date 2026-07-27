import type { SemanticContract, ContractField, ID } from "@jennifer/shared";
import { generateId, now, ok, err, type Result } from "@jennifer/shared";

export interface ContractValidationError {
  field: string;
  message: string;
}

/**
 * Manages semantic contracts between modules. A semantic contract defines
 * the inputs, outputs, and constraints a module must honour – acting as an
 * enforceable interface at runtime, not just compile-time.
 */
export class SemanticContractRegistry {
  private contracts: Map<ID, SemanticContract> = new Map();

  register(contract: SemanticContract): void {
    this.contracts.set(contract.id, contract);
  }

  get(id: ID): SemanticContract | undefined {
    return this.contracts.get(id);
  }

  list(): SemanticContract[] {
    return Array.from(this.contracts.values());
  }

  /**
   * Validates that a payload satisfies a contract's input requirements.
   */
  validateInput(
    contractId: ID,
    payload: Record<string, unknown>
  ): Result<true, ContractValidationError[]> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      return err([{ field: "_contract", message: `Contract ${contractId} not found` }]);
    }

    const errors = this.validateFields(contract.inputs, payload);
    if (errors.length > 0) return err(errors);
    return ok(true);
  }

  /**
   * Validates that a payload satisfies a contract's output requirements.
   */
  validateOutput(
    contractId: ID,
    payload: Record<string, unknown>
  ): Result<true, ContractValidationError[]> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      return err([{ field: "_contract", message: `Contract ${contractId} not found` }]);
    }

    const errors = this.validateFields(contract.outputs, payload);
    if (errors.length > 0) return err(errors);
    return ok(true);
  }

  private validateFields(
    fields: ContractField[],
    payload: Record<string, unknown>
  ): ContractValidationError[] {
    const errors: ContractValidationError[] = [];

    for (const field of fields) {
      if (field.required && !(field.name in payload)) {
        errors.push({
          field: field.name,
          message: `Required field "${field.name}" is missing`,
        });
        continue;
      }

      const value = payload[field.name];
      if (value !== undefined && typeof value !== field.type && field.type !== "any") {
        errors.push({
          field: field.name,
          message: `Field "${field.name}" expected type ${field.type}, got ${typeof value}`,
        });
      }
    }

    return errors;
  }

  /**
   * Creates a contract from a simple schema definition.
   */
  static create(
    name: string,
    version: string,
    inputs: ContractField[],
    outputs: ContractField[],
    constraints: string[] = []
  ): SemanticContract {
    return {
      id: generateId(),
      name,
      version,
      inputs,
      outputs,
      constraints,
      createdAt: now(),
    };
  }
}
