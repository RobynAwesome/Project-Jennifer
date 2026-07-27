import { ID } from "./types.js";

/**
 * Generates a URL-safe UUID v4 identifier.
 */
export function generateId(): ID {
  return crypto.randomUUID();
}

/**
 * Returns the current Unix epoch in milliseconds.
 */
export function now(): number {
  return Date.now();
}

/**
 * Clamps a numeric value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Deep-clones a JSON-serializable value.
 */
export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Returns true if the provided timestamp has expired.
 */
export function isExpired(timestamp: number | undefined): boolean {
  if (timestamp === undefined) return false;
  return Date.now() > timestamp;
}

/**
 * Converts a snake_case string to camelCase.
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/**
 * Simple exponential back-off retry helper.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 100 } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Retry limit exceeded");
}

/**
 * Structured result type — avoids throwing for domain errors.
 */
export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { success: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}
