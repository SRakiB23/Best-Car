import "server-only";

import { cookies } from "next/headers";

import {
  accountCookie,
  defaultAccount,
  defaultPreferences,
  preferencesCookie,
} from "./account";
import { defaultLocale, isLocale, localeCookie, translator } from "./i18n";

async function read<T extends object>(name: string, fallback: T): Promise<T> {
  const raw = (await cookies()).get(name)?.value;
  if (!raw) return fallback;

  try {
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return fallback;
  }
}

export function getAccount() {
  return read(accountCookie, defaultAccount);
}

export function getPreferences() {
  return read(preferencesCookie, defaultPreferences);
}

export async function getLocale() {
  const value = (await cookies()).get(localeCookie)?.value ?? "";
  return isLocale(value) ? value : defaultLocale;
}

export async function getTranslator() {
  return translator(await getLocale());
}
