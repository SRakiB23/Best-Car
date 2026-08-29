import "server-only";

import type { ZodType } from "zod";

import { aiConfig, geminiApiKey } from "./config";
import { AiError } from "./errors";

const endpoint = "https://generativelanguage.googleapis.com/v1beta/models";

/** The OpenAPI 3.0 subset Gemini accepts for `responseSchema`. */
export type ResponseSchema = {
  type: "object" | "array" | "string" | "number" | "integer" | "boolean";
  description?: string;
  nullable?: boolean;
  enum?: string[];
  format?: string;
  items?: ResponseSchema;
  properties?: Record<string, ResponseSchema>;
  required?: string[];
  propertyOrdering?: string[];
  minimum?: number;
  maximum?: number;
};

type GenerateOptions<T> = {
  system: string;
  prompt: string;
  responseSchema: ResponseSchema;
  /** Guards against a schema-compliant-but-nonsensical payload reaching our code. */
  validator: ZodType<T>;
  temperature?: number;
  signal?: AbortSignal;
  timeoutMs?: number;
  /**
   * Lower levels cut the hidden reasoning the model bills and waits for. Worth
   * it on a fixed classification, where a long deliberation buys nothing.
   */
  thinkingLevel?: "minimal" | "low" | "medium" | "high";
};

export type GenerateResult<T> = {
  data: T;
  model: string;
  latencyMs: number;
  usage: { promptTokens: number; responseTokens: number; totalTokens: number } | null;
};

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  error?: {
    message?: string;
    status?: string;
    details?: {
      "@type"?: string;
      retryDelay?: string;
      violations?: { quotaId?: string; quotaValue?: string }[];
    }[];
  };
};

export async function generateStructured<T>(
  options: GenerateOptions<T>,
): Promise<GenerateResult<T>> {
  const startedAt = Date.now();
  const model = aiConfig.model;
  let lastError: AiError | undefined;

  for (let attempt = 1; attempt <= aiConfig.maxAttempts; attempt += 1) {
    try {
      const payload = await callGemini(model, options);
      const text = readText(payload);

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (cause) {
        throw new AiError("AI_INVALID_OUTPUT", "Model returned non-JSON output", { cause });
      }

      const result = options.validator.safeParse(parsed);
      if (!result.success) {
        throw new AiError(
          "AI_INVALID_OUTPUT",
          `Model output failed validation: ${result.error.issues
            .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
            .join("; ")}`,
        );
      }

      return {
        data: result.data,
        model,
        latencyMs: Date.now() - startedAt,
        usage: payload.usageMetadata
          ? {
              promptTokens: payload.usageMetadata.promptTokenCount ?? 0,
              responseTokens: payload.usageMetadata.candidatesTokenCount ?? 0,
              totalTokens: payload.usageMetadata.totalTokenCount ?? 0,
            }
          : null,
      };
    } catch (error) {
      lastError = error instanceof AiError ? error : new AiError("AI_UPSTREAM", "Model call failed", { cause: error });

      if (attempt >= aiConfig.maxAttempts || !isRetryable(lastError)) throw lastError;

      // A 429 is a quota window, not a blip: 250ms lands inside the same window
      // and burns the only retry we have. Google tells us how long to wait.
      const backoff =
        lastError.code === "AI_RATE_LIMITED"
          ? Math.min(lastError.retryAfterMs ?? 2_000 * attempt, 10_000)
          : 250 * attempt;

      await sleep(backoff);
    }
  }

  throw lastError ?? new AiError("AI_UPSTREAM", "Model call failed");
}

async function callGemini<T>(model: string, options: GenerateOptions<T>) {
  const key = geminiApiKey();
  const timeoutMs = options.timeoutMs ?? aiConfig.timeoutMs;
  const timeout = AbortSignal.timeout(timeoutMs);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(`${endpoint}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: options.system }] },
        contents: [{ role: "user", parts: [{ text: options.prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: options.responseSchema,
          temperature: options.temperature ?? 0.2,
          ...(options.thinkingLevel
            ? { thinkingConfig: { thinkingLevel: options.thinkingLevel } }
            : {}),
        },
      }),
      signal,
      cache: "no-store",
    });
  } catch (cause) {
    if (timeout.aborted) {
      throw new AiError("AI_TIMEOUT", `Model call exceeded ${timeoutMs}ms`, { cause });
    }
    throw new AiError("AI_UPSTREAM", "Could not reach the model provider", { cause });
  }

  const payload = (await response.json().catch(() => null)) as GeminiResponse | null;

  if (!response.ok) {
    const detail = payload?.error?.message ?? response.statusText;

    if (response.status === 429) {
      // A per-day quota will not clear on a retry, and telling staff to "wait a
      // moment" when the answer is "tomorrow" wastes their time.
      const daily = quotaViolations(payload).some((id) => id.includes("PerDay"));

      throw new AiError(
        daily ? "AI_QUOTA_EXHAUSTED" : "AI_RATE_LIMITED",
        `Gemini 429: ${detail}`,
        { retryAfterMs: retryDelayMs(payload) },
      );
    }

    throw new AiError("AI_UPSTREAM", `Gemini ${response.status}: ${detail}`);
  }

  if (!payload) throw new AiError("AI_UPSTREAM", "Empty response from Gemini");

  return payload;
}

function quotaViolations(payload: GeminiResponse | null) {
  return (payload?.error?.details ?? []).flatMap((detail) =>
    (detail.violations ?? []).map((violation) => violation.quotaId ?? ""),
  );
}

/** `retryDelay` arrives as a protobuf duration string, e.g. "18s". */
function retryDelayMs(payload: GeminiResponse | null) {
  const raw = payload?.error?.details?.find((detail) => detail.retryDelay)?.retryDelay;
  const seconds = raw ? Number(raw.replace(/s$/, "")) : NaN;

  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds * 1_000) : undefined;
}

function readText(payload: GeminiResponse) {
  if (payload.promptFeedback?.blockReason) {
    throw new AiError(
      "AI_INVALID_OUTPUT",
      `Prompt blocked: ${payload.promptFeedback.blockReason}`,
    );
  }

  const candidate = payload.candidates?.[0];

  // MAX_TOKENS leaves truncated JSON behind, which is worth naming explicitly.
  if (candidate?.finishReason && !["STOP", "MAX_TOKENS"].includes(candidate.finishReason)) {
    throw new AiError("AI_INVALID_OUTPUT", `Generation stopped: ${candidate.finishReason}`);
  }

  const text = candidate?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";

  if (!text.trim()) throw new AiError("AI_INVALID_OUTPUT", "Model returned no content");

  return text;
}

function isRetryable(error: AiError) {
  return (
    error.code === "AI_UPSTREAM" ||
    error.code === "AI_RATE_LIMITED" ||
    error.code === "AI_INVALID_OUTPUT"
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
