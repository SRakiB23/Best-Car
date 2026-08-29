import "server-only";

/**
 * Per-instance sliding window. Model calls cost money and this endpoint is
 * unauthenticated, so it needs *some* ceiling. It is deliberately in-memory:
 * good enough for one server, and worth swapping for Redis before scaling out.
 */
const hits = new Map<string, number[]>();

const windowMs = 60_000;
const maxPerWindow = 6;
const maxTrackedKeys = 5_000;

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);

  if (recent.length >= maxPerWindow) {
    hits.set(key, recent);
    const retryAfterSeconds = Math.ceil((windowMs - (now - recent[0])) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > maxTrackedKeys) evictStale(now);

  return { allowed: true, remaining: maxPerWindow - recent.length, retryAfterSeconds: 0 };
}

function evictStale(now: number) {
  for (const [key, timestamps] of hits) {
    if (timestamps.every((at) => now - at >= windowMs)) hits.delete(key);
  }
}

export function rateLimitKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}
