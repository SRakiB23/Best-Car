"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { accountCookie, currencyOptions, preferencesCookie } from "./account";
import { getAccount, getPreferences } from "./account-store";
import type { FormState } from "./form-state";
import { localeCookie, type Locale } from "./i18n";
import type { CurrencyCode } from "./types";

const year = 60 * 60 * 24 * 365;

async function persist(name: string, value: object) {
  (await cookies()).set(name, JSON.stringify(value), { path: "/", maxAge: year });
  revalidatePath("/", "layout");
}

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function saveProfile(_previous: FormState, form: FormData): Promise<FormState> {
  const name = text(form, "name");
  const email = text(form, "email");
  const phone = text(form, "phone");
  const avatarUrl = text(form, "avatarUrl");

  const errors: Record<string, string> = {};
  if (name.length < 3) errors.name = "Enter at least 3 characters.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (avatarUrl && !/^https?:\/\/\S+$/.test(avatarUrl)) {
    errors.avatarUrl = "Enter a full URL starting with http.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", errors };
  }

  const current = await getAccount();
  await persist(accountCookie, { ...current, name, email, phone, avatarUrl });

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

  const current = await getPreferences();
  await persist(preferencesCookie, {
    ...current,
    storeName,
    currency,
    timezone,
    lowStockThreshold,
  });

  return { status: "success", message: "Settings saved." };
}

export async function setLocale(locale: Locale) {
  (await cookies()).set(localeCookie, locale, { path: "/", maxAge: year });
  revalidatePath("/", "layout");
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

  return { status: "success", message: "Password changed." };
}
