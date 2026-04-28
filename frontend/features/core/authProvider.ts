"use client";

import type { AuthProvider } from "react-admin";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type MeResponse = {
  user?: {
    profileId?: string | null;
    role?: string | null;
    roleCode?: string | null;
    displayName?: string | null;
    walletAddress?: string | null;
  } | null;
  profile?: {
    displayName?: string | null;
    walletAddress?: string | null;
    roleCode?: string | null;
  } | null;
};

export async function getMe(): Promise<MeResponse> {
  const res = await fetch(`${BACKEND_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Unauthorized");
  }
  return (await res.json()) as MeResponse;
}

export const adminAuthProvider: AuthProvider = {
  async login() {
    return Promise.resolve();
  },
  async logout() {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    if (typeof window !== "undefined") {
      window.location.assign("/");
    }
    return false;
  },
  async checkAuth() {
    const data = await getMe();
    const hasProfile = Boolean(data?.user?.profileId);
    const onSetupPage =
      typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/admin") ||
        window.location.pathname.startsWith("/enterprise") ||
        window.location.pathname.startsWith("/transit") ||
        window.location.pathname.startsWith("/agent")) &&
      window.location.hash.includes("/login");

    if (!hasProfile && !onSetupPage) {
      throw new Error("Missing profile");
    }
    return Promise.resolve();
  },
  async checkError() {
    return Promise.resolve();
  },
  async getIdentity() {
    const data = await getMe();
    const fullName =
      String(data?.profile?.displayName || data?.user?.displayName || "").trim() ||
      String(data?.profile?.walletAddress || data?.user?.walletAddress || "Người dùng");
    return {
      id: String(data?.user?.profileId ?? "unknown"),
      fullName,
    };
  },
  async getPermissions() {
    const data = await getMe();
    return data?.user?.roleCode ?? data?.user?.role ?? null;
  },
};
