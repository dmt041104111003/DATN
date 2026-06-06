"use client";

import { Box, Grid, Stack, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardStats } from "@/hooks/useDashboardStats";
import { ChartCard, formatKg, MUTED, PRIMARY, SECONDARY, StatCard } from "./chartUi";

export function WarehouseRoleDashboard({
  stats,
  showConsume,
}: {
  stats: DashboardStats;
  showConsume: boolean;
}) {
  const w = stats.warehouse;

  const flowData = showConsume
    ? [
        { metric: "Nhập hôm nay", value: w.insToday },
        { metric: "Nhập 7 ngày", value: w.insLast7Days },
        { metric: "Tiêu hôm nay", value: w.consumedToday },
        { metric: "Tiêu 7 ngày", value: w.consumedLast7Days },
      ]
    : [
        { metric: "Nhập hôm nay", value: w.insToday },
        { metric: "Nhập 7 ngày", value: w.insLast7Days },
      ];

  const capacityData = [
    { name: "Đã dùng", value: w.usedKg },
    { name: "Còn trống", value: Math.max(0, w.remainingKg) },
  ];

  const utilizationData = stats.warehouseUtilization.map((row) => ({
    name: row.name.length > 14 ? `${row.name.slice(0, 14)}…` : row.name,
    fullName: row.name,
    percent: row.utilizationPercent,
  }));

  const activityData = stats.activityByDay.map((row) => {
    const point: { date: string; Nhập: number; Tiêu?: number } = {
      date: row.date.slice(5),
      Nhập: row.warehouseIn,
    };
    if (showConsume) point.Tiêu = row.consume || 0;
    return point;
  });

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard label="Số kho" value={w.warehouseCount} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard label="Thùng trong kho" value={w.inStorageCount} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard label="Chờ xác thực" value={stats.pendingVerification} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            label="Sức chứa"
            value={`${w.utilizationPercent}%`}
            hint={`${formatKg(w.usedKg)} / ${formatKg(w.totalCapacityKg)} kg`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, md: 4 }}>
          <ChartCard title="Phân bổ sức chứa" height={120}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={capacityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={48}
                  paddingAngle={2}
                >
                  <Cell fill={PRIMARY} />
                  <Cell fill={MUTED} />
                </Pie>
                <Tooltip formatter={(v) => `${formatKg(Number(v ?? 0))} kg`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title={showConsume ? "Nhập kho & tiêu thụ" : "Nhập kho"}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={56} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Số lượng" fill={PRIMARY} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Mức sử dụng từng kho">
            {utilizationData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={utilizationData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) => `${Number(v ?? 0)}%`}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullName ? String(payload[0].payload.fullName) : ""
                    }
                  />
                  <Bar dataKey="percent" name="Sử dụng" fill={PRIMARY} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                Chưa có kho nào.
              </Typography>
            )}
          </ChartCard>
        </Grid>
      </Grid>

      <ChartCard title="Hoạt động 7 ngày qua" height={320}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activityData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            {showConsume ? <Legend /> : null}
            <Bar dataKey="Nhập" fill={PRIMARY} radius={[4, 4, 0, 0]} />
            {showConsume ? <Bar dataKey="Tiêu" fill={SECONDARY} radius={[4, 4, 0, 0]} /> : null}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {showConsume ? (
        <Typography variant="caption" color="text.secondary">
          Tổng tiêu thụ: {w.consumedTotal}
        </Typography>
      ) : null}
    </Stack>
  );
}

export function AgentDashboard({ stats }: { stats: DashboardStats }) {
  return <WarehouseRoleDashboard stats={stats} showConsume />;
}
