"use client";

import { Admin } from "react-admin";
import { adminAuthProvider } from "./authProvider";
import { adminDataProvider } from "./dataProvider";
import { renderAdminResources } from "./resources";
import { AdminLoginPage } from "@/features/resources/profile/LoginPage";
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
      loginPage={AdminLoginPage}
      requireAuth
    >
      {(permissions) => renderAdminResources(permissions as string)}
    </Admin>
  );
}
