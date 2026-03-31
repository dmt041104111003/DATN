"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPin,
  QrCode,
  Settings,
  Shield,
  Users,
} from "lucide-react";

import { ENTERPRISE_ROUTES } from "@/app/enterprise/constants/routes";
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
  if (href === ENTERPRISE_ROUTES.home) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type EnterpriseSidebarProps = {
  canUseProductMint: boolean;
  canUseProductCatalog: boolean;
  onLogout: () => void;
};

export function EnterpriseSidebar({
  canUseProductMint,
  canUseProductCatalog,
  onLogout,
}: EnterpriseSidebarProps) {
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
              Producer & enterprise
            </p>
            <p className="truncate text-sm font-semibold">Agri-food traceability</p>
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
                  isActive={isActivePath(pathname, ENTERPRISE_ROUTES.home)}
                  tooltip="Overview"
                >
                  <Link
                    href={ENTERPRISE_ROUTES.home}
                    onClick={closeMobileSidebar}
                  >
                    <LayoutDashboard />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {canUseProductMint && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Origin & issuance</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActivePath(
                        pathname,
                        ENTERPRISE_ROUTES.mint,
                      )}
                      tooltip="Register new containers"
                    >
                      <Link
                        href={ENTERPRISE_ROUTES.mint}
                        onClick={closeMobileSidebar}
                      >
                        <QrCode />
                        <span>Containers</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {canUseProductCatalog && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActivePath(pathname, ENTERPRISE_ROUTES.areas)}
                          tooltip="Register and manage growing areas"
                        >
                          <Link
                            href={ENTERPRISE_ROUTES.areas}
                            onClick={closeMobileSidebar}
                          >
                            <MapPin />
                            <span>Areas</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isActivePath(pathname, ENTERPRISE_ROUTES.plans)}
                          tooltip="Growing plans and expected outputs"
                        >
                          <Link
                            href={ENTERPRISE_ROUTES.plans}
                            onClick={closeMobileSidebar}
                          >
                            <ClipboardList />
                            <span>Plans</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Logistics & storage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActivePath(
                    pathname,
                    ENTERPRISE_ROUTES.warehouses,
                  )}
                  tooltip="Distribution warehouses & cold hubs"
                >
                  <Link
                    href={ENTERPRISE_ROUTES.warehouses}
                    onClick={closeMobileSidebar}
                  >
                    <Boxes />
                    <span>Warehouses</span>
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
                  isActive={isActivePath(
                    pathname,
                    ENTERPRISE_ROUTES.profile,
                  )}
                  tooltip="Profile"
                >
                  <Link
                    href={ENTERPRISE_ROUTES.profile}
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
              <Link
                href={ENTERPRISE_ROUTES.home}
                onClick={closeMobileSidebar}
              >
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
