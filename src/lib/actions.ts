"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { currencyOptions } from "./account";
import { requireUser } from "./auth";
import type { FormState } from "./form-state";
import { localeCookie, type Locale } from "./i18n";
import { avatarBucket, imageProblem, storedPath } from "./images";
import { removeImage, uploadImage } from "./storage";
import { createClient } from "./supabase/server";
import type { CurrencyCode } from "./types";

const year = 60 * 60 * 24 * 365;

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function saveProfile(_previous: FormState, form: FormData): Promise<FormState> {
  const name = text(form, "name");
  const email = text(form, "email");
  const phone = text(form, "phone");
  const picked = form.get("avatar");
  const avatar = picked instanceof File && picked.size > 0 ? picked : null;
  const removed = text(form, "avatarCleared") === "1";

  const errors: Record<string, string> = {};
  if (name.length < 3) errors.name = "Enter at least 3 characters.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (avatar) {
    const problem = imageProblem(avatar);
    if (problem) errors.avatar = problem;
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", errors };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const existing = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const previous = existing.data?.avatar_url ?? "";
  let avatarUrl = removed ? "" : previous;

  if (avatar) {
    const upload = await uploadImage(supabase, avatarBucket, user.id, name, avatar);
    if (upload.error) {
      return { status: "error", message: `Could not upload the photo: ${upload.error}` };
    }
    avatarUrl = upload.publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: name,
      email,
      phone,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { status: "error", message: "Could not save your profile." };

  if (avatarUrl !== previous) {
    await removeImage(supabase, avatarBucket, storedPath(avatarBucket, previous));
  }

  refresh();
  return { status: "success", message: "Profile updated." };
}

export async function savePreferences(_previous: FormState, form: FormData): Promise<FormState> {
  const storeName = text(form, "storeName");
  const currency = text(form, "currency") as CurrencyCode;
  const timezone = text(form, "timezone");
  const lowStockThreshold = Number(text(form, "lowStockThreshold"));

  const errors: Record<string, string> = {};
  if (storeName.length < 2) errors.storeName = "Enter a store name.";
  if (!currencyOptions.some((option) => option.value === currency)) {
    errors.currency = "Choose a supported currency.";
  }
  if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 1) {
    errors.lowStockThreshold = "Enter a whole number of 1 or more.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", errors };
  }

  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_settings")
    .update({
      store_name: storeName,
      currency,
      timezone,
      low_stock_threshold: lowStockThreshold,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return { status: "error", message: "Could not save your settings." };

  refresh();
  return { status: "success", message: "Settings saved." };
}

export async function setLocale(locale: Locale) {
  (await cookies()).set(localeCookie, locale, { path: "/", maxAge: year });

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    await supabase.from("user_settings").update({ locale }).eq("user_id", data.user.id);
  }

  refresh();
}

type Inbox = "notifications" | "messages";

/** Read state lives in the database so the unread badge survives a refresh. */
export async function markInboxRead(inbox: Inbox, id?: string) {
  await requireUser();
  const supabase = await createClient();

  let query = supabase.from(inbox).update({ read_at: new Date().toISOString() }).is("read_at", null);
  if (id) query = query.eq("id", id);

  const { error } = await query;
  if (error) return { status: "error" as const, message: error.message };

  refresh();
  return { status: "success" as const };
}

export async function changePassword(_previous: FormState, form: FormData): Promise<FormState> {
  const current = text(form, "currentPassword");
  const next = text(form, "newPassword");
  const confirm = text(form, "confirmPassword");

  const errors: Record<string, string> = {};
  if (current.length === 0) errors.currentPassword = "Enter your current password.";
  if (next.length < 8) errors.newPassword = "Use at least 8 characters.";
  if (!/[0-9]/.test(next) || !/[a-zA-Z]/.test(next)) {
    errors.newPassword = "Mix letters and numbers.";
  }
  if (next !== confirm) errors.confirmPassword = "Passwords do not match.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", errors };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const reauthenticated = await supabase.auth.signInWithPassword({
    email: user.email ?? "",
    password: current,
  });

  if (reauthenticated.error) {
    return {
      status: "error",
      message: "Fix the highlighted fields.",
      errors: { currentPassword: "That is not your current password." },
    };
  }

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { status: "error", message: error.message };

  refresh();
  return { status: "success", message: "Password changed." };
}
