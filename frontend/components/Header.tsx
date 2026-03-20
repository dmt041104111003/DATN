"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useWalletAuth } from "../hooks/useWalletAuth";

const MENU = [
  { id: "home", label: "Home", href: "/" },
  { id: "create", label: "Create", href: "/create" },
  { id: "scan", label: "Scan", href: "/scan" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { loginWithEternl, isLoading, error } = useWalletAuth();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const BACKEND_URL =
          process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
        });
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    loginWithEternl();
  };

  const handleDashboardClick = () => {
    window.location.href = '/dashboard';
  };

  const activeId =
    pathname === "/"
      ? "home"
      : pathname.startsWith("/create")
      ? "create"
      : pathname.startsWith("/scan")
      ? "scan"
      : pathname.startsWith("/dashboard")
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
    if (error) {
      alert(error);
    }
  }, [error]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 m-0 p-0 bg-white">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between px-4 md:px-10 py-3.5 md:py-5">
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="Logo" width={56} height={56} className="w-12 h-12 object-contain" priority />
            <span className="hidden sm:inline text-base md:text-lg font-semibold text-gray-900">
              Traceability
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex-shrink-0 p-2 rounded-full hover:bg-black/10"
            aria-label="Menu"
          >
            <span className="material-icons text-2xl text-gray-800">
              menu
            </span>
          </button>
        </div>

        <nav className="hidden md:flex items-center">
          <div className="flex gap-2 md:gap-3">
            {MENU.map((item) => {
              const isActive = activeId === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="header-nav-item flex items-center gap-1 px-3 py-1 md:py-1.5 text-sm md:text-base font-medium transition-all"
                >
                    <span
                      className={`${
                        isActive
                          ? "underline underline-offset-4 text-red-400"
                          : "text-gray-800"
                      } hover:underline hover:underline-offset-4`}
                    >
                    {item.label}
                  </span>
                </Link>
              );
            })}
            <button
              onClick={isAuthenticated ? handleDashboardClick : handleLogin}
              className="header-nav-item flex items-center gap-1 px-3 py-1 md:py-1.5 text-sm md:text-base font-medium transition-all bg-transparent border-none cursor-pointer"
              disabled={isLoading}
            >
              <span
                className={`${
                  pathname.startsWith("/dashboard")
                    ? "underline underline-offset-4 text-red-400"
                    : "text-gray-800"
                } hover:underline hover:underline-offset-4 ${isLoading ? "opacity-50" : ""}`}
              >
                {isLoading ? '...' : (isAuthenticated ? 'Dashboard' : 'Login')}
              </span>
            </button>
          </div>
        </nav>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            aria-hidden
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 z-50 w-full h-full md:hidden flex flex-col header-drawer-right bg-white">
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-gray-200">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Image src="/logo.png" alt="Logo" width={48} height={48} className="w-12 h-12 object-contain" />
                <span className="text-base font-semibold text-gray-900">
                  Traceability
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <span className="material-icons text-xl">
                  close
                </span>
              </button>
            </div>

            <nav className="flex-1 p-4 flex flex-col gap-1 overflow-auto">
              {MENU.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between w-full px-4 py-3 text-left rounded-lg transition-colors text-gray-800 hover:bg-gray-100 ${
                      isActive ? "bg-gray-100" : ""
                    }`}
                  >
                    <span className={`font-medium ${isActive ? "text-red-400 underline underline-offset-4" : ""}`}>
                      {item.label}
                    </span>
                    <span className="material-icons text-lg text-gray-500">
                      chevron_right
                    </span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    handleDashboardClick();
                  } else {
                    handleLogin();
                  }
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between w-full px-4 py-3 text-left rounded-lg transition-colors text-gray-800 hover:bg-gray-100 ${
                  pathname.startsWith("/dashboard") ? "bg-gray-100" : ""
                } ${isLoading ? "opacity-50" : ""}`}
                disabled={isLoading}
              >
                <span className={`font-medium ${pathname.startsWith("/dashboard") ? "text-red-400 underline underline-offset-4" : ""}`}>
                  {isLoading ? '...' : (isAuthenticated ? 'Dashboard' : 'Login')}
                </span>
                <span className="material-icons text-lg text-gray-500">
                  chevron_right
                </span>
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

