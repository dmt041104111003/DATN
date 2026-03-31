"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { AgentSidebar } from "@/app/agent/components/AgentSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default function AgentLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const checkMe = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
        });
        if (!res.ok) {
          router.replace("/");
          return;
        }
        const data = (await res.json()) as {
          user?: { profileId?: string | null } | null;
        };
        if (!data?.user?.profileId) {
          router.replace("/role-setup");
          return;
        }
        setReady(true);
      } catch {
        router.replace("/");
      }
    };
    checkMe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("profile_setup");
      window.location.href = "/";
    }
  };

  if (!ready) {
    return (
      <SidebarProvider>
        <TooltipProvider>
          <div className="bg-background flex min-h-svh w-full items-center justify-center p-8">
            <div className="flex w-full max-w-md flex-col gap-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </TooltipProvider>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <TooltipProvider>
        <AgentSidebar onLogout={handleLogout} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
            <SidebarTrigger />
            <span className="text-muted-foreground text-sm font-medium">
              Menu
            </span>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">{children}</div>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
}
