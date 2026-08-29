export type AiErrorCode =
  | "AI_NOT_CONFIGURED"
  | "AI_TIMEOUT"
  | "AI_UPSTREAM"
  | "AI_INVALID_OUTPUT"
  | "AI_RATE_LIMITED"
  | "INVALID_REQUEST"
  | "NO_CANDIDATES";

/** Carries the HTTP status and the customer-safe copy alongside the internal message. */
export class AiError extends Error {
  readonly code: AiErrorCode;
  readonly status: number;

  constructor(code: AiErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AiError";
    this.code = code;
    this.status = aiErrorStatus[code];
  }
}

const aiErrorStatus: Record<AiErrorCode, number> = {
  AI_NOT_CONFIGURED: 503,
  AI_TIMEOUT: 504,
  AI_UPSTREAM: 502,
  AI_INVALID_OUTPUT: 502,
  AI_RATE_LIMITED: 429,
  INVALID_REQUEST: 400,
  NO_CANDIDATES: 200,
};

export const aiErrorMessages: Record<AiErrorCode, string> = {
  AI_NOT_CONFIGURED: "The recommendation assistant is not available right now.",
  AI_TIMEOUT: "The assistant took too long to answer. Please try again.",
  AI_UPSTREAM: "The assistant is temporarily unavailable. Please try again in a moment.",
  AI_INVALID_OUTPUT: "We could not read the assistant's answer. Please try again.",
  AI_RATE_LIMITED: "Too many requests. Please wait a moment before trying again.",
  INVALID_REQUEST: "Please describe the trip you have in mind.",
  NO_CANDIDATES: "No cars in our fleet match those requirements.",
};

export function toAiError(error: unknown): AiError {
  if (error instanceof AiError) return error;
  if (error instanceof Error && error.name === "AbortError") {
    return new AiError("AI_TIMEOUT", "Model request aborted", { cause: error });
  }
  return new AiError("AI_UPSTREAM", "Unexpected assistant failure", { cause: error });
}
