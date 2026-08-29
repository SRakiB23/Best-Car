import "server-only";

import { after } from "next/server";

import { aiConfig } from "@/lib/ai/config";
import { AiError } from "@/lib/ai/errors";
import { generateStructured } from "@/lib/ai/gemini";
import { groundQualification } from "@/lib/ai/lead-grounding";
import {
  leadAiFeature,
  leadQualificationResponseSchema,
  leadQualificationSchema,
  leadQualificationSystemPrompt,
  type LeadQualification,
  type QualifyLeadResult,
} from "@/lib/ai/lead-qualification";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient, type Db } from "@/lib/supabase/service";
import { sendQualifiedLeadToZapier } from "@/lib/zapier";
import { logAiInteraction } from "./interactions";

type LeadRecord = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  source: string;
  createdAt: string;
  vehicleName: string | null;
  vehicleCategory: string | null;
  pickupDate: string | null;
  returnDate: string | null;
};

export type QualifyLeadOptions = {
  /**
   * Privileged client for the automatic path, where no staff session exists.
   * Absent for the Qualify button, which runs as the signed-in staff user and is
   * checked by the database as before.
   */
  db?: Db;
  /**
   * Who to attribute the model call to in the audit log. The log is written with
   * the secret key, so `auth.uid()` is null and the id has to be passed in.
   * Absent on the automatic path, which nobody triggered.
   */
  staffId?: string;
};

export async function qualifyLead(
  leadId: string,
  options: QualifyLeadOptions = {},
): Promise<QualifyLeadResult> {
  const startedAt = Date.now();
  const db = options.db;
  const lead = await loadLead(leadId, db);

  const generated = await generateStructured({
    system: leadQualificationSystemPrompt,
    prompt: buildPrompt(lead),
    responseSchema: leadQualificationResponseSchema,
    validator: leadQualificationSchema,
    // Classification should be reproducible; a warmer setting only makes the
    // same lead score differently on a second run.
    temperature: 0,
    timeoutMs: aiConfig.leadTimeoutMs,
    thinkingLevel: "low",
  });

  const { value, adjustments } = groundQualification(generated.data, {
    message: lead.message,
    phone: lead.customerPhone,
  });

  const latencyMs = Date.now() - startedAt;

  // Logged before the update so a write failure still leaves a record of the
  // call we paid for, and so the lead row can point at the interaction.
  const interactionId = await logAiInteraction(
    {
      feature: leadAiFeature,
      model: generated.model,
      request: {
        leadId: lead.id,
        message: lead.message,
        hasPhone: Boolean(lead.customerPhone),
        vehicleName: lead.vehicleName,
        source: lead.source,
      } as Json,
      response: {
        raw: generated.data as unknown as Json,
        grounded: value as unknown as Json,
        adjustments,
        usage: generated.usage,
      } as Json,
      latencyMs,
      userId: options.staffId,
    },
    db,
  );

  const qualifiedAt = await applyQualification(
    lead.id,
    value,
    generated.model,
    interactionId,
    db,
  );

  // The result is saved, so the alert runs after the response is sent: a slow or
  // broken webhook must not make a successful qualification look like a failure.
  after(async () => {
    await sendQualifiedLeadToZapier({
      event: "lead_qualified",
      lead_id: lead.id,
      customer_name: lead.customerName,
      customer_email: lead.customerEmail,
      customer_phone: lead.customerPhone,
      vehicle: lead.vehicleName,
      pickup_date: lead.pickupDate,
      return_date: lead.returnDate,
      message: lead.message,
      lead_score: value.leadScore,
      priority: value.priority,
      urgency: value.urgency,
      intent: value.intent,
      estimated_budget_amount: value.estimatedBudgetAmount,
      estimated_budget_period: value.estimatedBudgetPeriod,
      rental_duration:
        value.rentalDurationLabel ??
        (value.rentalDurationDays === null
          ? null
          : `${value.rentalDurationDays} ${value.rentalDurationDays === 1 ? "day" : "days"}`),
      vehicle_preference: value.vehiclePreference ?? value.vehiclePreferenceCategory,
      summary: value.summary,
      recommended_action: value.recommendedAction,
      // Flattened to a string: Zapier renders a raw array poorly inside an email
      // body, and this field exists to be read by a person.
      missing_information: value.missingInformation.join(", "),
      model: generated.model,
      qualified_at: qualifiedAt,
      admin_url: `${appUrl()}/admin/leads`,
    });
  });

  return {
    leadId: lead.id,
    interactionId,
    model: generated.model,
    qualifiedAt,
    qualification: {
      leadScore: value.leadScore,
      priority: value.priority,
      intent: value.intent,
      estimatedBudget:
        value.estimatedBudgetAmount === null
          ? null
          : {
              amount: value.estimatedBudgetAmount,
              currency: "USD",
              period: value.estimatedBudgetPeriod,
            },
      rentalDuration:
        value.rentalDurationDays === null && value.rentalDurationLabel === null
          ? null
          : { days: value.rentalDurationDays, label: value.rentalDurationLabel },
      vehiclePreference:
        value.vehiclePreference === null && value.vehiclePreferenceCategory === null
          ? null
          : {
              category: value.vehiclePreferenceCategory,
              description: value.vehiclePreference,
            },
      urgency: value.urgency,
      summary: value.summary,
      recommendedAction: value.recommendedAction,
      missingInformation: value.missingInformation,
    },
    adjustments,
  };
}

