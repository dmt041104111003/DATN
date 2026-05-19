"use client";

import type { ReactNode } from "react";
import { Layout, type LayoutProps } from "react-admin";
import { DashboardOverview } from "@/features/ui/dashboard/DashboardOverview";
import { AdminMenu } from "./AdminMenu";

export function AdminLayout(props: LayoutProps) {
  return (
    <div className="mil-admin">
      <Layout {...props} menu={AdminMenu} />
    </div>
  );
}

export function AdminWelcome(): ReactNode {
  return <DashboardOverview />;
}
