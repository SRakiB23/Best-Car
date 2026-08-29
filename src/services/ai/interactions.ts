import "server-only";

import type { Json } from "@/lib/supabase/database.types";
import { createServiceClient } from "@/lib/supabase/service";

/** Mirrors the feature whitelist inside log_ai_interaction. */
export type AiFeature = "vehicle_recommendation" | "lead_qualification";

export type AiInteraction = {
  feature: AiFeature;
  model: string;
  request: Json;
  response?: Json | null;
  status?: "success" | "error";
  error?: string | null;
  latencyMs?: number | null;
  /** Who the call belonged to. Absent for a visitor with no account. */
  userId?: string | null;
};

/**
 * Best-effort audit write. A failure here must never turn a good recommendation
 * into an error for the customer, so it is logged and swallowed.
 *
 * Written with the secret key rather than the caller's session: the storefront
 * advisor is open to visitors, and granting anonymous callers a write path into
 * the audit table let anyone holding the publishable key forge rows in it.
 */
export async function logAiInteraction(interaction: AiInteraction): Promise<string | null> {
  try {
    const supabase = createServiceClient();

    if (!supabase) {
      console.error("log_ai_interaction skipped: SUPABASE_SECRET_KEY is not set");
      return null;
    }

    const { data, error } = await supabase.rpc("log_ai_interaction", {
      p_feature: interaction.feature,
      p_model: interaction.model,
      p_request: interaction.request,
      p_response: interaction.response ?? undefined,
      p_status: interaction.status ?? "success",
      p_error: interaction.error ?? undefined,
      p_latency_ms: interaction.latencyMs ?? undefined,
      p_user_id: interaction.userId ?? undefined,
    });

    if (error) {
      console.error("log_ai_interaction failed", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("log_ai_interaction threw", error);
    return null;
  }
}
