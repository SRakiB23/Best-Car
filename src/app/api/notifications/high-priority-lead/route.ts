import {
  bearerToken,
  isNotificationSecretConfigured,
  secretMatches,
} from "@/lib/notifications/config";
import { leadAlertSchema } from "@/lib/notifications/lead-alert";
import { sendLeadAlert } from "@/lib/notifications/send-lead-alert";
import { clientIp, notificationLimiter } from "@/lib/rate-limit";

/** The Resend key must never reach the browser, so this stays on the server. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Called by Zapier, not by a browser. Zapier holds the shared secret and
 * forwards the qualified-lead payload here; this endpoint owns the email so the
 * template lives in the codebase under review rather than in a Zap editor.
 */
export async function POST(request: Request) {
  // Checked before the body is read: an unauthorised caller should not be able
  // to make us parse arbitrary input, and this endpoint sends mail.
  if (!isNotificationSecretConfigured()) {
    console.error("LEAD_NOTIFICATION_SECRET is not set; rejecting lead alert request");
    return fail(503, "NOT_CONFIGURED", "Notifications are not configured on this server.");
  }

  const token = bearerToken(request);

  if (!token || !secretMatches(token)) {
    // Deliberately vague, and the token is never logged.
    console.warn("rejected unauthorised lead alert request");
    return fail(401, "UNAUTHORIZED", "Missing or invalid credentials.");
  }

  // Applied after the secret check so an unauthorised flood cannot exhaust the
  // budget for Zapier. This bounds what a leaked secret is worth: mail costs
  // money and a mailbox full of alerts is its own outage.
  const limit = notificationLimiter.check(clientIp(request.headers));

  if (!limit.allowed) {
    return Response.json(
      { success: false, error: { code: "RATE_LIMITED", message: "Too many alert requests." } },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "INVALID_REQUEST", "Body is not valid JSON.");
  }

  const parsed = leadAlertSchema.safeParse(body);

  if (!parsed.success) {
    // Field-level detail so a Zap misconfiguration is debuggable from the run log.
    const fields = Object.fromEntries(
      parsed.error.issues.map((issue) => [issue.path.join(".") || "body", issue.message]),
    );

    console.error("lead alert payload rejected", JSON.stringify(fields));

    return Response.json(
      { success: false, error: { code: "INVALID_PAYLOAD", message: "Payload failed validation.", fields } },
      { status: 422 },
    );
  }

  const result = await sendLeadAlert(parsed.data);

  if (!result.ok) {
    return fail(result.status, result.code, result.message);
  }

  return Response.json({ success: true, messageId: result.messageId }, { status: 200 });
}

function fail(status: number, code: string, message: string) {
  return Response.json({ success: false, error: { code, message } }, { status });
}
