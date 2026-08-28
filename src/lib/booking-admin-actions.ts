"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "./auth";
import { bookingErrorMessage } from "./booking";
import type { FormState } from "./form-state";
import { createClient } from "./supabase/server";

export async function cancelBooking(_previous: FormState, form: FormData): Promise<FormState> {
  const reference = String(form.get("reference") ?? "").trim();
  if (!reference) return { status: "error", message: "That booking no longer exists." };

  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.rpc("cancel_booking", { p_reference: reference });

  if (error) {
    return { status: "error", message: bookingErrorMessage(error.message) };
  }

  // Both the admin list and the customer's own list have to reflect this.
  revalidatePath("/", "layout");
  return { status: "success", message: `${reference} cancelled and the dates released.` };
}
