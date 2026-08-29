import "server-only";

import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import type { Db } from "@/lib/supabase/service";

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
};

/**
 * Best-effort audit write. A failure here must never turn a good recommendation
 * into an error for the customer, so it is logged and swallowed.
 */
export async function logAiInteraction(
  interaction: AiInteraction,
  /** Passed by the automatic path, which has no user session to log under. */
  db?: Db,
): Promise<string | null> {
  try {
    const supabase = db ?? (await createClient());

    const { data, error } = await supabase.rpc("log_ai_interaction", {
      p_feature: interaction.feature,
      p_model: interaction.model,
      p_request: interaction.request,
      p_response: interaction.response ?? undefined,
      p_status: interaction.status ?? "success",
      p_error: interaction.error ?? undefined,
      p_latency_ms: interaction.latencyMs ?? undefined,
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
