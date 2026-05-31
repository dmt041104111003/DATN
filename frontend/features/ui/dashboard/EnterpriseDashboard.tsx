"use client";

import { Grid, Stack, Typography } from "@mui/material";
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
import { WarehouseRoleDashboard } from "./AgentDashboard";
import { ChartCard, formatKg, MUTED, PRIMARY, SECONDARY, StatCard } from "./chartUi";

export function EnterpriseDashboard({ stats }: { stats: DashboardStats }) {
  const p = stats.production!;
  const c = stats.container!;

  const productionData = [
    { name: "Đang canh/cập nhật", value: p.created + p.updated },
    { name: "Đã đóng", value: p.closed },
  ];

  const containerData = [
    { name: "Đã xác thực", value: c.verified },
    { name: "Chưa xác thực", value: c.unverified },
    { name: "Trong kho", value: c.inStorage },
    { name: "Tiêu thụ", value: c.consumed },
    { name: "Ngoài kho", value: c.outStorage },
  ];

  const containerPie = [
    { name: "Trong kho", value: c.inStorage },
    { name: "Tiêu thụ", value: c.consumed },
    { name: "Khác", value: Math.max(c.total - c.inStorage - c.consumed, 0) },
  ].filter((row) => row.value > 0);

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Vụ mùa & thùng hàng
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Tổng vụ mùa" value={p.total} hint={`${p.closed} đã đóng`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Sản lượng thực tế" value={`${formatKg(p.actualYieldKg)} kg`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Tổng thùng" value={c.total} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Trạng thái vụ mùa">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Số vụ" fill={PRIMARY} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Phân bổ thùng hàng">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={containerPie.length ? containerPie : [{ name: "Chưa có", value: 1 }]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                  {(containerPie.length ? containerPie : [{ name: "Chưa có", value: 1 }]).map((_, i) => (
                    <Cell key={i} fill={[PRIMARY, SECONDARY, MUTED][i % 3]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <ChartCard title="Thùng hàng theo trạng thái" height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={containerData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-10} textAnchor="end" height={52} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" name="Số thùng" fill={SECONDARY} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <Typography variant="caption" color="text.secondary">
        Khối lượng trong kho: {formatKg(c.inStorageWeightKg)} kg / tổng {formatKg(c.totalWeightKg)} kg
      </Typography>

      <Typography variant="h6" sx={{ fontWeight: 700, pt: 1 }}>
        Kho lưu trữ
      </Typography>
      <WarehouseRoleDashboard stats={stats} showConsume />
    </Stack>
  );
}
