 "use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LayoutDashboard, Boxes, Package, Archive, QrCode, Settings, LogOut, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  const isActive =
    href === "/dashboard"
      ? pathname === href
      : pathname === href || (pathname && pathname.startsWith(href + "/"));

  const baseClasses =
    "flex items-center gap-3 px-3 py-2 rounded-md text-base transition-colors";
  const activeClasses = "bg-red-50/80 text-[#c41e3a] font-semibold";
  const inactiveClasses =
    "text-gray-900 hover:bg-red-50/60 hover:text-[#c41e3a]";

  return (
    <Link
      href={href}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <span className="w-5 h-5 text-[#c41e3a]">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [roleCode, setRoleCode] = React.useState<string | null>(null);


  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const cookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("auth_token="));
    const token = cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
    if (!token) {
      router.replace("/");
      return;
    }
    const parts = token.split(".");
    if (parts.length < 2) {
      router.replace("/");
      return;
    }
    try {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );
      const json = atob(padded);
      const payload = JSON.parse(json) as { profileId?: unknown; role?: unknown; roleCode?: unknown };
      if (!payload.profileId) {
        router.replace("/role-setup");
        return;
      }
      const roleValue =
        (typeof payload.role === "string" && payload.role) ||
        (typeof (payload as any).roleCode === "string" && (payload as any).roleCode) ||
        null;
      if (roleValue) {
        setRoleCode(roleValue);
      }
      setReady(true);
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (!ready) {
    return null;
  }
  const canUseAssetTools = roleCode === "ENTERPRISE";
  const handleLogout = () => {
    if (typeof document !== "undefined") {
      document.cookie = "auth_token=; path=/; max-age=0";
    }
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("profile_setup");
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] text-gray-900">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 bg-white">
          <div className="px-5 py-5 border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <Image src="/logo.svg" alt="Admin logo" width={32} height={32} className="w-8 h-8 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500">Admin Console</p>
              <p className="text-base font-semibold text-gray-900 truncate">Traceability Ops</p>
            </div>
          </div>

          <nav className="px-4 py-4 space-y-1">
            <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />

            {canUseAssetTools && (
              <div className="mt-3">
                <p className="px-3 text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 mb-1">
                  Asset tools
                </p>
                <div className="space-y-1">
                  <NavItem href="/dashboard/asset-tools/mint" icon={<QrCode className="w-5 h-5" />} label="Assets" />
                  <NavItem href="/dashboard/asset-tools/asset-images" icon={<ImageIcon className="w-5 h-5" />} label="Asset images" />
                  <NavItem href="/dashboard/asset-tools/producers" icon={<QrCode className="w-5 h-5" />} label="Producers" />
                  <NavItem href="/dashboard/asset-tools/product-types" icon={<QrCode className="w-5 h-5" />} label="Product types" />
                  <NavItem href="/dashboard/asset-tools/certifications" icon={<QrCode className="w-5 h-5" />} label="Certifications" />
                </div>
              </div>
            )}

            <div className="mt-3">
              <p className="px-3 text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 mb-1">
                Operations
              </p>
              <div className="space-y-1">
                <NavItem href="/dashboard/warehouses" icon={<Boxes className="w-5 h-5" />} label="Warehouses" />
                <NavItem href="/dashboard/order" icon={<Package className="w-5 h-5" />} label="Order" />
                <NavItem href="/dashboard/burn" icon={<Archive className="w-5 h-5" />} label="Retire" />
              </div>
            </div>

            <div className="mt-3">
              <p className="px-3 text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 mb-1">
                Account
              </p>
              <div className="space-y-1">
                <NavItem href="/dashboard/profile" icon={<Shield className="w-5 h-5" />} label="Profile" />
              </div>
            </div>
          </nav>

          <div className="mt-auto px-4 py-4 border-t border-gray-200 space-y-1">
            <NavItem href="/dashboard" icon={<Settings className="w-5 h-5" />} label="Settings" />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base text-gray-900 hover:bg-red-50/60 hover:text-[#c41e3a] transition-colors"
            >
              <span className="w-5 h-5 text-[#c41e3a]">
                <LogOut className="w-5 h-5" />
              </span>
              <span className="font-medium">Log out</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 md:hidden">
            <div className="px-4 py-3 flex justify-end">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
              >
                <span className="material-icons text-xl text-gray-800">menu</span>
              </button>
            </div>
          </div>

          <main className="px-4 md:px-8 py-6">{children}</main>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            aria-hidden
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 right-0 z-50 w-64 h-full bg-white border-l border-gray-200 md:hidden header-drawer-right flex flex-col">
            <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 flex items-center justify-center overflow-hidden">
                  <Image src="/logo.svg" alt="Admin logo" width={28} height={28} className="w-7 h-7 object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm uppercase tracking-[0.18em] text-gray-500">Admin</p>
                  <p className="text-base font-semibold text-gray-900 truncate">Traceability Ops</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close navigation"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
              <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />

              {canUseAssetTools && (
                <div className="mt-3">
                  <p className="px-3 text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 mb-1">
                    Asset tools
                  </p>
                  <div className="space-y-1">
                    <NavItem href="/dashboard/asset-tools/mint" icon={<QrCode className="w-5 h-5" />} label="Assets" />
                    <NavItem href="/dashboard/asset-tools/asset-images" icon={<ImageIcon className="w-5 h-5" />} label="Asset images" />
                    <NavItem href="/dashboard/asset-tools/producers" icon={<QrCode className="w-5 h-5" />} label="Producers" />
                    <NavItem href="/dashboard/asset-tools/product-types" icon={<QrCode className="w-5 h-5" />} label="Product types" />
                    <NavItem href="/dashboard/asset-tools/certifications" icon={<QrCode className="w-5 h-5" />} label="Certifications" />
                  </div>
                </div>
              )}

              <div className="mt-3">
                <p className="px-3 text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 mb-1">
                  Operations
                </p>
                <div className="space-y-1">
                  <NavItem href="/dashboard/warehouses" icon={<Boxes className="w-5 h-5" />} label="Warehouses" />
                  <NavItem href="/dashboard/order" icon={<Package className="w-5 h-5" />} label="Order" />
                  <NavItem href="/dashboard/burn" icon={<Archive className="w-5 h-5" />} label="Retire" />
                </div>
              </div>

              <div className="mt-3">
                <p className="px-3 text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 mb-1">
                  Account
                </p>
                <div className="space-y-1">
                  <NavItem href="/dashboard/profile" icon={<Shield className="w-5 h-5" />} label="Profile" />
                </div>
              </div>
            </nav>

            <div className="px-3 py-4 border-t border-gray-200 space-y-1">
              <NavItem href="/dashboard" icon={<Settings className="w-5 h-5" />} label="Settings" />
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base text-gray-900 hover:bg-red-50/60 hover:text-[#c41e3a] transition-colors"
              >
                <span className="w-5 h-5 text-[#c41e3a]">
                  <LogOut className="w-5 h-5" />
                </span>
                <span className="font-medium">Log out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

