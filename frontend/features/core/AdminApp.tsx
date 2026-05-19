"use client";

import "@/features/ui/military/admin-mil.css";
import { Admin } from "react-admin";
import { milAdminTheme } from "@/features/ui/military/milTheme";
import { adminAuthProvider } from "./authProvider";
import { adminDataProvider } from "./dataProvider";
import { adminI18nProvider } from "./i18n/i18nProvider";
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
      i18nProvider={adminI18nProvider}
      theme={milAdminTheme}
      dashboard={AdminWelcome}
      layout={AdminLayout}
      loginPage={AdminLoginPage}
      requireAuth
    >
      {(permissions) => renderAdminResources(permissions as string)}
    </Admin>
  );
}
