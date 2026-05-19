"use client";

import * as React from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { getDistrictOptions, getProvinceOptions, getWardOptions } from "@/features/resources/shared/location";
import { GOV_RED } from "@/features/public/shared/govTheme";
import { TracePageShell } from "@/features/public/shared/TracePageShell";
import TraceHistory from "./history";
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
  points: Array<{ name: string; walletAddress: string; location: string }>;
  matchedIndex: number;
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
        const pointsRaw: Array<{ name: string; walletAddress: string; location: string }> = Array.isArray(json?.points)
          ? json.points
              .map((x: any) => ({
                name: cleanString(x?.name),
                walletAddress: cleanString(x?.walletAddress).toLowerCase(),
                location: cleanString(x?.location),
              }))
              .filter((x: any) => x.walletAddress)
          : [];
        const points = await Promise.all(
          pointsRaw.map(async (x) => {
            const text = cleanString(x.location);
            const parts = text.split(",").map((v) => cleanString(v)).filter(Boolean);
            if (parts.length < 3) return x;
            const [provinceId, districtId, wardId] = parts;
            try {
              const provinces = await getProvinceOptions();
              const provinceName = provinces.find((v) => cleanString(v.id) === provinceId)?.name || provinceId;
              const districts = await getDistrictOptions(provinceId);
              const districtName = districts.find((v) => cleanString(v.id) === districtId)?.name || districtId;
              const wards = await getWardOptions(districtId);
              const wardName = wards.find((v) => cleanString(v.id) === wardId)?.name || wardId;
              return { ...x, location: `${wardName}, ${districtName}, ${provinceName}` };
            } catch {
              return x;
            }
          }),
        );
        const latestSignerWallet = cleanString(json?.latestSignerWallet).toLowerCase();
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
          const text = cleanString(productionMetadataRaw.location);
          const parts = text.split(",").map((v) => cleanString(v)).filter(Boolean);
          if (parts.length >= 3) {
            const [provinceId, districtId, wardId] = parts;
            try {
              const provinces = await getProvinceOptions();
              const provinceName = provinces.find((v) => cleanString(v.id) === provinceId)?.name || provinceId;
              const districts = await getDistrictOptions(provinceId);
              const districtName = districts.find((v) => cleanString(v.id) === districtId)?.name || districtId;
              const wards = await getWardOptions(districtId);
              const wardName = wards.find((v) => cleanString(v.id) === wardId)?.name || wardId;
              productionMetadata = {
                ...productionMetadataRaw,
                location: `${wardName}, ${districtName}, ${provinceName}`,
              };
            } catch {
              productionMetadata = productionMetadataRaw;
            }
          }
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
          <TracePoints points={trace.points} matchedIndex={trace.matchedIndex} />
          <TraceHistory inventoryKey={inventoryKey} />
        </Stack>
      ) : null}
    </TracePageShell>
  );
}
