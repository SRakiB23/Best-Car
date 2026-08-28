import "server-only";

import { redirect } from "next/navigation";

import { adminRoot } from "./nav";
import { createClient } from "./supabase/server";

export async function currentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}

export function safeNext(value: string) {
  return value.startsWith(`${adminRoot}/`) || value === adminRoot ? value : adminRoot;
}
