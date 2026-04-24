"use client";

import dynamic from "next/dynamic";

const AdminApp = dynamic(
  () =>
    import("@/features/enterprise-admin/core/AdminApp").then((m) => m.AdminApp),
  { ssr: false },
);

export default function EnterpriseAdminCatchAllPage() {
  return <AdminApp />;
}
