"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useDashboardStats } from "@/hooks/useDashboardStats";

function formatKg(value: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value || 0);
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700 }}>
          {value}
        </Typography>
        {hint ? (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ActivityChart({
  title,
  rows,
  showConsume,
}: {
  title: string;
  rows: Array<{ date: string; warehouseIn: number; consume?: number }>;
  showConsume: boolean;
}) {
  const max = Math.max(1, ...rows.map((r) => Math.max(r.warehouseIn, r.consume || 0)));

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          {title}
        </Typography>
        <Stack spacing={1.5}>
          {rows.map((row) => (
            <Box key={row.date}>
              <Typography variant="caption" color="text.secondary">
                {row.date}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Typography variant="caption" sx={{ width: 48 }}>
                  Nhập
                </Typography>
                <Box sx={{ flex: 1, bgcolor: "#e5e7eb", borderRadius: 1, height: 8 }}>
                  <Box
                    sx={{
                      width: `${Math.round((row.warehouseIn / max) * 100)}%`,
                      bgcolor: "#c41e3a",
                      height: 8,
                      borderRadius: 1,
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ width: 24, textAlign: "right" }}>
                  {row.warehouseIn}
                </Typography>
              </Stack>
              {showConsume ? (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <Typography variant="caption" sx={{ width: 48 }}>
                    Tiêu
                  </Typography>
                  <Box sx={{ flex: 1, bgcolor: "#e5e7eb", borderRadius: 1, height: 8 }}>
                    <Box
                      sx={{
                        width: `${Math.round(((row.consume || 0) / max) * 100)}%`,
                        bgcolor: "#8f1529",
                        height: 8,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ width: 24, textAlign: "right" }}>
                    {row.consume || 0}
                  </Typography>
                </Stack>
              ) : null}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function EnterpriseDashboard({ stats }: { stats: NonNullable<ReturnType<typeof useDashboardStats>["stats"]> }) {
  const p = stats.production!;
  const c = stats.container!;
  const w = stats.warehouse;

  return (
    <Stack spacing={2}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Vụ mùa & thùng hàng
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Tổng vụ mùa" value={p.total} hint={`${p.closed} đã đóng`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Đang canh / cập nhật" value={p.created + p.updated} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Sản lượng thực tế" value={`${formatKg(p.actualYieldKg)} kg`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Chờ xác thực on-chain" value={stats.pendingVerification} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Tổng thùng" value={c.total} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Đã xác thực" value={c.verified} hint={`${c.unverified} chưa xác thực`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Trong kho" value={c.inStorage} hint={`${formatKg(c.inStorageWeightKg)} kg`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Đã tiêu thụ" value={c.consumed} hint={`${c.outStorage} ngoài kho`} />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 700, pt: 1 }}>
        Kho lưu trữ
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Số kho" value={w.warehouseCount} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Thùng trong kho" value={w.inStorageCount} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Sức chứa"
            value={`${formatKg(w.usedKg)} / ${formatKg(w.totalCapacityKg)} kg`}
            hint={`Còn ${formatKg(w.remainingKg)} kg`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Nhập kho hôm nay" value={w.insToday} hint={`7 ngày: ${w.insLast7Days}`} />
        </Grid>
      </Grid>
    </Stack>
  );
}

function LogisticsDashboard({
  stats,
  showConsume,
}: {
  stats: NonNullable<ReturnType<typeof useDashboardStats>["stats"]>;
  showConsume: boolean;
}) {
  const w = stats.warehouse;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard label="Số kho" value={w.warehouseCount} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard label="Thùng trong kho" value={w.inStorageCount} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          label="Sức chứa"
          value={`${w.utilizationPercent}%`}
          hint={`${formatKg(w.usedKg)} / ${formatKg(w.totalCapacityKg)} kg`}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard label="Chờ xác thực" value={stats.pendingVerification} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard label="Nhập kho hôm nay" value={w.insToday} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard label="Nhập kho 7 ngày" value={w.insLast7Days} />
      </Grid>
      {showConsume ? (
        <>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Tiêu thụ hôm nay" value={w.consumedToday} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Tiêu thụ 7 ngày" value={w.consumedLast7Days} hint={`Tổng: ${w.consumedTotal}`} />
          </Grid>
        </>
      ) : null}
    </Grid>
  );
}

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
  const showConsume = isEnterprise || isAgent;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Tổng quan
      </Typography>

      {isEnterprise ? <EnterpriseDashboard stats={stats} /> : <LogisticsDashboard stats={stats} showConsume={isAgent} />}

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Mức sử dụng từng kho
              </Typography>
              {stats.warehouseUtilization.length ? (
                <Stack spacing={2}>
                  {stats.warehouseUtilization.map((row) => (
                    <Box key={row.id}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2">{row.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatKg(row.usedKg)} / {formatKg(row.capacityKg)} kg ({row.utilizationPercent}%)
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={row.utilizationPercent}
                        color={row.utilizationPercent >= 80 ? "warning" : "primary"}
                      />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có kho nào.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ActivityChart title="Hoạt động 7 ngày qua" rows={stats.activityByDay} showConsume={showConsume} />
        </Grid>
      </Grid>
    </Box>
  );
}
