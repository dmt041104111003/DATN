"use client";

import * as React from "react";
import { Box, Typography } from "@mui/material";

type TracePoint = {
  name: string;
  walletAddress: string;
  location: string;
};

export default function TracePoints({ points, matchedIndex }: { points: TracePoint[]; matchedIndex: number }) {
  return (
    <>
      {points.map((point, index) => {
        const active = matchedIndex >= 0 && index <= matchedIndex;
        const lineActive = matchedIndex >= 0 && index < matchedIndex;
        return (
          <Box key={`${point.walletAddress}-${index}`} sx={{ display: "flex", alignItems: "stretch", minHeight: 52 }}>
            <Box sx={{ width: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: active ? "primary.main" : "grey.500",
                  bgcolor: active ? "primary.main" : "transparent",
                  mt: 0.25,
                }}
              />
              {index < points.length - 1 ? (
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    bgcolor: lineActive ? "primary.main" : "grey.400",
                    mt: 0.25,
                  }}
                />
              ) : null}
            </Box>
            <Box sx={{ pl: 1, pb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {point.name || "Chưa có tên"}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", wordBreak: "break-all" }}>
                {point.walletAddress}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                {point.location || "-"}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </>
  );
}
