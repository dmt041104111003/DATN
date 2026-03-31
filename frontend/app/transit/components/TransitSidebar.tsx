"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, LayoutDashboard, LogOut, ScanLine, Settings, Shield } from "lucide-react";

import { TRANSIT_ROUTES } from "@/app/transit/constants/routes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === TRANSIT_ROUTES.home) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TransitSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeMobileSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="min-w-0 overflow-x-hidden border-b border-sidebar-border">
        <div className="flex min-w-0 items-center gap-3 px-2 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
            <Image
              src="/logo.svg"
              alt=""
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Transit
            </p>
            <p className="truncate text-sm font-semibold">Traceability Ops</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActivePath(pathname, TRANSIT_ROUTES.home)}
                  tooltip="Home"
                >
                  <Link href={TRANSIT_ROUTES.home} onClick={closeMobileSidebar}>
                    <LayoutDashboard />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActivePath(pathname, TRANSIT_ROUTES.warehouses)}
                  tooltip="Warehouses"
                >
                  <Link
                    href={TRANSIT_ROUTES.warehouses}
                    onClick={closeMobileSidebar}
                  >
                    <Boxes />
                    <span>Warehouses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActivePath(pathname, TRANSIT_ROUTES.scanCheckin)}
                  tooltip="QR inbound check-in"
                >
                  <Link
                    href={TRANSIT_ROUTES.scanCheckin}
                    onClick={closeMobileSidebar}
                  >
                    <ScanLine />
                    <span>Inbound QR</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActivePath(pathname, TRANSIT_ROUTES.profile)}
                  tooltip="Profile"
                >
                  <Link
                    href={TRANSIT_ROUTES.profile}
                    onClick={closeMobileSidebar}
                  >
                    <Shield />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href={TRANSIT_ROUTES.home} onClick={closeMobileSidebar}>
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                closeMobileSidebar();
                onLogout();
              }}
              tooltip="Log out"
              className="text-sidebar-foreground"
            >
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
