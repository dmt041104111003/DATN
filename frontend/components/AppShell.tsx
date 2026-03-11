"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isProduct = pathname?.startsWith("/product");
  const isRoleSetup = pathname === "/role-setup";
  const isScan = pathname === "/scan";
  const isCreate = pathname === "/create";

  if (isDashboard || isProduct || isRoleSetup || isScan || isCreate)
    return <>{children}</>;

  return (
    <>
      <Header />
      <div className="pt-[72px] md:pt-[88px] min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </>
  );
}

