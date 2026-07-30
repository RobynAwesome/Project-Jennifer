import type { FrameworkDefinition } from "./FrameworkDefinition.js";

export class FrameworkRegistry {
  private readonly frameworks = new Map<string, FrameworkDefinition>();

  register(definition: FrameworkDefinition): void {
    this.frameworks.set(definition.frameworkName, definition);
  }

  get(frameworkName: string): FrameworkDefinition | undefined {
    return this.frameworks.get(frameworkName);
  }

  list(): FrameworkDefinition[] {
    return Array.from(this.frameworks.values());
  }
}
