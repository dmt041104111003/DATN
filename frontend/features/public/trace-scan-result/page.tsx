"use client";

import * as React from "react";
import { Alert, Box, Card, CardContent, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { getDistrictOptions, getProvinceOptions, getWardOptions } from "@/features/resources/shared/location";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeTriple(raw: unknown) {
  const parts = cleanString(raw)
    .split(",")
    .map((x) => cleanString(x))
    .filter(Boolean);
  if (parts.length < 3) return "";
  return `${parts[0]}, ${parts[1]}, ${parts[2]}`;
}

function parseTripleList(raw: unknown): string[] {
  const text = cleanString(raw);
  if (!text) return [];
  return text
    .split(";")
    .map((x) => normalizeTriple(x))
    .filter(Boolean);
}

function parseWalletList(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((x) => cleanString(x).toLowerCase()).filter(Boolean);
  const text = cleanString(raw);
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map((x) => cleanString(x).toLowerCase()).filter(Boolean);
  } catch {}
  const matched = text.match(/addr_[a-z0-9]+/gi) || [];
  return Array.from(new Set(matched.map((x) => cleanString(x).toLowerCase()).filter(Boolean)));
}

type TraceView = {
  containerTitle: string;
  containerCode: string;
  containerType: string;
  capacityKg: string;
  actualCapacityKg: string;
  points: string[];
  matchedIndex: number;
};

type PointView = {
  idTriple: string;
  label: string;
};

export default function PublicTraceScanResultPage({ inventoryKey }: { inventoryKey: string }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [trace, setTrace] = React.useState<TraceView | null>(null);
  const [pointViews, setPointViews] = React.useState<PointView[]>([]);

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
        const points = parseTripleList(lotPassport.participant_location_labels);
        const wallets = parseWalletList(lotPassport.participant_wallet_addresses);
        const latestSignerWallet = cleanString(json?.latestSignerWallet).toLowerCase();
        if (!points.length) {
          throw new Error(cleanString(json?.message) || "Không có participant_location_labels để vẽ point.");
        }
        const signerIndex =
          latestSignerWallet && wallets.length
            ? wallets.findIndex((w) => w === latestSignerWallet)
            : -1;
        const matchedIndex = signerIndex >= 0 && signerIndex < points.length ? signerIndex : -1;
        const containerTitle = cleanString(lotPassport.product_name) || "Chưa có tên sản phẩm";
        const containerCode = cleanString(lotPassport.container_code);
        const containerType = cleanString(lotPassport.container_type);
        const capacityKg = cleanString(lotPassport.capacity_kg);
        const actualCapacityKg = cleanString(lotPassport.actual_capacity_kg);
        if (!mounted) return;
        setTrace({
          containerTitle,
          containerCode,
          containerType,
          capacityKg,
          actualCapacityKg,
          points,
          matchedIndex,
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

  React.useEffect(() => {
    let mounted = true;
    const toLabel = async (triple: string): Promise<PointView> => {
      const parts = cleanString(triple).split(",").map((x) => cleanString(x));
      const provinceId = parts[0] || "";
      const districtId = parts[1] || "";
      const wardId = parts[2] || "";
      if (!provinceId || !districtId || !wardId) {
        return { idTriple: triple, label: triple };
      }
      try {
        const provinces = await getProvinceOptions();
        const provinceName = provinces.find((x) => cleanString(x.id) === provinceId)?.name || provinceId;
        const districts = await getDistrictOptions(provinceId);
        const districtName = districts.find((x) => cleanString(x.id) === districtId)?.name || districtId;
        const wards = await getWardOptions(districtId);
        const wardName = wards.find((x) => cleanString(x.id) === wardId)?.name || wardId;
        return { idTriple: triple, label: `${wardName}, ${districtName}, ${provinceName}` };
      } catch {
        return { idTriple: triple, label: triple };
      }
    };

    const loadLabels = async () => {
      if (!trace?.points?.length) {
        if (mounted) setPointViews([]);
        return;
      }
      const labels = await Promise.all(trace.points.map((p) => toLabel(p)));
      if (mounted) setPointViews(labels);
    };
    void loadLabels();
    return () => {
      mounted = false;
    };
  }, [trace]);

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", p: 2 }}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Link href="/trace-scan" className="text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900">
              Trở lại trang quét
            </Link>
            <Typography variant="h6">Kết quả truy xuất nguồn gốc</Typography>
            {busy ? <Alert severity="info">Đang truy xuất...</Alert> : null}
            {error ? <Alert severity="error">{error}</Alert> : null}
            {trace ? (
              <Stack spacing={1}>
                <Typography variant="h4" sx={{ textAlign: "center", fontWeight: 700, mb: 3 }}>
                  {trace.containerTitle}
                </Typography>
                <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 1, px: 1.5, py: 1 }}>
                  <Typography variant="body2">
                    Mã thùng: {trace.containerCode || "-"}
                  </Typography>
                  <Typography variant="body2">
                    Loại thùng: {trace.containerType || "-"}
                  </Typography>
                  <Typography variant="body2">
                    Sản lượng dự kiến: {trace.capacityKg || "-"}
                  </Typography>
                  <Typography variant="body2">
                    Sản lượng thực tế: {trace.actualCapacityKg || "-"}
                  </Typography>
                </Box>
                {trace.points.map((point, index) => {
                  const active = trace.matchedIndex >= 0 && index <= trace.matchedIndex;
                  const lineActive = trace.matchedIndex >= 0 && index < trace.matchedIndex;
                  const pointLabel = pointViews[index]?.label || point;
                  return (
                    <Box key={`${point}-${index}`} sx={{ display: "flex", alignItems: "stretch", minHeight: 36 }}>
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
                        {index < trace.points.length - 1 ? (
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
                        <Typography variant="body2">{pointLabel}</Typography>
                      </Box>
                    </Box>
                  );
                })}
                <Box sx={{ mt: 1 }} />
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

