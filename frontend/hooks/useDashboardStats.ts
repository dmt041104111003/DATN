"use client";

import * as React from "react";
import { usePermissions } from "react-admin";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export type DashboardStats = {
  role: string;
  production?: {
    total: number;
    created: number;
    updated: number;
    closed: number;
    actualYieldKg: number;
  };
  container?: {
    total: number;
    verified: number;
    unverified: number;
    inStorage: number;
    outStorage: number;
    consumed: number;
    totalWeightKg: number;
    inStorageWeightKg: number;
  };
  warehouse: {
    warehouseCount: number;
    inStorageCount: number;
    totalCapacityKg: number;
    usedKg: number;
    remainingKg: number;
    utilizationPercent: number;
    insToday: number;
    insLast7Days: number;
    consumedToday: number;
    consumedLast7Days: number;
    consumedTotal: number;
  };
  warehouseUtilization: Array<{
    id: string;
    name: string;
    capacityKg: number;
    usedKg: number;
    utilizationPercent: number;
  }>;
  activityByDay: Array<{
    date: string;
    warehouseIn: number;
    consume?: number;
  }>;
  pendingVerification: number;
};

export function useDashboardStats() {
  const { permissions } = usePermissions();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    fetch(`${BACKEND_URL}/dashboard/stats`, { method: "GET", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((json) => {
        if (!mounted) return;
        setStats(json as DashboardStats);
      })
      .catch((e) => {
        if (!mounted) return;
        setStats(null);
        setError(e instanceof Error ? e.message : "Không tải được thống kê.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [permissions]);

  return { stats, loading, error };
}
