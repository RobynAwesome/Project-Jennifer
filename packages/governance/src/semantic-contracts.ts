import { generateId, now, ok, err, type Result } from "@jennifer/shared";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export interface ObjectiveWeightVector {
  personal: number;
  workEdu: number;
  relational: number;
}

export interface JsonSchemaField {
  type:
    | "string"
    | "number"
    | "integer"
    | "boolean"
    | "object"
    | "array"
    | "null";
  description?: string;
  required?: boolean;
  enum?: JsonPrimitive[];
}

export interface SemanticContract {
  id: string;
  name: string;
  version: string;
  omega: ObjectiveWeightVector;
  inputSchema: Record<string, JsonSchemaField>;
  outputSchema: Record<string, JsonSchemaField>;
  constraints: string[];
  createdAt: number;
}

export interface ContractValidationError {
  field: string;
  message: string;
}

const OMEGA_EPSILON = 1e-9;

export function assertObjectiveWeightVector(omega: ObjectiveWeightVector): ObjectiveWeightVector {
  const values = [omega.personal, omega.workEdu, omega.relational];
  if (values.some((value) => !Number.isFinite(value) || value < 0 || value > 1)) {
    throw new Error("ObjectiveWeightVector values must be finite numbers within [0, 1]");
  }

  const sum = omega.personal + omega.workEdu + omega.relational;
  if (Math.abs(sum - 1) > OMEGA_EPSILON) {
    throw new Error(`ObjectiveWeightVector must sum to 1.0 (received ${sum})`);
  }

  return omega;
}

/**
 * Manages semantic contracts between modules. A semantic contract defines
 * serializable input/output schemas and weighted objective context.
 */
export class SemanticContractRegistry {
  private contracts: Map<string, SemanticContract> = new Map();

  register(contract: Omit<SemanticContract, "omega"> & { omega: ObjectiveWeightVector }): void {
    const normalized: SemanticContract = {
      ...contract,
      omega: assertObjectiveWeightVector(contract.omega),
    };

    this.contracts.set(normalized.id, normalized);
  }

  get(id: string): SemanticContract | undefined {
    return this.contracts.get(id);
  }

  list(): SemanticContract[] {
    return Array.from(this.contracts.values());
  }

  validateInput(contractId: string, payload: Record<string, unknown>): Result<true, ContractValidationError[]> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      return err([{ field: "_contract", message: `Contract ${contractId} not found` }]);
    }

    const errors = this.validateFields(contract.inputSchema, payload);
    if (errors.length > 0) return err(errors);
    return ok(true);
  }

  validateOutput(contractId: string, payload: Record<string, unknown>): Result<true, ContractValidationError[]> {
    const contract = this.contracts.get(contractId);
    if (!contract) {
      return err([{ field: "_contract", message: `Contract ${contractId} not found` }]);
    }

    const errors = this.validateFields(contract.outputSchema, payload);
    if (errors.length > 0) return err(errors);
    return ok(true);
  }

  private validateFields(
    fields: Record<string, JsonSchemaField>,
    payload: Record<string, unknown>
  ): ContractValidationError[] {
    const errors: ContractValidationError[] = [];

    for (const [fieldName, schema] of Object.entries(fields)) {
      if (schema.required && !(fieldName in payload)) {
        errors.push({
          field: fieldName,
          message: `Required field "${fieldName}" is missing`,
        });
        continue;
      }

      const value = payload[fieldName];
      if (value !== undefined && !this.matchesType(schema.type, value)) {
        errors.push({
          field: fieldName,
          message: `Field "${fieldName}" expected type ${schema.type}, got ${Array.isArray(value) ? "array" : typeof value}`,
        });
      }
    }

    return errors;
  }

  private matchesType(type: JsonSchemaField["type"], value: unknown): boolean {
    if (type === "null") return value === null;
    if (type === "array") return Array.isArray(value);
    if (type === "integer") return Number.isInteger(value);
    if (type === "object") return typeof value === "object" && value !== null && !Array.isArray(value);
    return typeof value === type;
  }

  static create(
    name: string,
    version: string,
    inputSchema: Record<string, JsonSchemaField>,
    outputSchema: Record<string, JsonSchemaField>,
    omega: ObjectiveWeightVector,
    constraints: string[] = []
  ): SemanticContract {
    return {
      id: generateId(),
      name,
      version,
      inputSchema,
      outputSchema,
      omega: assertObjectiveWeightVector(omega),
      constraints,
      createdAt: now(),
    };
  }
}
