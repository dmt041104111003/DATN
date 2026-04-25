"use client";

import type { ReactNode } from "react";
import { Layout, type LayoutProps } from "react-admin";
import { AdminMenu } from "./AdminMenu";

export function AdminLayout(props: LayoutProps) {
  return <Layout {...props} menu={AdminMenu} />;
}

export function AdminWelcome(): ReactNode {
  return (
    <div style={{ padding: 16 }}>
      <h2>Admin</h2>
      <p>Use the left menu to manage resources.</p>
    </div>
  );
}
