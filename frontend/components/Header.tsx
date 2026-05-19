"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { WalletPickerModal } from "./WalletPickerModal";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

function homePathForRole(role: string | null | undefined) {
  const code = String(role || "").toUpperCase();
  if (code === "TRANSIT") return "/transit";
  if (code === "AGENT") return "/agent";
  return "/enterprise";
}

const MENU = [
  { id: "home", label: "Trang chủ", href: "/" },
  { id: "trace-scan", label: "Quét truy xuất", href: "/trace-scan" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { loginWithWallet, isLoading, error } = useWalletAuth();
  const [walletPickerOpen, setWalletPickerOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [hasRole, setHasRole] = React.useState(false);

  const fetchMe = React.useCallback(async () => {
    const res = await fetch(`${BACKEND_URL}/auth/me`, { credentials: "include" });
    if (!res.ok) return null;
    return (await res.json()) as {
      user?: { role?: string | null; roleCode?: string | null } | null;
      profile?: { roleCode?: string | null; displayName?: string | null } | null;
    };
  }, []);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await fetchMe();
        if (!data?.user) {
          setIsAuthenticated(false);
          setHasRole(false);
          return;
        }
        setIsAuthenticated(true);
        setHasRole(Boolean(data?.profile?.roleCode || data?.user?.roleCode || data?.user?.role));
      } catch {
        setIsAuthenticated(false);
        setHasRole(false);
      }
    };
    checkAuth();
  }, [fetchMe]);

  const handleLogin = () => {
    setWalletPickerOpen(true);
  };

  const handleWalletSelect = async (walletId: string) => {
    setWalletPickerOpen(false);
    await loginWithWallet(walletId);
  };

  const handleDashboardClick = async () => {
    try {
      const data = await fetchMe();
      if (!data?.user) {
        window.location.href = "/";
        return;
      }
      const roleCode = data?.profile?.roleCode || data?.user?.roleCode || data?.user?.role;
      const target = roleCode ? homePathForRole(roleCode) : "/admin#/login";
      window.location.href = target;
    } catch {
      window.location.href = "/";
    }
  };

  const activeId =
    pathname === "/"
      ? "home"
      : pathname.startsWith("/trace-scan")
        ? "trace-scan"
        : pathname.startsWith("/admin") ||
            pathname.startsWith("/enterprise") ||
            pathname.startsWith("/transit") ||
            pathname.startsWith("/agent")
          ? "dashboard"
          : null;

  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    if (error) alert(error);
  }, [error]);

  const navLinkClass = (active: boolean) =>
    `text-sm md:text-base font-semibold tracking-wide transition-colors ${
      active ? "underline underline-offset-4 text-[#ffd89b]" : "text-white hover:text-[#ffd89b]"
    }`;

  return (
    <div className="gov-header fixed top-0 left-0 right-0 z-50 m-0 p-0">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between px-4 md:px-10 py-3.5 md:py-4">
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Image src="/gov.png" alt="Logo" width={52} height={52} className="w-11 h-11 object-contain rounded-sm" priority />
            <span className="hidden sm:inline text-base md:text-lg font-bold text-white tracking-wide">
              UTC
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex-shrink-0 p-2 rounded-sm hover:bg-white/10"
            aria-label="Mở menu"
          >
            <span className="material-icons text-2xl text-white">menu</span>
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {MENU.map((item) => (
            <Link key={item.id} href={item.href} className="header-nav-item px-3 py-1.5">
              <span className={navLinkClass(activeId === item.id)}>{item.label}</span>
            </Link>
          ))}
          <button
            type="button"
            onClick={isAuthenticated ? handleDashboardClick : handleLogin}
            className="header-nav-item px-3 py-1.5 bg-transparent border-none cursor-pointer"
            disabled={isLoading}
          >
            <span className={`${navLinkClass(activeId === "dashboard")} ${isLoading ? "opacity-60" : ""}`}>
              {isLoading ? "..." : isAuthenticated ? (hasRole ? "Quản trị" : "Hoàn tất hồ sơ") : "Đăng nhập"}
            </span>
          </button>
        </nav>
      </div>

      {mobileMenuOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" aria-hidden onClick={() => setMobileMenuOpen(false)} />
          <div className="gov-header gov-header-mobile fixed top-0 right-0 z-50 w-full max-w-sm h-full md:hidden flex flex-col header-drawer-right bg-gradient-to-b from-[#8f1529] to-[#6b1020]">
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-[#d4af37]/40">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <Image src="/gov.png" alt="Logo" width={44} height={44} className="w-10 h-10 object-contain rounded-sm" />
                <span className="text-sm font-bold text-white">Truy xuất nguồn gốc</span>
              </Link>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-2 text-white" aria-label="Đóng">
                <span className="material-icons">close</span>
              </button>
            </div>
            <nav className="flex-1 p-3 flex flex-col gap-1 overflow-auto">
              {MENU.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-sm text-white font-medium ${activeId === item.id ? "bg-white/15" : "hover:bg-white/10"}`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) handleDashboardClick();
                  else handleLogin();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-3 rounded-sm text-left text-white font-medium hover:bg-white/10"
                disabled={isLoading}
              >
                {isLoading ? "..." : isAuthenticated ? (hasRole ? "Quản trị" : "Hoàn tất hồ sơ") : "Đăng nhập"}
              </button>
            </nav>
          </div>
        </>
      ) : null}

      <WalletPickerModal
        open={walletPickerOpen}
        onClose={() => setWalletPickerOpen(false)}
        onSelect={(walletId) => void handleWalletSelect(walletId)}
        isLoading={isLoading}
      />
    </div>
  );
}
