import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

/**
 * Bypasses row level security, so it is deliberately hard to reach: only the
 * audit log uses it, and only because that write must happen for visitors who
 * have no session at all. Everything a signed-in person does goes through
 * `./server`, where their own policies still apply.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SECRET_KEY?.trim();

  // Optional on purpose. Without it the audit write is skipped and logged,
  // which is the same outcome as any other failure of a best-effort log.
  if (!key) return null;

  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
