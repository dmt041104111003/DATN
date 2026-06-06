"use client";

import { Box, Typography } from "@mui/material";
import { TraceSection } from "@/features/public/shared/TracePageShell";
import { GOV_RED } from "@/features/public/shared/govTheme";

export type TraceLatestActionView = {
  signerName: string;
  signerRoleText: string;
  signerLocationText: string;
  storageOpText: string;
  signedAt: string;
};

function formatDateTimeVi(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString("vi-VN");
}

export default function TraceLatestAction({ action }: { action: TraceLatestActionView | null }) {
  if (!action) return null;
  return (
    <TraceSection title="Xác nhận gần nhất">
      <Box sx={{ display: "grid", gap: 0.5 }}>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 700, color: GOV_RED }}>
            Người ký:
          </Box>{" "}
          {action.signerName || "Chưa rõ"}
        </Typography>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 700, color: GOV_RED }}>
            Vai trò:
          </Box>{" "}
          {action.signerRoleText || "Chưa rõ"}
        </Typography>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 700, color: GOV_RED }}>
            Địa điểm ký:
          </Box>{" "}
          {action.signerLocationText || "Chưa khai báo"}
        </Typography>
        {action.storageOpText ? (
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 700, color: GOV_RED }}>
              Thao tác:
            </Box>{" "}
            {action.storageOpText}
          </Typography>
        ) : null}
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 700, color: GOV_RED }}>
            Thời gian:
          </Box>{" "}
          {formatDateTimeVi(action.signedAt)}
        </Typography>
      </Box>
    </TraceSection>
  );
}
