"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { appOrigin } from "./app-url";
import { currentViewer, homeFor } from "./auth";
import type { FormState } from "./form-state";
import { sendPasswordResetEmail } from "./notifications/send-password-reset";
import {
  recoveryCookie,
  recoveryLinkMinutes,
  resetRequestedMessage,
} from "./password-reset";
import { clientIp, passwordResetEmailLimiter, passwordResetIpLimiter } from "./rate-limit";
import { createClient } from "./supabase/server";
import { createServiceClient, type Db } from "./supabase/service";

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const expiredLink: FormState = {
  status: "error",
  message: "This reset link has expired or has already been used. Request a new one.",
};

export async function requestPasswordReset(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!emailPattern.test(email)) {
    return {
      status: "error",
      message: "Fix the highlighted field.",
      errors: { email: "Enter a valid email address." },
    };
  }

  // Checked by address because the endpoint is open and every accepted request
  // costs an email, and by address-being-reset because an attacker rotating IPs
  // could otherwise still flood one person's inbox. Neither counter depends on
  // whether the account exists, so refusing here reveals nothing about it.
  const ip = clientIp(await headers());

  if (!passwordResetIpLimiter.check(ip).allowed || !passwordResetEmailLimiter.check(email).allowed) {
    return {
      status: "error",
      message: "Too many reset requests. Wait a few minutes and try again.",
    };
  }

  // Delivery runs after the response so the visitor waits the same amount of
  // time either way. Answering faster for an unknown address would leak exactly
  // what the identical wording above is there to hide.
  after(async () => {
    await deliverResetEmail(email);
  });

  return { status: "success", message: resetRequestedMessage };
}

/**
 * Mints the recovery token without asking Supabase to send anything, then sends
 * our own email through Resend. `generateLink` returns `hashed_token`, which is
 * what `/auth/confirm` verifies, so the link never leaves our origin.
 *
 * Swallows every failure. An unknown address is the ordinary case here, not an
 * error, and the caller has already replied.
 */
async function deliverResetEmail(email: string) {
  let db: Db;

  try {
    db = createServiceClient();
  } catch (cause) {
    console.error("password reset unavailable", cause instanceof Error ? cause.message : cause);
    return;
  }

  const { data, error } = await db.auth.admin.generateLink({ type: "recovery", email });

  if (error || !data.properties?.hashed_token) {
    // Overwhelmingly "user not found", which is a normal outcome of an open form.
    console.warn("no recovery link generated", error?.message ?? "missing token");
    return;
  }

  const recoveryUrl = new URL("/auth/confirm", appOrigin());
  recoveryUrl.searchParams.set("token_hash", data.properties.hashed_token);
  recoveryUrl.searchParams.set("type", "recovery");

  const metadata = data.user?.user_metadata as { full_name?: string } | undefined;

  const sent = await sendPasswordResetEmail(email, {
    name: metadata?.full_name?.trim() ?? "",
    recoveryUrl: recoveryUrl.toString(),
    expiresInMinutes: recoveryLinkMinutes,
  });

  // Until a domain is verified, Resend refuses every recipient except the
  // account owner, and the demo accounts are not real inboxes at all. Printing
  // the link keeps the flow testable. Never in production: the server log is
  // not a safe place for a live credential.
  if (!sent.ok && process.env.NODE_ENV !== "production") {
    console.warn(`[dev] password reset link for ${email}: ${recoveryUrl}`);
  }
}

export async function completePasswordReset(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const next = String(form.get("newPassword") ?? "");
  const confirm = String(form.get("confirmPassword") ?? "");

  // The same rules the register and admin password forms apply.
  const errors: Record<string, string> = {};
  if (next.length < 8) errors.newPassword = "Use at least 8 characters.";
  else if (!/[0-9]/.test(next) || !/[a-zA-Z]/.test(next)) {
    errors.newPassword = "Mix letters and numbers.";
  }
  if (next !== confirm) errors.confirmPassword = "Passwords do not match.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", errors };
  }

  const store = await cookies();
  if (!store.has(recoveryCookie)) return expiredLink;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return expiredLink;

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { status: "error", message: error.message };

  // Consumed, so a link forwarded or left in history cannot be replayed.
  store.delete(recoveryCookie);

  // Whoever knew the old password is signed out everywhere else. Without this,
  // resetting after a compromise would leave the intruder's session alive.
  await supabase.auth.signOut({ scope: "others" });

  const viewer = await currentViewer();

  revalidatePath("/", "layout");
  redirect(homeFor(viewer?.isStaff ?? false));
}
