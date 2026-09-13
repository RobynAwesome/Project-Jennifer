const DEFAULT_ORIGINS = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
];

const ACTOR_ID = /^[A-Za-z0-9._:-]{1,64}$/;

export function allowedBrowserOrigins(): string[] {
  const configured = process.env.JENNIFER_CORS_ORIGINS?.trim();
  if (!configured) {
    if (process.env.NODE_ENV?.trim().toLowerCase() === "production") {
      return [];
    }
    return DEFAULT_ORIGINS;
  }
  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export function isAllowedBrowserOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  return allowedBrowserOrigins().includes(origin);
}

export function parseTrustedActorId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return ACTOR_ID.test(trimmed) ? trimmed : null;
}

/**
 * In-memory visit throttle. Not identity. Not a ban list.
 */
export class VisitRateGate {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly windowMs = 60_000,
    private readonly maxHits = 20,
  ) {}

  allow(actorId: string, now = Date.now()): boolean {
    const recent = (this.hits.get(actorId) ?? []).filter(
      (stamp) => now - stamp < this.windowMs,
    );
    if (recent.length >= this.maxHits) {
      this.hits.set(actorId, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(actorId, recent);
    return true;
  }
}
