"use client";

import { useEffect, useMemo, useState } from "react";
import { Typography } from "@mui/material";
import { useNotify } from "react-admin";
import { readSetupProfileState, useWalletAuth } from "@/hooks/useWalletAuth";
import { ProfileResourceCreate } from "./functions";
import { homePathForRole } from "@/lib/app-routes";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type RoleRow = { id: number; code: string; name?: string | null };

type SetupFormState = {
  walletAddress: string;
  roles: RoleRow[];
};

export function AdminLoginPage() {
  const notify = useNotify();
  const { loginWithEternl, isLoading, error } = useWalletAuth();
  const [setup, setSetup] = useState<SetupFormState | null>(null);
  const [roleCode, setRoleCode] = useState("");

  useEffect(() => {
    const hydrate = async () => {
      const pending = readSetupProfileState();
      if (pending) {
        setSetup(pending);
        setRoleCode(String(pending.roles?.[0]?.code || ""));
        return;
      }
      const meRes = await fetch(`${BACKEND_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      }).catch(() => null);
      if (!meRes?.ok) return;
      const meJson = (await meRes.json()) as any;
      if (meJson?.profile?.roleCode || meJson?.user?.roleCode || meJson?.user?.role) {
        window.location.assign("/admin");
        return;
      }
      const walletAddress = String(
        meJson?.user?.paymentAddress || meJson?.user?.walletAddress || meJson?.user?.sub || "",
      ).trim();
      if (!walletAddress) return;
      const rolesRes = await fetch(`${BACKEND_URL}/profile/roles`, {
        method: "GET",
        credentials: "include",
      }).catch(() => null);
      const roles = rolesRes?.ok ? ((await rolesRes.json()) as RoleRow[]) : [];
      setSetup({ walletAddress, roles: Array.isArray(roles) ? roles : [] });
      setRoleCode(String(roles?.[0]?.code || ""));
    };
    hydrate().catch(() => undefined);
  }, []);

  const setupDefaults = useMemo(
    () => ({
      walletAddress: setup?.walletAddress || "",
      displayName: "",
      roleCode: roleCode || String(setup?.roles?.[0]?.code || ""),
      phoneNumber: "",
      provinceId: "",
      districtId: "",
      wardId: "",
    }),
    [roleCode, setup?.roles, setup?.walletAddress],
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb] px-4">
      <div className="w-full max-w-5xl p-4">
        <div className="grid gap-2">
          <Typography variant="h6" fontWeight={700}>
            Đăng nhập quản trị
          </Typography>
          {!setup ? (
            <button
              type="button"
              onClick={loginWithEternl}
              disabled={isLoading}
              className="w-full rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isLoading ? "Đang kết nối ví..." : "Đăng nhập bằng ví"}
            </button>
          ) : (
            <>
              <ProfileResourceCreate
                key={setup.walletAddress}
                resource="profile"
                mutationOptions={{
                  onSuccess: (data: any) => {
                    window.sessionStorage.removeItem("pending_profile_setup");
                    const roleCode = data?.roleCode || data?.role;
                    window.location.assign(homePathForRole(roleCode));
                  },
                  onError: async (e: any) => {
                    notify(String(e?.message || "Tạo hồ sơ thất bại"), { type: "error" });
                  },
                }}
                transform={(data: any) => ({
                  roleCode: String(data?.roleCode || "").trim().toUpperCase(),
                  displayName: String(data?.displayName || "").trim(),
                  phoneNumber: String(data?.phoneNumber || "").trim() || undefined,
                  provinceId: String(data?.provinceId || "").trim(),
                  districtId: String(data?.districtId || "").trim(),
                  wardId: String(data?.wardId || "").trim(),
                })}
                redirect={false}
                defaultValues={setupDefaults}
              />
            </>
          )}
          {error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : null}
        </div>
      </div>
    </div>
  );
}

