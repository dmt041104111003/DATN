import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { APP_ENTERPRISE } from "@/lib/app-routes";

function base64UrlDecodeToString(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, "=");
  return atob(padded);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(base64UrlDecodeToString(parts[1])) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getRoleFromJwt(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const role = payload.role ?? payload.roleCode;
  return typeof role === "string" ? role : null;
}

function getProfileIdFromJwt(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const id = payload.profileId;
  if (typeof id === "string" && id.trim()) return id;
  if (typeof id === "number") return String(id);
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const deprecatedRoots =
    pathname.startsWith("/agent") ||
    pathname.startsWith("/transit") ||
    pathname.startsWith("/create") ||
    pathname.startsWith("/scan");
  if (deprecatedRoots) {
    return NextResponse.redirect(new URL(APP_ENTERPRISE, req.url));
  }
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return NextResponse.redirect(new URL(APP_ENTERPRISE, req.url));
  }

  const token = req.cookies.get("auth_token")?.value ?? null;
  const role = token ? getRoleFromJwt(token) : null;
  const profileId = token ? getProfileIdFromJwt(token) : null;

  // Logged in: always land on enterprise admin.
  if (token && profileId && pathname === "/") {
    return NextResponse.redirect(new URL(APP_ENTERPRISE, req.url));
  }

  if (pathname === "/enterprise" || pathname === "/enterprise/") {
    return NextResponse.redirect(new URL(APP_ENTERPRISE, req.url));
  }

  const isEnterpriseAdmin = pathname.startsWith("/enterprise/admin");
  if (isEnterpriseAdmin) {
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (role !== "ENTERPRISE") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
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
    "/enterprise",
    "/enterprise/:path*",
  ],
};
