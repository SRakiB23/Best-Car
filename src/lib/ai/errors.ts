export type AiErrorCode =
  | "AI_NOT_CONFIGURED"
  | "AI_TIMEOUT"
  | "AI_UPSTREAM"
  | "AI_INVALID_OUTPUT"
  | "AI_RATE_LIMITED"
  | "AI_QUOTA_EXHAUSTED"
  | "INVALID_REQUEST"
  | "NO_CANDIDATES"
  | "FORBIDDEN"
  | "LEAD_NOT_FOUND";

/** Carries the HTTP status and the customer-safe copy alongside the internal message. */
export class AiError extends Error {
  readonly code: AiErrorCode;
  readonly status: number;
  /** How long the provider asked us to wait, when it says so. */
  readonly retryAfterMs?: number;

  constructor(
    code: AiErrorCode,
    message: string,
    options?: { cause?: unknown; retryAfterMs?: number },
  ) {
    super(message, options);
    this.name = "AiError";
    this.code = code;
    this.status = aiErrorStatus[code];
    this.retryAfterMs = options?.retryAfterMs;
  }
}

const aiErrorStatus: Record<AiErrorCode, number> = {
  AI_NOT_CONFIGURED: 503,
  AI_TIMEOUT: 504,
  AI_UPSTREAM: 502,
  AI_INVALID_OUTPUT: 502,
  AI_RATE_LIMITED: 429,
  AI_QUOTA_EXHAUSTED: 429,
  INVALID_REQUEST: 400,
  NO_CANDIDATES: 200,
  FORBIDDEN: 403,
  LEAD_NOT_FOUND: 404,
};

export const aiErrorMessages: Record<AiErrorCode, string> = {
  AI_NOT_CONFIGURED: "The recommendation assistant is not available right now.",
  AI_TIMEOUT: "The assistant took too long to answer. Please try again.",
  AI_UPSTREAM: "The assistant is temporarily unavailable. Please try again in a moment.",
  AI_INVALID_OUTPUT: "We could not read the assistant's answer. Please try again.",
  AI_RATE_LIMITED: "Too many requests. Please wait a moment before trying again.",
  AI_QUOTA_EXHAUSTED: "The assistant has reached its usage limit for today.",
  INVALID_REQUEST: "Please describe the trip you have in mind.",
  NO_CANDIDATES: "No cars in our fleet match those requirements.",
  FORBIDDEN: "You do not have permission to do that.",
  LEAD_NOT_FOUND: "That record no longer exists.",
};

/**
 * The copy above is written for a customer waiting on a recommendation. Staff
 * qualifying a lead need the same codes phrased for a dashboard.
 */
export const leadErrorMessages: Record<AiErrorCode, string> = {
  ...aiErrorMessages,
  AI_NOT_CONFIGURED: "Lead qualification is not configured on this server.",
  AI_TIMEOUT: "The model took too long to respond. Try qualifying this lead again.",
  AI_UPSTREAM: "The model is temporarily unavailable. Try again in a moment.",
  AI_INVALID_OUTPUT: "The model returned an unusable result. Try again.",
  AI_QUOTA_EXHAUSTED:
    "The daily model quota for this project is used up. Qualification will work again tomorrow, or on a key with a higher limit.",
  INVALID_REQUEST: "That lead could not be qualified.",
  NO_CANDIDATES: "That lead could not be qualified.",
  FORBIDDEN: "Only staff accounts can qualify leads.",
  LEAD_NOT_FOUND: "That lead no longer exists.",
};

export function toAiError(error: unknown): AiError {
  if (error instanceof AiError) return error;
  if (error instanceof Error && error.name === "AbortError") {
    return new AiError("AI_TIMEOUT", "Model request aborted", { cause: error });
  }
  return new AiError("AI_UPSTREAM", "Unexpected assistant failure", { cause: error });
}
