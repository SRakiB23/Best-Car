import { aiConfig, isAiConfigured } from "@/lib/ai/config";
import { AiError, leadErrorMessages, toAiError } from "@/lib/ai/errors";
import { leadAiFeature, qualifyLeadRequestSchema } from "@/lib/ai/lead-qualification";
import { qualifyLeadLimiter } from "@/lib/rate-limit";
import { currentViewer } from "@/lib/auth";
import { logAiInteraction } from "@/services/ai/interactions";
import { qualifyLead } from "@/services/ai/leads";

/** The Gemini key must never reach the browser, so this stays on the server. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Leads hold customer contact details and this endpoint spends money, so the
  // caller is checked before anything else is read.
  const viewer = await currentViewer();
  if (!viewer?.isStaff) {
    return fail(new AiError("FORBIDDEN", "Only staff may qualify leads"));
  }

  if (!isAiConfigured()) {
    return fail(new AiError("AI_NOT_CONFIGURED", "GEMINI_API_KEY is not set"));
  }

  const limit = qualifyLeadLimiter.check(viewer.id);
  if (!limit.allowed) {
    return fail(new AiError("AI_RATE_LIMITED", "Rate limit exceeded"), {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(new AiError("INVALID_REQUEST", "Body is not valid JSON"));
  }

  const parsed = qualifyLeadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: parsed.error.issues[0]?.message ?? leadErrorMessages.INVALID_REQUEST,
          fields: Object.fromEntries(
            parsed.error.issues.map((issue) => [issue.path.join(".") || "body", issue.message]),
          ),
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await qualifyLead(parsed.data.leadId, { staffId: viewer.id });
    return Response.json(result, { status: 200 });
  } catch (error) {
    const aiError = toAiError(error);

    // A lead that cannot be found is a client mistake, not a model failure, and
    // logging it as one would pollute the audit trail.
    if (aiError.code !== "LEAD_NOT_FOUND" && aiError.code !== "FORBIDDEN") {
      await logAiInteraction({
        feature: leadAiFeature,
        model: aiConfig.model,
        request: { leadId: parsed.data.leadId },
        status: "error",
        error: `${aiError.code}: ${aiError.message}`,
        userId: viewer.id,
      });
    }

    console.error("ai/qualify-lead failed", aiError.code, aiError.message, aiError.cause ?? "");

    return fail(aiError);
  }
}

/** Returns the staff-facing copy; the internal message stays in the server log. */
function fail(error: AiError, headers?: Record<string, string>) {
  return Response.json(
    { error: { code: error.code, message: leadErrorMessages[error.code] } },
    { status: error.status === 200 ? 500 : error.status, headers },
  );
}
