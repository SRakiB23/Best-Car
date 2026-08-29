"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { autoQualifyLead } from "@/services/ai/leads";
import type { FormState } from "./form-state";
import { clientIp, inquiryLimiter } from "./rate-limit";
import { createClient } from "./supabase/server";
import { sendLeadToZapier } from "./zapier";

export type InquiryState =
  | { status: "idle" }
  | { status: "error"; errors?: Record<string, string>; message?: string }
  | { status: "success" };

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const messages: Record<string, string> = {
  INVALID_NAME: "Please tell us your name.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_PHONE: "That phone number does not look right.",
  INVALID_MESSAGE: "Please describe what you need in a little more detail.",
  INVALID_DATES: "Please check those dates — the return cannot be before the pick-up.",
  MISSING_DATES: "Please tell us your pick-up and return dates.",
  MISSING_PHONE: "Please add a phone number so we can reach you.",
  TOO_MANY_INQUIRIES: "We already have your recent messages. We will be in touch shortly.",
};

function inquiryErrorMessage(raw: string) {
  for (const [code, message] of Object.entries(messages)) {
    if (raw.includes(code)) return message;
  }
  return "We could not send your inquiry. Please try again.";
}

/** Staff-only; the database function checks the role rather than trusting us. */
export async function setLeadStatus(_previous: FormState, form: FormData): Promise<FormState> {
  const leadId = text(form, "leadId");
  const status = text(form, "status");

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_lead_status", {
    p_lead_id: leadId,
    p_status: status,
  });

  if (error) {
    console.error("set_lead_status failed", error.message);
    return { status: "error", message: "We could not update that lead." };
  }

  revalidatePath("/admin/leads");

  return { status: "success" };
}

export async function submitInquiry(
  _previous: InquiryState,
  form: FormData,
): Promise<InquiryState> {
  const name = text(form, "name");
  const email = text(form, "email");
  const phone = text(form, "phone");
  const message = text(form, "message");
  const vehicleId = text(form, "vehicleId");
  const pickupDate = text(form, "pickupDate");
  const returnDate = text(form, "returnDate");

  // Checked again in the database function; this only saves a round trip and
  // lets us point at the offending field.
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please tell us your name.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "Enter a valid email address.";
  // Required: a rental gets confirmed on the phone, and an emailed reply to a
  // high-priority lead loses the hours that made it high-priority.
  if (!phone) errors.phone = "Please add a phone number so we can reach you.";
  else if (phone.length < 6 || phone.length > 32) errors.phone = "Enter a valid phone number.";
  if (message.length < 15) errors.message = "Tell us a little more so we can help properly.";
  if (message.length > 2000) errors.message = "Please keep your message under 2000 characters.";

  // Both dates are required: the sales team ranks inquiries by when the car is
  // needed. Re-checked here because the browser's `required` is trivially
  // bypassed and this action is the real boundary.
  if (!pickupDate) errors.pickupDate = "Tell us when you need the car.";
  else if (!isoDate.test(pickupDate)) errors.pickupDate = "Enter a valid date.";
  else if (pickupDate < todayIso()) errors.pickupDate = "Pick a date from today onwards.";

  if (!returnDate) errors.returnDate = "Tell us when you will return it.";
  else if (!isoDate.test(returnDate)) errors.returnDate = "Enter a valid date.";
  else if (pickupDate && returnDate < pickupDate) {
    errors.returnDate = "The return cannot be before the pick-up.";
  }

  if (Object.keys(errors).length) return { status: "error", errors };

  // create_lead throttles per email address, which a new address defeats. This
  // is the throttle a flood cannot pick its own value for: every inquiry costs
  // a webhook call, and soon a model call to qualify it.
  const limit = inquiryLimiter.check(clientIp(await headers()));

  if (!limit.allowed) {
    return { status: "error", message: messages.TOO_MANY_INQUIRIES };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_lead", {
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_message: message,
    p_vehicle_id: vehicleId || undefined,
    p_source: vehicleId ? "vehicle_page" : "website",
    p_pickup_date: pickupDate,
    p_return_date: returnDate,
  });

  if (error) return { status: "error", message: inquiryErrorMessage(error.message) };

  revalidatePath("/admin/leads");

  const leadId = readLeadId(data);

  // The lead is saved. Everything below runs after the response is sent, so a
  // slow webhook or a slow model cannot delay or fail the visitor's submission.
  if (leadId) {
    after(async () => {
      await sendLeadToZapier({
        event: "lead_created",
        lead_id: leadId,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        vehicle: await vehicleName(vehicleId),
        pickup_date: pickupDate,
        return_date: returnDate,
        message,
      });

      // Scored immediately rather than waiting for someone to press Qualify.
      // This is what makes the high-priority alert arrive while the customer is
      // still on the page. It swallows its own failures.
      await autoQualifyLead(leadId);
    });
  }

  return { status: "success" };
}

/** `create_lead` returns jsonb, which the generated types widen to `Json`. */
function readLeadId(data: unknown) {
  if (data && typeof data === "object" && "id" in data) {
    const id = (data as { id: unknown }).id;
    if (typeof id === "string") return id;
  }

  console.error("create_lead returned no lead id; skipping zapier webhook");
  return null;
}

/**
 * Zapier wants the car's name, not our internal id. Absent for a general
 * inquiry, and a lookup failure must not cost us the whole notification.
 */
async function vehicleName(vehicleId: string) {
  if (!vehicleId) return null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("name")
      .eq("id", vehicleId)
      .maybeSingle();

    return data?.name ?? null;
  } catch (error) {
    console.error("could not read vehicle name for zapier", error);
    return null;
  }
}
