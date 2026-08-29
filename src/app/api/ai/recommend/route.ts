import { isAiConfigured } from "@/lib/ai/config";
import { AiError, aiErrorMessages, toAiError } from "@/lib/ai/errors";
import { checkRateLimit, rateLimitKey } from "@/lib/ai/rate-limit";
import { aiFeature, recommendRequestSchema } from "@/lib/ai/recommendation";
import { logAiInteraction } from "@/services/ai/interactions";
import { recommendVehicles } from "@/services/ai/recommend";

/** The Gemini key must never reach the browser, so this stays on the server. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAiConfigured()) {
    return fail(new AiError("AI_NOT_CONFIGURED", "GEMINI_API_KEY is not set"));
  }

  const limit = checkRateLimit(rateLimitKey(request));
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

  const parsed = recommendRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: parsed.error.issues[0]?.message ?? aiErrorMessages.INVALID_REQUEST,
          fields: Object.fromEntries(
            parsed.error.issues.map((issue) => [issue.path.join(".") || "body", issue.message]),
          ),
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await recommendVehicles(parsed.data);
    return Response.json(result, { status: 200 });
  } catch (error) {
    const aiError = toAiError(error);

    // Failures are the interesting rows in the audit log, so record them too.
    await logAiInteraction({
      feature: aiFeature,
      model: process.env.GEMINI_MODEL ?? "gemini-3.6-flash",
      request: { prompt: parsed.data.prompt },
      status: "error",
      error: `${aiError.code}: ${aiError.message}`,
    });

    console.error("ai/recommend failed", aiError.code, aiError.message, aiError.cause ?? "");

    return fail(aiError);
  }
}

/** Returns the customer-safe copy; the internal message stays in the server log. */
function fail(error: AiError, headers?: Record<string, string>) {
  return Response.json(
    { error: { code: error.code, message: aiErrorMessages[error.code] } },
    { status: error.status === 200 ? 500 : error.status, headers },
  );
}
