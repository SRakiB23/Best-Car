import "server-only";

import { redirect } from "next/navigation";

import { adminRoot } from "./nav";
import { createClient } from "./supabase/server";

export const accountRoot = "/account";
export const customerHome = "/account/bookings";

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

export type Viewer = {
  id: string;
  email: string;
  name: string;
  phone: string;
  isStaff: boolean;
};

/** The signed-in person plus the profile fields both sides of the site need. */
export async function currentViewer(): Promise<Viewer | null> {
  const user = await currentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name, email, phone, is_staff")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: data?.email || user.email || "",
    name: data?.full_name || "",
    phone: data?.phone || "",
    isStaff: data?.is_staff ?? false,
  };
}

export async function requireStaff() {
  const viewer = await currentViewer();
  if (!viewer) redirect("/login");
  if (!viewer.isStaff) redirect(customerHome);
  return viewer;
}

/** Only ever redirect to a path on this site, never to an attacker's URL. */
export function safeNext(value: string, fallback: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export function homeFor(isStaff: boolean) {
  return isStaff ? adminRoot : customerHome;
}
