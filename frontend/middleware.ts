import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APP_ADMIN_SETUP = "/admin";

function homePathForRole(role: string | null | undefined) {
  const code = String(role || "").toUpperCase();
  if (code === "TRANSIT") return "/transit";
  if (code === "AGENT") return "/agent";
  return "/enterprise";
}

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
    pathname.startsWith("/create") ||
    pathname.startsWith("/scan");
  if (deprecatedRoots) {
    return NextResponse.redirect(new URL(APP_ADMIN_SETUP, req.url));
  }
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return NextResponse.redirect(new URL(APP_ADMIN_SETUP, req.url));
  }

  const token = req.cookies.get("auth_token")?.value ?? null;
  const role = token ? getRoleFromJwt(token) : null;
  const profileId = token ? getProfileIdFromJwt(token) : null;

  if (token && profileId && pathname === "/") {
    return NextResponse.redirect(new URL(homePathForRole(role), req.url));
  }

  const roleHome = homePathForRole(role);
  const isSetupPath = pathname.startsWith("/admin");
  const isRolePath =
    pathname.startsWith("/enterprise") ||
    pathname.startsWith("/transit") ||
    pathname.startsWith("/agent");

  if (isSetupPath) {
    if (!token) return NextResponse.redirect(new URL("/", req.url));
    if (profileId) return NextResponse.redirect(new URL(roleHome, req.url));
    return NextResponse.next();
  }

  if (isRolePath) {
    if (!token) return NextResponse.redirect(new URL("/", req.url));
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
