import "server-only";

import { AiError } from "./errors";

export const aiConfig = {
  provider: "google" as const,
  /** Flash is fast and cheap enough to sit in front of a booking form. */
  model: process.env.GEMINI_MODEL ?? "gemini-3.6-flash",
  timeoutMs: positiveInt(process.env.AI_TIMEOUT_MS, 20_000),
  /**
   * Staff qualifying a lead can wait; a customer watching a spinner cannot. The
   * model is a thinking model and its latency swings widely for the same prompt,
   * so the dashboard path gets a budget that survives a slow draw.
   */
  leadTimeoutMs: positiveInt(process.env.AI_LEAD_TIMEOUT_MS, 45_000),
  /** One retry only: the customer is watching a spinner. */
  maxAttempts: 2,
  maxPromptChars: 1_000,
  /** Rows pulled from the database before deterministic scoring narrows them. */
  candidatePool: 60,
  /** How many scored candidates the model actually sees. */
  shortlist: 6,
};

function positiveInt(raw: string | undefined, fallback: number) {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

/**
 * Read at call time rather than module load so a missing key surfaces as a
 * handled 503 instead of crashing the server on boot.
 */
export function geminiApiKey() {
  const key = process.env.GEMINI_API_KEY?.trim();

  if (!key) {
    throw new AiError("AI_NOT_CONFIGURED", "GEMINI_API_KEY is not set");
  }

  return key;
}

export function isAiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
