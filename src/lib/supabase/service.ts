import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

export type Db = SupabaseClient<Database>;

/**
 * Bypasses row level security. Used only where there is genuinely no user to act
 * as — currently the automatic lead qualification that runs after a visitor
 * submits an inquiry, which must write a score no visitor is allowed to write.
 *
 * `server-only` keeps this out of the client bundle, and the key is read at call
 * time so a missing one is an error on that one code path rather than at boot.
 */
export function createServiceClient(): Db {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret =
    process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !secret) {
    throw new Error("SUPABASE_SECRET_KEY is not set; the privileged client is unavailable.");
  }

  return createSupabaseClient<Database>(url, secret, {
    // No cookies, no refresh: this client is never tied to a browser session.
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
