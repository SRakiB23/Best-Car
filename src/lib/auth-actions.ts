"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { currentViewer, homeFor, safeNext } from "./auth";
import { demoAccount } from "./demo-accounts";
import type { FormState } from "./form-state";
import { createClient } from "./supabase/server";

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function field(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

/** Staff land on the dashboard, customers back where they were booking. */
async function destinationAfterAuth(requested: string) {
  const viewer = await currentViewer();
  const fallback = homeFor(viewer?.isStaff ?? false);

  if (!requested) return fallback;
  // A customer must never be sent into the admin area by a stale next param.
  if (requested.startsWith("/admin") && !viewer?.isStaff) return fallback;

  return safeNext(requested, fallback);
}

export async function signIn(_previous: FormState, form: FormData): Promise<FormState> {
  const email = field(form, "email");
  const password = String(form.get("password") ?? "");

  const errors: Record<string, string> = {};
  if (!emailPattern.test(email)) errors.email = "Enter a valid email address.";
  if (password.length === 0) errors.password = "Enter your password.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", errors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "email_not_confirmed"
          ? "Confirm your email address first, then sign in."
          : "Those credentials did not match an account.",
    };
  }

  const destination = await destinationAfterAuth(field(form, "next"));

  revalidatePath("/", "layout");
  redirect(destination);
}

/**
 * One-click sign-in for the two published demo accounts. The credentials are on
 * the page anyway, so nothing is granted here that typing them would not; the
 * role decides the landing page rather than the `next` param.
 */
export async function signInAsDemo(_previous: FormState, form: FormData): Promise<FormState> {
  const account = demoAccount(field(form, "role"));

  if (!account) {
    return { status: "error", message: "That demo account is not available." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });

  if (error) {
    return {
      status: "error",
      message: "The demo account is not set up yet. Run `npm run seed:demo` and try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(account.destination);
}

/** A generic message here hides causes that are fixable, like the email quota. */
function signUpFailure(error: { code?: string; message: string }): FormState {
  const code = error.code ?? "";

  if (code === "user_already_exists" || error.message.toLowerCase().includes("already")) {
    return {
      status: "error",
      message: "That email already has an account. Try signing in instead.",
      errors: { email: "This email is already registered." },
    };
  }

  if (code === "over_email_send_rate_limit") {
    return {
      status: "error",
      message:
        "Sign-up emails have hit their hourly limit. Turn off email confirmation in Supabase, or wait an hour.",
    };
  }

  if (code === "weak_password") {
    return {
      status: "error",
      message: "Choose a stronger password.",
      errors: { password: error.message },
    };
  }

  if (code === "signup_disabled") {
    return { status: "error", message: "New sign-ups are switched off for this project." };
  }

  return { status: "error", message: `Could not create your account: ${error.message}` };
}

export async function signUp(_previous: FormState, form: FormData): Promise<FormState> {
  const name = field(form, "name");
  const email = field(form, "email");
  const phone = field(form, "phone");
  const password = String(form.get("password") ?? "");

  const errors: Record<string, string> = {};
  if (name.length < 3) errors.name = "Enter your full name.";
  if (!emailPattern.test(email)) errors.email = "Enter a valid email address.";
  if (phone.length < 6) errors.phone = "Enter a phone number we can reach you on.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  else if (!/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
    errors.password = "Mix letters and numbers.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", errors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, phone } },
  });

  if (error) return signUpFailure(error);

  // With email confirmation switched on, Supabase creates the user but no
  // session, so there is nowhere to redirect to yet.
  if (!data.session) {
    return {
      status: "success",
      message: "Account created. Check your inbox to confirm your email, then sign in.",
    };
  }

  const destination = await destinationAfterAuth(field(form, "next"));

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}
