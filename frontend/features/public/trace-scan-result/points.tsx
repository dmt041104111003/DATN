"use client";

import { Box, Typography } from "@mui/material";
import { GOV_RED, GOV_RED_DARK } from "@/features/public/shared/govTheme";
import { TraceSection } from "@/features/public/shared/TracePageShell";

type TracePoint = {
  name: string;
  walletAddress: string;
  location: string;
};

export default function TracePoints({ points, matchedIndex }: { points: TracePoint[]; matchedIndex: number }) {
  return (
    <TraceSection title="Đơn vị tham gia chuỗi">
      {points.map((point, index) => {
        const active = matchedIndex >= 0 && index <= matchedIndex;
        const lineActive = matchedIndex >= 0 && index < matchedIndex;
        return (
          <Box key={`${point.walletAddress}-${index}`} sx={{ display: "flex", alignItems: "stretch", minHeight: 52, mb: 0.5 }}>
            <Box sx={{ width: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: active ? GOV_RED : "#94a3a8",
                  bgcolor: active ? GOV_RED : "transparent",
                  mt: 0.25,
                }}
              />
              {index < points.length - 1 ? (
                <Box sx={{ width: 2, flex: 1, bgcolor: lineActive ? GOV_RED : "#cbd5e1", mt: 0.25 }} />
              ) : null}
            </Box>
            <Box sx={{ pl: 1, pb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: active ? GOV_RED_DARK : "text.primary" }}>
                {point.name || "Chưa có tên"}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", wordBreak: "break-all", fontFamily: "monospace" }}>
                {point.walletAddress}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                {point.location || "-"}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </TraceSection>
  );
}
