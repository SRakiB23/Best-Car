import "server-only";

import { cookies } from "next/headers";

import { defaultAccount, defaultPreferences } from "./account";
import { currentUser } from "./auth";
import { defaultLocale, isLocale, localeCookie, translator } from "./i18n";
import { createClient } from "./supabase/server";
import type { Account, CurrencyCode, Preferences } from "./types";

async function profileRow() {
  const user = await currentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, email, phone, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  return data ? { ...data, email: data.email || (user.email ?? "") } : null;
}

async function settingsRow() {
  const user = await currentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("user_settings")
    .select("store_name, currency, timezone, low_stock_threshold, locale")
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

export async function getAccount(): Promise<Account> {
  const row = await profileRow();
  if (!row) return defaultAccount;

  return {
    name: row.full_name || defaultAccount.name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    avatarUrl: row.avatar_url,
  };
}

export async function getPreferences(): Promise<Preferences> {
  const row = await settingsRow();
  if (!row) return defaultPreferences;

  return {
    storeName: row.store_name,
    currency: row.currency as CurrencyCode,
    timezone: row.timezone,
    lowStockThreshold: row.low_stock_threshold,
  };
}

export async function getLocale() {
  const chosen = (await cookies()).get(localeCookie)?.value ?? "";
  if (isLocale(chosen)) return chosen;

  const saved = (await settingsRow())?.locale ?? "";
  return isLocale(saved) ? saved : defaultLocale;
}

export async function getTranslator() {
  return translator(await getLocale());
}
