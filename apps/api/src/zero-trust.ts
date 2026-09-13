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
  // Missing Origin is curl/server — not browser identity. Production requires
  // Origin unless Master explicitly allows missing-origin ops probes.
  if (!origin) {
    return !requiresBrowserOrigin();
  }
  return allowedBrowserOrigins().includes(origin);
}

/**
 * Production defaults to require Origin (browser CORS honesty).
 * Set JENNIFER_CORS_ALLOW_MISSING_ORIGIN=1 only for ops probes that cannot send Origin.
 * Set JENNIFER_CORS_REQUIRE_ORIGIN=1 to force the rule even in development.
 */
export function requiresBrowserOrigin(): boolean {
  const force = truthy(process.env.JENNIFER_CORS_REQUIRE_ORIGIN);
  if (force) return true;
  const allowMissing = truthy(process.env.JENNIFER_CORS_ALLOW_MISSING_ORIGIN);
  if (allowMissing) return false;
  return process.env.NODE_ENV?.trim().toLowerCase() === "production";
}

function truthy(value: string | undefined): boolean {
  const v = value?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
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
