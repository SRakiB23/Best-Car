import { NextResponse, type NextRequest } from "next/server";

import { adminRoot } from "@/lib/nav";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { user, response } = await updateSession(request);
  const { pathname, search } = request.nextUrl;
  const onLogin = pathname === "/login";

  if (user === null && !onLogin) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  if (user && onLogin) {
    const admin = request.nextUrl.clone();
    admin.pathname = adminRoot;
    admin.search = "";
    return NextResponse.redirect(admin);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
