"use client";

import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { WarehouseRoleDashboard } from "./AgentDashboard";
import { EnterpriseDashboard } from "./EnterpriseDashboard";

export function DashboardOverview() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) return null;

  const role = String(stats.role || "").toUpperCase();
  const isEnterprise = role === "ENTERPRISE";
  const isAgent = role === "AGENT";
  const isTransit = role === "TRANSIT";

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Tổng quan
      </Typography>

      {isEnterprise ? (
        <EnterpriseDashboard stats={stats} />
      ) : isAgent || isTransit ? (
        <WarehouseRoleDashboard stats={stats} showConsume={isAgent} />
      ) : null}
    </Box>
  );
}
