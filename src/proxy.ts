import { NextResponse, type NextRequest } from "next/server";

import { adminRoot } from "@/lib/nav";
import { updateSession } from "@/lib/supabase/proxy";

const authPages = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { user, response } = await updateSession(request);
  const { pathname, search } = request.nextUrl;
  const onAuthPage = authPages.includes(pathname);

  const to = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    return url;
  };

  if (user === null && !onAuthPage) {
    const login = to("/login");
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  if (user && onAuthPage) {
    const requested = request.nextUrl.searchParams.get("next") ?? "";
    const onward = requested.startsWith("/") && !requested.startsWith("//") ? requested : adminRoot;
    return NextResponse.redirect(new URL(onward, request.nextUrl.origin));
  }

  return response;
}

export const config = {
  // The staff check itself lives in the admin layout, where the profile is
  // already loaded; the proxy only settles who is signed in.
  matcher: ["/admin/:path*", "/account/:path*", "/login", "/register"],
};
