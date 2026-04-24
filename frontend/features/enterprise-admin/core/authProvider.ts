"use client";

import type { AuthProvider } from "react-admin";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type MeResponse = {
  user?: {
    profileId?: string | null;
    role?: string | null;
    roleCode?: string | null;
  } | null;
};

async function getMe(): Promise<MeResponse> {
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

export const enterpriseAdminAuthProvider: AuthProvider = {
  async login() {
    return Promise.resolve();
  },
  async logout() {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("profile_setup");
      window.location.assign("/");
    }
    return false;
  },
  async checkAuth() {
    const data = await getMe();
    if (!data?.user?.profileId) {
      throw new Error("Missing profile");
    }
    return Promise.resolve();
  },
  async checkError() {
    return Promise.resolve();
  },
  async getIdentity() {
    const data = await getMe();
    return {
      id: String(data?.user?.profileId ?? "unknown"),
      fullName: "Enterprise user",
    };
  },
  async getPermissions() {
    const data = await getMe();
    return data?.user?.roleCode ?? data?.user?.role ?? null;
  },
};
