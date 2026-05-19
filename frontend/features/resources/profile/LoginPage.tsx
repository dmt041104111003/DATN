"use client";

import * as React from "react";
import { Typography } from "@mui/material";
import { useNotify } from "react-admin";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { WalletPickerModal } from "@/components/WalletPickerModal";
import { ProfileResourceCreate } from "./ProfileResourceCreate";

function homePathForRole(role: string | null | undefined) {
  const code = String(role || "").toUpperCase();
  if (code === "TRANSIT") return "/transit";
  if (code === "AGENT") return "/agent";
  return "/enterprise";
}

export function AdminLoginPage() {
  const notify = useNotify();
  const { loginWithWallet, isLoading, error, setup, setupDefaults } = useWalletAuth();
  const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb] px-4">
      <div className="w-full max-w-5xl p-4">
        <div className="grid gap-2">
          <Typography variant="h6" fontWeight={700}>
            Đăng nhập quản trị
          </Typography>
          {!setup ? (
            <>
              <button
                type="button"
                onClick={() => setWalletPickerOpen(true)}
                disabled={isLoading}
                className="w-full rounded-md bg-[#c41e3a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isLoading ? "Đang kết nối ví..." : "Đăng nhập bằng ví"}
              </button>
              <WalletPickerModal
                open={walletPickerOpen}
                onClose={() => setWalletPickerOpen(false)}
                onSelect={(walletId) => {
                  setWalletPickerOpen(false);
                  void loginWithWallet(walletId);
                }}
                isLoading={isLoading}
              />
            </>
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

