"use client";

import { Admin } from "react-admin";
import { enterpriseAdminAuthProvider } from "./authProvider";
import { enterpriseAdminDataProvider } from "./dataProvider";
import { enterpriseAdminResources } from "./resources";
import {
  AdminWelcome,
  EnterpriseAdminLayout,
} from "@/features/enterprise-admin/ui/layout/AdminLayout";

export function AdminApp() {
  return (
    <Admin
      authProvider={enterpriseAdminAuthProvider}
      dataProvider={enterpriseAdminDataProvider}
      dashboard={AdminWelcome}
      layout={EnterpriseAdminLayout}
      requireAuth
    >
      {enterpriseAdminResources}
    </Admin>
  );
}
