import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { recoveryCookie, recoveryCookieMaxAge } from "@/lib/password-reset";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The landing point for the link in a password reset email. Exchanges the
 * one-time `token_hash` for a session, then hands off to the form.
 *
 * The token is spent here rather than on the reset page so that a preloading
 * mail client or link scanner burns it before the recipient clicks — the reason
 * this is a route handler and not a page.
 */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  const failed = new URL("/forgot-password?error=link", request.nextUrl.origin);

  // Only recovery is issued through this route today; anything else is a link
  // we did not send.
  if (!tokenHash || type !== "recovery") return NextResponse.redirect(failed);

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });

  if (error) {
    // Expired, already used, or tampered with. All the same to the visitor.
    console.warn("recovery token rejected", error.message);
    return NextResponse.redirect(failed);
  }

  // Marks this session as one that arrived through the inbox. The reset action
  // refuses to run without it, so an ordinary signed-in session cannot reach a
  // form that skips the current-password check.
  (await cookies()).set(recoveryCookie, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: recoveryCookieMaxAge,
  });

  return NextResponse.redirect(new URL("/reset-password", request.nextUrl.origin));
}
