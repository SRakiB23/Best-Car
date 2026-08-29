import "server-only";

import { timingSafeEqual } from "node:crypto";

/**
 * Every value is read at call time rather than module load, so a missing one
 * surfaces as a handled 503 on the request instead of crashing the server on
 * boot. None of these are ever prefixed with NEXT_PUBLIC_, so none of them can
 * reach the browser bundle.
 */
export function notificationConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();

  // Resend's shared sender works without a verified domain, which keeps local
  // testing possible. Override it in production with your own domain.
  const from = process.env.RESEND_FROM_EMAIL?.trim() || "Best Car <onboarding@resend.dev>";

  const missing = [
    ["RESEND_API_KEY", apiKey],
    ["ADMIN_NOTIFICATION_EMAIL", to],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name as string);

  return { apiKey, to, from, missing };
}

/**
 * Compared in constant time. A plain `===` leaks the shared secret one byte at a
 * time to anyone who can measure the response, and this endpoint sends mail.
 */
export function secretMatches(provided: string) {
  const expected = process.env.LEAD_NOTIFICATION_SECRET?.trim();

  // An unset secret must never mean "everything is allowed".
  if (!expected) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export function isNotificationSecretConfigured() {
  return Boolean(process.env.LEAD_NOTIFICATION_SECRET?.trim());
}

/** Extracts the token from `Authorization: Bearer <token>`. */
export function bearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, ...rest] = header.split(" ");

  if (scheme?.toLowerCase() !== "bearer") return null;

  const token = rest.join(" ").trim();
  return token || null;
}
