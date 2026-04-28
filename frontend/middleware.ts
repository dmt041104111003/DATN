import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APP_ADMIN_SETUP = "/admin";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const deprecatedRoots =
    pathname.startsWith("/create") ||
    pathname.startsWith("/scan");
  if (deprecatedRoots) {
    return NextResponse.redirect(new URL(APP_ADMIN_SETUP, req.url));
  }
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return NextResponse.redirect(new URL(APP_ADMIN_SETUP, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/create",
    "/create/:path*",
    "/scan",
    "/scan/:path*",
    "/agent",
    "/agent/:path*",
    "/transit",
    "/transit/:path*",
    "/enterprise",
    "/enterprise/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
