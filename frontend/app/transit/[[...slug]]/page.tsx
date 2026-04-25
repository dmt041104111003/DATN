"use client";

import dynamic from "next/dynamic";

const AdminApp = dynamic(
  () =>
    import("@/features/core/AdminApp").then((m) => m.AdminApp),
  { ssr: false },
);

export default function TransitCatchAllPage() {
  return <AdminApp />;
}

