"use client";

import * as React from "react";
import { Alert, Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { Scanner } from "@yudiel/react-qr-scanner";
import Link from "next/link";
import { useRouter } from "next/navigation";

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

export default function PublicTraceScanPage() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const scanGuardRef = React.useRef(false);

  const goToTraceResult = React.useCallback(async (inventoryKeyRaw: string) => {
    const inventoryKey = cleanString(inventoryKeyRaw);
    if (!inventoryKey) return;
    if (scanGuardRef.current) return;
    scanGuardRef.current = true;
    setBusy(true);
    setError("");
    try {
      router.push(`/trace-scan/${encodeURIComponent(inventoryKey)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Trace thất bại.");
    } finally {
      setBusy(false);
      window.setTimeout(() => {
        scanGuardRef.current = false;
      }, 800);
    }
  }, [router]);

  return (
    <Box
      sx={{
        height: "100dvh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        overflow: "hidden",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 680 }}>
        <CardContent>
          <Stack spacing={2}>
            <Link href="/" className="text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900">
              Trở lại trang chủ
            </Link>
            <Typography variant="h6">Truy xuất nguồn gốc</Typography>
            <Box sx={{ width: "100%", maxWidth: 460, mx: "auto" }}>
              <Scanner
                onScan={(result) => {
                  const raw = Array.isArray(result) && result[0] ? result[0].rawValue : "";
                  void goToTraceResult(raw);
                }}
                onError={() => undefined}
              />
            </Box>
            {busy ? <Alert severity="info">Đang truy xuất...</Alert> : null}
            {error ? <Alert severity="error">{error}</Alert> : null}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