/**
 * Qualifies a lead the moment it arrives, with no human in the loop. A score that
 * waits for someone to open the admin panel is not urgency, so the automatic path
 * exists to make the alert worth reading the second it lands.
 *
 * Never throws: it runs after the visitor's response has already been sent, and a
 * model outage must leave a saved lead looking exactly like a saved lead. The
 * Qualify button remains as the manual retry.
 */
export async function autoQualifyLead(leadId: string) {
  try {
    const db = createServiceClient();

    // A retry of the surrounding callback must not pay for a second model call,
    // and must not reset a score staff may already have acted on.
    const { data } = await db.from("leads").select("qualified_at").eq("id", leadId).maybeSingle();

    if (data?.qualified_at) {
      console.log("lead already qualified; skipping auto-qualification", `lead=${leadId}`);
      return;
    }

    const result = await qualifyLead(leadId, { db });

    console.log(
      "auto-qualified lead",
      `lead=${leadId}`,
      `score=${result.qualification.leadScore}`,
      `priority=${result.qualification.priority}`,
    );
  } catch (error) {
    // Logged loudly: the lead is safe, but nobody has been alerted about it.
    console.error(
      "auto-qualification failed; lead needs the manual Qualify button",
      `lead=${leadId}`,
      error instanceof Error ? error.message : error,
    );
  }
}

/**
 * Only used to build a link for the alert email. Falls back to the dev origin so
 * a missing variable costs a useful link, not the notification.
 */
function appUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

async function loadLead(leadId: string, db?: Db): Promise<LeadRecord> {
  const supabase = db ?? (await createClient());

  const { data, error } = await supabase
    .from("lead_list")
    .select(
      "id, customer_name, customer_email, customer_phone, message, source, created_at, vehicle_name, vehicle_category, pickup_date, return_date",
    )
    .eq("id", leadId)
    .maybeSingle();

  if (error) {
    throw new AiError("AI_UPSTREAM", `Could not read lead: ${error.message}`);
  }

  // The view is behind row level security, so a lead this account cannot see is
  // indistinguishable from one that does not exist. That is the right answer.
  if (!data) {
    throw new AiError("LEAD_NOT_FOUND", `No readable lead with id ${leadId}`);
  }

  return {
    id: data.id!,
    customerName: data.customer_name ?? "",
    customerEmail: data.customer_email ?? "",
    customerPhone: data.customer_phone ?? "",
    message: data.message ?? "",
    source: data.source ?? "website",
    createdAt: data.created_at!,
    vehicleName: data.vehicle_name,
    vehicleCategory: data.vehicle_category,
    pickupDate: data.pickup_date,
    returnDate: data.return_date,
  };
}

async function applyQualification(
  leadId: string,
  value: LeadQualification,
  model: string,
  interactionId: string | null,
  db?: Db,
) {
  const supabase = db ?? (await createClient());

  // The internal variant skips the staff check and is executable by the secret
  // key alone. Staff keep going through the guarded entry point.
  const fn = db ? "apply_lead_qualification_internal" : "apply_lead_qualification";

  const { error } = await supabase.rpc(fn, {
    p_lead_id: leadId,
    p_result: value as unknown as Json,
    p_model: model,
    p_interaction_id: interactionId ?? undefined,
  });

  if (error) {
    if (error.message.includes("FORBIDDEN")) {
      throw new AiError("FORBIDDEN", "apply_lead_qualification rejected a non-staff caller");
    }
    if (error.message.includes("LEAD_NOT_FOUND")) {
      throw new AiError("LEAD_NOT_FOUND", `Lead ${leadId} disappeared before the update`);
    }
    throw new AiError("AI_UPSTREAM", `Could not save qualification: ${error.message}`);
  }

  return new Date().toISOString();
}

/**
 * Only the inquiry itself and facts we hold on the record. Nothing is summarised
 * or filled in here, so anything the model cannot see is genuinely absent rather
 * than something we quietly supplied.
 */
function buildPrompt(lead: LeadRecord) {
  const context = [
    `Received: ${lead.createdAt.slice(0, 10)} (today is ${new Date().toISOString().slice(0, 10)})`,
    `Channel: ${lead.source}`,
    // Dates the customer picked in the form. Stated as a fact we hold rather
    // than left in the message, so the model treats them as given, not inferred.
    lead.pickupDate
      ? `Dates chosen in the form: pick-up ${lead.pickupDate}${
          lead.returnDate ? `, return ${lead.returnDate}` : ", no return date given"
        }`
      : "No dates chosen in the form — treat their dates as unknown unless the message states them",
    `Phone number on file: ${lead.customerPhone ? "yes" : "no — treat their phone number as unknown"}`,
    lead.vehicleName
      ? `Inquiry was sent from the page for: ${lead.vehicleName}${lead.vehicleCategory ? ` (${lead.vehicleCategory})` : ""}`
      : "Not sent from a specific vehicle page",
  ];

  return [
    `Customer name: ${lead.customerName}`,
    "",
    "Inquiry:",
    quoteBlock(lead.message),
    "",
    "What we know from our own records:",
    context.map((line) => `- ${line}`).join("\n"),
  ].join("\n");
}

/** Fences the untrusted message so it reads as data rather than instructions. */
function quoteBlock(text: string) {
  return ["<customer_inquiry>", text.replaceAll("<", "‹"), "</customer_inquiry>"].join("\n");
}
