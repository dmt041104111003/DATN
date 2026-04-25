"use client";

import { Admin } from "react-admin";
import { adminAuthProvider } from "./authProvider";
import { adminDataProvider } from "./dataProvider";
import { adminResources } from "./resources";
import {
  AdminWelcome,
  AdminLayout,
} from "@/features/ui/layout/AdminLayout";

export function AdminApp() {
  return (
    <Admin
      authProvider={adminAuthProvider}
      dataProvider={adminDataProvider}
      dashboard={AdminWelcome}
      layout={AdminLayout}
      requireAuth
    >
      {adminResources}
    </Admin>
  );
}
