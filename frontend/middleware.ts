import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { homePathForRole } from "@/lib/app-routes";

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

  // Legacy agent URLs → /agent/pages/*
  if (
    pathname === "/agent/order" ||
    pathname.startsWith("/agent/order/") ||
    pathname === "/agent/pages/order" ||
    pathname.startsWith("/agent/pages/order/")
  ) {
    return NextResponse.redirect(new URL("/agent", req.url));
  }
  if (pathname.startsWith("/agent/profile")) {
    return NextResponse.redirect(
      new URL(
        pathname.replace(/^\/agent\/profile/, "/agent/pages/profile"),
        req.url,
      ),
    );
  }
  if (
    pathname === "/agent/warehouses" ||
    pathname.startsWith("/agent/warehouses/")
  ) {
    return NextResponse.redirect(
      new URL(
        pathname.replace(/^\/agent\/warehouses/, "/agent/pages/warehouses"),
        req.url,
      ),
    );
  }
  if (
    pathname === "/agent/pages/collections" ||
    pathname.startsWith("/agent/pages/collections/")
  ) {
    return NextResponse.redirect(
      new URL(
        pathname.replace(
          /^\/agent\/pages\/collections/,
          "/agent/pages/warehouses",
        ),
        req.url,
      ),
    );
  }

  // Legacy transit URLs → /transit/pages/*
  if (pathname.startsWith("/transit/profile")) {
    return NextResponse.redirect(
      new URL(
        pathname.replace(/^\/transit\/profile/, "/transit/pages/profile"),
        req.url,
      ),
    );
  }
  if (
    pathname === "/transit/warehouses" ||
    pathname.startsWith("/transit/warehouses/")
  ) {
    return NextResponse.redirect(
      new URL(
        pathname.replace(/^\/transit\/warehouses/, "/transit/pages/warehouses"),
        req.url,
      ),
    );
  }
  if (
    pathname === "/transit/pages/collections" ||
    pathname.startsWith("/transit/pages/collections/")
  ) {
    return NextResponse.redirect(
      new URL(
        pathname.replace(
          /^\/transit\/pages\/collections/,
          "/transit/pages/warehouses",
        ),
        req.url,
      ),
    );
  }

  // Legacy enterprise URLs → /enterprise/pages/*
  if (
    pathname === "/enterprise/order" ||
    pathname.startsWith("/enterprise/order/") ||
    pathname === "/enterprise/pages/order" ||
    pathname.startsWith("/enterprise/pages/order/")
  ) {
    return NextResponse.redirect(new URL("/enterprise", req.url));
  }
  if (pathname.startsWith("/enterprise/profile")) {
    return NextResponse.redirect(
      new URL(
        pathname.replace(/^\/enterprise\/profile/, "/enterprise/pages/profile"),
        req.url,
      ),
    );
  }
  if (
    pathname === "/enterprise/warehouses" ||
    pathname.startsWith("/enterprise/warehouses/")
  ) {
    return NextResponse.redirect(
      new URL(
        pathname.replace(
          /^\/enterprise\/warehouses/,
          "/enterprise/pages/warehouses",
        ),
        req.url,
      ),
    );
  }
  if (
    pathname === "/enterprise/pages/collections" ||
    pathname.startsWith("/enterprise/pages/collections/")
  ) {
    return NextResponse.redirect(
      new URL(
        pathname.replace(
          /^\/enterprise\/pages\/collections/,
          "/enterprise/pages/warehouses",
        ),
        req.url,
      ),
    );
  }

  // Legacy asset-tools URLs → product-tools
  if (
    pathname === "/enterprise/asset-tools" ||
    pathname.startsWith("/enterprise/asset-tools/") ||
    pathname === "/enterprise/pages/asset-tools" ||
    pathname.startsWith("/enterprise/pages/asset-tools/")
  ) {
    return NextResponse.redirect(
      new URL(
        pathname
          .replace(/^\/enterprise\/asset-tools/, "/enterprise/pages/product-tools")
          .replace(/^\/enterprise\/pages\/asset-tools/, "/enterprise/pages/product-tools"),
        req.url,
      ),
    );
  }

  // Legacy /dashboard → workspace theo role
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const token = req.cookies.get("auth_token")?.value;
    const role = token ? getRoleFromJwt(token) : null;
    const dest = homePathForRole(role);
    return NextResponse.redirect(new URL(dest, req.url));
  }

  const token = req.cookies.get("auth_token")?.value ?? null;
  const role = token ? getRoleFromJwt(token) : null;
  const profileId = token ? getProfileIdFromJwt(token) : null;

  // Đã login + đã có profile: vào trang chủ marketing → đưa về đúng workspace (create/scan vẫn mở được)
  if (token && profileId && pathname === "/") {
    return NextResponse.redirect(new URL(homePathForRole(role), req.url));
  }

  // Đã login nhưng chưa profile → chỉ cho role-setup (trừ API routes)
  if (token && !profileId && pathname !== "/role-setup") {
    return NextResponse.redirect(new URL("/role-setup", req.url));
  }

  // Đã có profile mà vào role-setup → về dashboard đúng role
  if (pathname === "/role-setup" && token && profileId) {
    return NextResponse.redirect(new URL(homePathForRole(role), req.url));
  }

  // /enterprise/pages/product-tools — ENTERPRISE only
  const isEnterpriseProductTools =
    pathname === "/enterprise/pages/product-tools" ||
    pathname.startsWith("/enterprise/pages/product-tools/");
  if (isEnterpriseProductTools) {
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (!profileId) {
      return NextResponse.redirect(new URL("/role-setup", req.url));
    }
    const productToolsRole = getRoleFromJwt(token);
    if (productToolsRole !== "ENTERPRISE") {
      return NextResponse.redirect(new URL(homePathForRole(productToolsRole), req.url));
    }
    return NextResponse.next();
  }

  // Bọc auth cho toàn bộ /agent, /transit và /enterprise
  const isAgentWorkspace = pathname === "/agent" || pathname.startsWith("/agent/");
  const isTransitWorkspace =
    pathname === "/transit" || pathname.startsWith("/transit/");
  const isEnterpriseWorkspace =
    pathname === "/enterprise" || pathname.startsWith("/enterprise/");

  if (isAgentWorkspace || isTransitWorkspace || isEnterpriseWorkspace) {
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (!profileId) {
      return NextResponse.redirect(new URL("/role-setup", req.url));
    }

    const r = getRoleFromJwt(token);
    // ENTERPRISE không dùng nhánh /agent — mirror sang /enterprise/pages/*
    if (r === "ENTERPRISE" && isAgentWorkspace) {
      let target: string;
      if (pathname.startsWith("/agent/pages")) {
        target =
          pathname.replace(/^\/agent\/pages/, "/enterprise/pages") ||
          "/enterprise";
      } else {
        const rest = pathname.slice("/agent".length) || "";
        target = `/enterprise${rest}` || "/enterprise";
      }
      return NextResponse.redirect(new URL(target, req.url));
    }
    // ENTERPRISE không dùng nhánh /transit — mirror sang /enterprise/pages/*
    if (r === "ENTERPRISE" && isTransitWorkspace) {
      let target: string;
      if (pathname.startsWith("/transit/pages")) {
        target =
          pathname.replace(/^\/transit\/pages/, "/enterprise/pages") ||
          "/enterprise";
      } else {
        const rest = pathname.slice("/transit".length) || "";
        target = `/enterprise${rest}` || "/enterprise";
      }
      return NextResponse.redirect(new URL(target, req.url));
    }
    // AGENT không dùng nhánh /enterprise (trừ product-tools đã xử lý ở trên)
    if (r === "AGENT" && isEnterpriseWorkspace) {
      if (
        pathname === "/enterprise/pages/profile" ||
        pathname.startsWith("/enterprise/pages/profile/") ||
        pathname === "/enterprise/pages/warehouses" ||
        pathname.startsWith("/enterprise/pages/warehouses/")
      ) {
        const target =
          pathname.replace(/^\/enterprise\/pages/, "/agent/pages") ||
          "/agent/pages";
        return NextResponse.redirect(new URL(target, req.url));
      }
      const rest = pathname.slice("/enterprise".length) || "";
      const target = `/agent${rest}` || "/agent";
      return NextResponse.redirect(new URL(target, req.url));
    }
    // AGENT không dùng nhánh /transit
    if (r === "AGENT" && isTransitWorkspace) {
      if (pathname.startsWith("/transit/pages")) {
        const target =
          pathname.replace(/^\/transit\/pages/, "/agent/pages") ||
          "/agent/pages";
        return NextResponse.redirect(new URL(target, req.url));
      }
      const rest = pathname.slice("/transit".length) || "";
      const target = `/agent${rest}` || "/agent";
      return NextResponse.redirect(new URL(target, req.url));
    }
    // TRANSIT không dùng nhánh /agent
    if (r === "TRANSIT" && isAgentWorkspace) {
      if (pathname.startsWith("/agent/pages")) {
        const target =
          pathname.replace(/^\/agent\/pages/, "/transit/pages") ||
          "/transit/pages";
        return NextResponse.redirect(new URL(target, req.url));
      }
      const rest = pathname.slice("/agent".length) || "";
      const target = `/transit${rest}` || "/transit";
      return NextResponse.redirect(new URL(target, req.url));
    }
    // TRANSIT không dùng nhánh /enterprise (giống AGENT)
    if (r === "TRANSIT" && isEnterpriseWorkspace) {
      if (
        pathname === "/enterprise/pages/profile" ||
        pathname.startsWith("/enterprise/pages/profile/") ||
        pathname === "/enterprise/pages/warehouses" ||
        pathname.startsWith("/enterprise/pages/warehouses/")
      ) {
        const target =
          pathname.replace(/^\/enterprise\/pages/, "/transit/pages") ||
          "/transit/pages";
        return NextResponse.redirect(new URL(target, req.url));
      }
      const rest = pathname.slice("/enterprise".length) || "";
      const target = `/transit${rest}` || "/transit";
      return NextResponse.redirect(new URL(target, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/role-setup",
    "/dashboard",
    "/dashboard/:path*",
    "/agent",
    "/agent/:path*",
    "/transit",
    "/transit/:path*",
    "/enterprise",
    "/enterprise/:path*",
  ],
};
