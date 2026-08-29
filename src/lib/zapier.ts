import "server-only";

/**
 * Outbound notifications for the lead pipeline. Field names are snake_case and
 * flat because they become the column names a Zap maps onto, and renaming one
 * later silently breaks whatever was built on top of it.
 *
 * Both events go to the same webhook, so every payload carries `event`. A Zap
 * that must react to only one of them filters on that field.
 */
type LeadWebhookBase = {
  lead_id: string;
  customer_name: string;
  customer_email: string;
  /**
   * On both events deliberately. A field that appears on only one of them is a
   * field a Zap can be configured against a sample that does not contain it, and
   * the mapping then stays silently blank for every run.
   */
  customer_phone: string;
  vehicle: string | null;
  pickup_date: string | null;
  return_date: string | null;
};

export type LeadCreatedPayload = LeadWebhookBase & {
  event: "lead_created";
  message: string;
};

/** Sent once the model has scored the lead and the result is saved. */
export type LeadQualifiedPayload = LeadWebhookBase & {
  event: "lead_qualified";
  message: string;
  lead_score: number;
  priority: string;
  urgency: string;
  intent: string;
  estimated_budget_amount: number | null;
  estimated_budget_period: string;
  rental_duration: string | null;
  vehicle_preference: string | null;
  summary: string;
  recommended_action: string;
  missing_information: string;
  model: string;
  qualified_at: string;
  admin_url: string;
};

const timeoutMs = 5_000;

export function sendLeadToZapier(payload: LeadCreatedPayload) {
  return post(payload, payload.lead_id);
}

export function sendQualifiedLeadToZapier(payload: LeadQualifiedPayload) {
  return post(payload, payload.lead_id);
}

/**
 * Fire-and-forget by contract: the lead is already saved by the time this runs,
 * so a Zapier outage must never reach the visitor or the staff member. Every
 * failure is swallowed and logged, and this function is never allowed to throw.
 */
async function post(payload: LeadCreatedPayload | LeadQualifiedPayload, leadId: string) {
  const url = process.env.ZAPIER_WEBHOOK_URL?.trim();

  // The integration is optional. Without a URL there is nothing to report, and
  // that is not an error worth logging on every inquiry.
  if (!url) return;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "zapier webhook rejected",
        payload.event,
        response.status,
        `lead=${leadId}`,
        (await response.text().catch(() => "")).slice(0, 200),
      );
    }
  } catch (error) {
    console.error(
      "zapier webhook failed",
      payload.event,
      `lead=${leadId}`,
      error instanceof Error ? error.message : error,
    );
  }
}
