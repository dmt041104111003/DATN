"use client";

import * as React from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { GOV_RED } from "@/features/public/shared/govTheme";
import { TracePageShell } from "@/features/public/shared/TracePageShell";
import TraceHistory from "./history";
import TraceLatestAction from "./latestAction";
import TracePoints from "./points";
import TraceInfo from "./traceInfo";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

type TraceView = {
  containerTitle: string;
  isConsumed: boolean;
  consumedAt: string;
  containerCode: string;
  containerType: string;
  weightPerBoxKg: string;
  points: Array<{
    name: string;
    walletAddress: string;
    location: string;
    locationText: string;
    roleText: string;
  }>;
  matchedIndex: number;
  latestAction: {
    signerName: string;
    signerRoleText: string;
    signerLocationText: string;
    storageOpText: string;
    signedAt: string;
  } | null;
  productionMetadata: Record<string, unknown> | null;
};

export default function PublicTraceScanResultPage({ inventoryKey }: { inventoryKey: string }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [trace, setTrace] = React.useState<TraceView | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const loadTrace = async () => {
      const key = cleanString(inventoryKey);
      if (!key) return;
      setBusy(true);
      setError("");
      try {
        const res = await fetch(`${BACKEND_URL}/trace/${encodeURIComponent(key)}`, { method: "GET" });
        if (!res.ok) throw new Error("Không gọi được API trace.");
        const json = (await res.json()) as any;
        const lotPassport = (json?.lotPassport || {}) as Record<string, unknown>;
        const pointsRaw: Array<{
          name: string;
          walletAddress: string;
          location: string;
          locationText: string;
          roleText: string;
        }> = Array.isArray(json?.points)
          ? json.points
              .map((x: any) => ({
                name: cleanString(x?.name),
                walletAddress: cleanString(x?.walletAddress).toLowerCase(),
                location: cleanString(x?.location),
                locationText: cleanString(x?.locationText || x?.location),
                roleText: cleanString(x?.roleText),
              }))
              .filter((x: any) => x.walletAddress)
          : [];
        const points = pointsRaw.map((x) => ({
          ...x,
          locationText: /^\d+\s*,\s*\d+\s*,\s*\d+$/.test(cleanString(x.locationText))
            ? "Chưa khai báo"
            : cleanString(x.locationText) || "Chưa khai báo",
        }));
        const latestActionRaw = json?.latestAction;
        const latestAction =
          latestActionRaw && typeof latestActionRaw === "object"
            ? {
                signerName: cleanString((latestActionRaw as any).signerName),
                signerRoleText: cleanString((latestActionRaw as any).signerRoleText),
                signerLocationText: /^\d+\s*,\s*\d+\s*,\s*\d+$/.test(
                  cleanString((latestActionRaw as any).signerLocationText),
                )
                  ? "Chưa khai báo"
                  : cleanString((latestActionRaw as any).signerLocationText) || "Chưa khai báo",
                storageOpText: cleanString((latestActionRaw as any).storageOpText),
                signedAt: cleanString((latestActionRaw as any).signedAt),
              }
            : null;
        const latestSignerWallet = cleanString(
          (latestActionRaw as any)?.signerWallet || json?.latestSignerWallet,
        ).toLowerCase();
        if (!points.length) throw new Error(cleanString(json?.message) || "Không có dữ liệu point.");
        const signerIndex =
          latestSignerWallet && points.length
            ? points.findIndex((p) => p.walletAddress === latestSignerWallet)
            : -1;
        const matchedIndex = signerIndex >= 0 && signerIndex < points.length ? signerIndex : -1;
        const containerTitle = cleanString(lotPassport.product_name) || "Chưa có tên sản phẩm";
        const statusRaw = cleanString(lotPassport.status).toUpperCase();
        const isConsumed = statusRaw === "CONSUMED";
        const consumedAt = cleanString(
          lotPassport.storage_updated_at || lotPassport.updated_at || lotPassport.storage_created_at,
        );
        const containerCode = cleanString(lotPassport.container_code);
        const containerType = cleanString(lotPassport.container_type);
        const weightPerBoxKg = cleanString(
          lotPassport.weight_per_box_kg || lotPassport.actual_capacity_kg || lotPassport.capacity_kg,
        );
        const productionMetadataRaw =
          json?.productionMetadata && typeof json.productionMetadata === "object"
            ? (json.productionMetadata as Record<string, unknown>)
            : null;
        let productionMetadata = productionMetadataRaw;
        if (productionMetadataRaw) {
          const location = cleanString(productionMetadataRaw.location);
          productionMetadata = {
            ...productionMetadataRaw,
            location: /^\d+\s*,\s*\d+\s*,\s*\d+$/.test(location) ? "Chưa khai báo" : location || "Chưa khai báo",
          };
        }
        if (!mounted) return;
        setTrace({
          containerTitle,
          isConsumed,
          consumedAt,
          containerCode,
          containerType,
          weightPerBoxKg,
          points,
          matchedIndex,
          latestAction,
          productionMetadata,
        });
      } catch (e) {
        if (!mounted) return;
        setTrace(null);
        setError(e instanceof Error ? e.message : "Trace thất bại.");
      } finally {
        if (mounted) setBusy(false);
      }
    };
    void loadTrace();
    return () => {
      mounted = false;
    };
  }, [inventoryKey]);

  return (
    <TracePageShell title="Kết quả truy xuất" backHref="/trace-scan" backLabel="← Trở lại trang quét">
      {busy ? <Alert severity="info">Đang truy xuất...</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {trace ? (
        <Stack spacing={0}>
          <Typography variant="h5" sx={{ textAlign: "center", fontWeight: 700, color: GOV_RED, py: 1 }}>
            {trace.containerTitle}
            {trace.isConsumed ? (
              <Typography component="span" sx={{ ml: 1, color: GOV_RED, fontWeight: 700, fontSize: "0.9rem" }}>
                (ĐÃ TIÊU THỤ)
              </Typography>
            ) : null}
          </Typography>
          <TraceInfo
            isConsumed={trace.isConsumed}
            consumedAt={trace.consumedAt}
            containerCode={trace.containerCode}
            containerType={trace.containerType}
            weightPerBoxKg={trace.weightPerBoxKg}
            productionMetadata={trace.productionMetadata}
          />
          <TraceLatestAction action={trace.latestAction} />
          <TracePoints points={trace.points} matchedIndex={trace.matchedIndex} />
          <TraceHistory inventoryKey={inventoryKey} />
        </Stack>
      ) : null}
    </TracePageShell>
  );
}
