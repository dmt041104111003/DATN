import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function base64UrlDecodeToString(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, "=");
  return atob(padded);
}

function getRoleFromJwt(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadJson = base64UrlDecodeToString(parts[1]);
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;
    const role = payload.role ?? payload.roleCode;
    return typeof role === "string" ? role : null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedPrefix = "/dashboard/asset-tools/";
  if (!pathname.startsWith(protectedPrefix)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const role = getRoleFromJwt(token);
  if (role !== "ENTERPRISE") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/asset-tools/:path*",
    "/dashboard/asset-tools",
  ],
};

