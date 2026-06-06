"use client";

import * as React from "react";
import { useLogout, useNotify } from "react-admin";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { WalletPickerModal } from "@/components/WalletPickerModal";
import { AuthPageShell } from "./AuthPageShell";
import { ProfileResourceCreate } from "./ProfileResourceCreate";

function homePathForRole(role: string | null | undefined) {
  const code = String(role || "").toUpperCase();
  if (code === "TRANSIT") return "/transit";
  if (code === "AGENT") return "/agent";
  return "/enterprise";
}

export function AdminLoginPage() {
  const notify = useNotify();
  const logout = useLogout();
  const { loginWithWallet, isLoading, error, setup, setupDefaults } = useWalletAuth();
  const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);

  const handleLogout = React.useCallback(() => {
    window.sessionStorage.removeItem("pending_profile_setup");
    logout();
  }, [logout]);

  return (
    <AuthPageShell
      title={setup ? "Đăng ký tài khoản" : "Đăng nhập hệ thống"}
      subtitle={
        setup
          ? "Hoàn tất hồ sơ và thông tin kho để sử dụng hệ thống truy xuất."
          : "Kết nối ví Cardano để truy cập bảng điều khiển."
      }
      onLogout={setup ? handleLogout : undefined}
    >
      {!setup ? (
        <>
          <div className="p-4">
            <button
              type="button"
              onClick={() => setWalletPickerOpen(true)}
              disabled={isLoading}
              className="auth-page__login-btn"
            >
              {isLoading ? "Đang kết nối ví..." : "Đăng nhập bằng ví"}
            </button>
            {error ? <p className="auth-page__error">{error}</p> : null}
          </div>
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
        <ProfileResourceCreate
          key={setup.walletAddress}
          embedded
          resource="profile"
          mutationOptions={{
            onSuccess: async (data: any) => {
              window.sessionStorage.removeItem("pending_profile_setup");
              const roleCode =
                data?.roleCode || data?.role || data?.profile?.roleCode;
              if (roleCode) {
                window.location.assign(homePathForRole(roleCode));
                return;
              }
              const meRes = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"}/auth/me`,
                { credentials: "include", cache: "no-store" },
              );
              if (meRes.ok) {
                const me = await meRes.json();
                const resolved =
                  me?.profile?.roleCode || me?.user?.roleCode || me?.user?.role;
                if (resolved) {
                  window.location.assign(homePathForRole(resolved));
                  return;
                }
              }
              notify("Đã tạo hồ sơ. Vui lòng đăng nhập lại bằng ví.", { type: "warning" });
            },
            onError: (e: any) => {
              notify(String(e?.message || "Tạo hồ sơ thất bại"), { type: "error" });
            },
          }}
          redirect={false}
          defaultValues={setupDefaults}
        />
      )}
    </AuthPageShell>
  );
}
