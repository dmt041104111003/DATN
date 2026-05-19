"use client";

import type { ReactNode } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import Link from "next/link";
import {
  traceCardSx,
  traceHeaderSx,
  traceLinkSx,
  tracePageSx,
  traceSectionSx,
  traceSectionHeadSx,
} from "./govTheme";

export function TracePageShell({
  title,
  backHref,
  backLabel,
  children,
  compact,
}: {
  title: string;
  backHref: string;
  backLabel: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <Box
      sx={{
        ...tracePageSx,
        display: compact ? "flex" : "block",
        alignItems: compact ? "center" : undefined,
        justifyContent: compact ? "center" : undefined,
      }}
    >
      <Card sx={{ ...traceCardSx, maxWidth: compact ? 680 : traceCardSx.maxWidth }}>
        <Box sx={traceHeaderSx}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            {title}
          </Typography>
        </Box>
        <CardContent>
          <Link href={backHref} style={{ textDecoration: "none" }}>
            <Typography component="span" sx={traceLinkSx}>
              {backLabel}
            </Typography>
          </Link>
          <Box sx={{ mt: 2 }}>{children}</Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export function TraceSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box sx={{ mt: 2, ...traceSectionSx }}>
      <Box sx={traceSectionHeadSx}>{title}</Box>
      <Box sx={{ p: 1.5 }}>{children}</Box>
    </Box>
  );
}
