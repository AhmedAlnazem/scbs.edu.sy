import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/app/_lib/auth-constants";

function hasSession(request: NextRequest) {
  return Boolean(request.cookies.get(SESSION_COOKIE)?.value);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = hasSession(request);

  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/manage") ||
      pathname.startsWith("/admin")) &&
    !isAuthenticated
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname.startsWith("/login/") || pathname === "/register") && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/login/:path*", "/register", "/dashboard/:path*", "/manage/:path*", "/admin/:path*"],
};
