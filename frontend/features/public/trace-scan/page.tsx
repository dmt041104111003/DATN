"use client";

import * as React from "react";
import { Alert, Box } from "@mui/material";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";
import { TracePageShell } from "@/features/public/shared/TracePageShell";

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

export default function PublicTraceScanPage() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const scanGuardRef = React.useRef(false);

  const goToTraceResult = React.useCallback(
    async (inventoryKeyRaw: string) => {
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
    },
    [router],
  );

  return (
    <TracePageShell title="Truy xuất nguồn gốc" backHref="/" backLabel="← Trở lại trang chủ" compact>
      <Box sx={{ width: "100%", maxWidth: 460, mx: "auto", border: "2px solid #c41e3a", borderRadius: "2px", overflow: "hidden" }}>
        <Scanner
          onScan={(result) => {
            const raw = Array.isArray(result) && result[0] ? result[0].rawValue : "";
            void goToTraceResult(raw);
          }}
          onError={() => undefined}
        />
      </Box>
      {busy ? <Alert severity="info" sx={{ mt: 2 }}>Đang truy xuất...</Alert> : null}
      {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
    </TracePageShell>
  );
}
