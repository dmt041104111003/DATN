"use client";

import type { ReactNode } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

export const PRIMARY = "#c41e3a";
export const SECONDARY = "#8f1529";
export const MUTED = "#d1d5db";

export function formatKg(value: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value || 0);
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
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

export function ChartCard({ title, children, height = 280 }: { title: string; children: ReactNode; height?: number }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <Box sx={{ width: "100%", height }}>{children}</Box>
      </CardContent>
    </Card>
  );
}
