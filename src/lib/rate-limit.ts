import "server-only";

/**
 * Sliding-window limiters for the paths that cost money on every call: model
 * requests, outbound webhooks and email.
 *
 * Deliberately in-memory and per-instance. That is good enough for one server
 * and worth swapping for Redis before scaling out — the counters do not survive
 * a restart and are not shared between instances, so treat every ceiling here
 * as "per instance" when sizing it.
 */

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

type LimiterOptions = {
  windowMs: number;
  /** How many requests one caller gets in a window. */
  maxPerKey: number;
  /**
   * How many requests everybody gets, combined. A per-caller limit only bounds
   * one attacker; this is what bounds the bill when a flood arrives from a
   * thousand addresses at once.
   */
  maxPerWindow: number;
  /**
   * Cap on distinct callers tracked at once. Every new address adds an entry,
   * so without a ceiling a distributed flood becomes a memory leak.
   */
  maxTrackedKeys?: number;
};

export function createRateLimiter(options: LimiterOptions) {
  const { windowMs, maxPerKey, maxPerWindow, maxTrackedKeys = 5_000 } = options;

  const hits = new Map<string, number[]>();
  const all: number[] = [];

  function check(key: string): RateLimitResult {
    const now = Date.now();

    prune(all, now, windowMs);

    if (all.length >= maxPerWindow) {
      return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter(all[0], now, windowMs) };
    }

    const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);

    if (recent.length >= maxPerKey) {
      hits.set(key, recent);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: retryAfter(recent[0], now, windowMs),
      };
    }

    // Counted only once the request is going through, so a caller already being
    // refused does not eat the shared budget on the way out.
    recent.push(now);
    all.push(now);
    hits.set(key, recent);

    if (hits.size > maxTrackedKeys) evict(hits, now, windowMs, maxTrackedKeys);

    return { allowed: true, remaining: maxPerKey - recent.length, retryAfterSeconds: 0 };
  }

  return { check };
}

function retryAfter(oldest: number, now: number, windowMs: number) {
  return Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
}

function prune(timestamps: number[], now: number, windowMs: number) {
  let stale = 0;
  while (stale < timestamps.length && now - timestamps[stale] >= windowMs) stale += 1;
  if (stale > 0) timestamps.splice(0, stale);
}

function evict(hits: Map<string, number[]>, now: number, windowMs: number, cap: number) {
  for (const [key, timestamps] of hits) {
    if (timestamps.every((at) => now - at >= windowMs)) hits.delete(key);
  }

  // Everything still inside the window: drop the least recently seen keys
  // rather than grow without bound. Losing a counter costs precision, and the
  // combined ceiling above is what actually caps the spend.
  if (hits.size > cap) {
    const byAge = [...hits.entries()].sort((a, b) => newest(a[1]) - newest(b[1]));
    for (const [key] of byAge.slice(0, hits.size - cap)) hits.delete(key);
  }
}

function newest(timestamps: number[]) {
  return timestamps[timestamps.length - 1] ?? 0;
}

const minute = 60_000;

/** Open to anyone, and two model calls per request. The tightest budget here. */
export const recommendLimiter = createRateLimiter({
  windowMs: minute,
  maxPerKey: 6,
  maxPerWindow: positiveInt(process.env.AI_MAX_REQUESTS_PER_MINUTE, 60),
});

/** Staff-only, so the per-caller limit does the work; the ceiling is a backstop. */
export const qualifyLeadLimiter = createRateLimiter({
  windowMs: minute,
  maxPerKey: 6,
  maxPerWindow: positiveInt(process.env.AI_MAX_LEAD_REQUESTS_PER_MINUTE, 30),
});

/** Open to visitors, and every inquiry fans out to the Zapier webhook. */
export const inquiryLimiter = createRateLimiter({
  windowMs: 10 * minute,
  maxPerKey: 5,
  maxPerWindow: positiveInt(process.env.INQUIRY_MAX_PER_10_MINUTES, 100),
});

/**
 * Password resets are checked twice, and the pair matters.
 *
 * By address, because the endpoint is open and every accepted request sends an
 * email we pay for. By address alone is not enough though: an attacker rotating
 * addresses could still fill one victim's inbox, so the same request is also
 * counted against the email it names.
 */
export const passwordResetIpLimiter = createRateLimiter({
  windowMs: 15 * minute,
  maxPerKey: 5,
  maxPerWindow: positiveInt(process.env.PASSWORD_RESET_MAX_PER_15_MINUTES, 60),
});

export const passwordResetEmailLimiter = createRateLimiter({
  windowMs: 15 * minute,
  maxPerKey: 3,
  // Shares the ceiling above in spirit; kept generous so it never fires first.
  maxPerWindow: 1_000,
});

/** Behind a shared secret already; this only bounds a leaked-secret flood. */
export const notificationLimiter = createRateLimiter({
  windowMs: minute,
  maxPerKey: 30,
  maxPerWindow: 60,
});

/**
 * Headers a platform sets itself, overwriting whatever the client sent. These
 * are the only ones that can be trusted as an identity.
 */
const trustedIpHeaders = ["x-vercel-forwarded-for", "cf-connecting-ip", "x-real-ip"];

/**
 * `X-Forwarded-For` is appended to by each hop, so the client controls the
 * left-hand entries and the proxy in front of us controls the right-hand one.
 * Reading the leftmost entry, as this used to, let a caller mint a fresh
 * identity per request and walk straight past the limit. Count in from the
 * right instead, by however many proxies actually sit in front of the app.
 */
const trustedProxyHops = positiveInt(process.env.TRUSTED_PROXY_HOPS, 1);

export function clientIp(headers: Headers) {
  for (const header of trustedIpHeaders) {
    const value = headers.get(header)?.split(",")[0]?.trim();
    if (value) return value;
  }

  const chain = headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (chain?.length) {
    return chain[Math.max(0, chain.length - trustedProxyHops)] ?? chain[chain.length - 1];
  }

  // No usable address. Everything unattributable shares one bucket, which is
  // strict rather than permissive — the alternative is a free pass.
  return "unknown";
}

function positiveInt(raw: string | undefined, fallback: number) {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}
