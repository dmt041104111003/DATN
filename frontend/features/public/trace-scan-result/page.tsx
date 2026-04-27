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

type TraceView = {
  containerTitle: string;
  containerCode: string;
  containerType: string;
  capacityKg: string;
  actualCapacityKg: string;
  points: string[];
  matchedIndex: number;
  productionInventoryKey: string;
  transactions: Array<{ txHash: string; blockTime: number | null }>;
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
  const [productionBusy, setProductionBusy] = React.useState(false);
  const [productionError, setProductionError] = React.useState("");
  const [productionTransactions, setProductionTransactions] = React.useState<
    Array<{ txHash: string; blockTime: number | null }>
  >([]);

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
        if (!points.length) {
          throw new Error(cleanString(json?.message) || "Không có participant_location_labels để vẽ point.");
        }
        const matchedLocation = normalizeTriple(
          lotPassport.current_location || lotPassport.location || lotPassport.container_location,
        );
        const matchedIndex = matchedLocation ? points.findIndex((x) => x === matchedLocation) : -1;
        const containerTitle = cleanString(lotPassport.product_name) || "Chưa có tên sản phẩm";
        const containerCode = cleanString(lotPassport.container_code);
        const containerType = cleanString(lotPassport.container_type);
        const capacityKg = cleanString(lotPassport.capacity_kg);
        const actualCapacityKg = cleanString(lotPassport.actual_capacity_kg);
        const productionInventoryKey = cleanString(lotPassport.production_inventory_key);
        const transactions = Array.isArray(json?.transactions)
          ? json.transactions
              .map((x: any) => ({
                txHash: cleanString(x?.txHash),
                blockTime: typeof x?.blockTime === "number" ? x.blockTime : null,
              }))
              .filter((x: any) => x.txHash)
              .sort((a: any, b: any) => (Number(b.blockTime || 0) - Number(a.blockTime || 0)))
          : [];
        if (!mounted) return;
        setTrace({
          containerTitle,
          containerCode,
          containerType,
          capacityKg,
          actualCapacityKg,
          points,
          matchedIndex,
          productionInventoryKey,
          transactions,
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

  const loadProductionTransactions = React.useCallback(async () => {
    const key = cleanString(trace?.productionInventoryKey);
    if (!key) return;
    setProductionBusy(true);
    setProductionError("");
    setProductionTransactions([]);
    try {
      const res = await fetch(`${BACKEND_URL}/trace/${encodeURIComponent(key)}`, { method: "GET" });
      const json = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        throw new Error(cleanString(json?.message) || "Không lấy được lịch sử vụ mùa.");
      }
      const txs = Array.isArray(json?.transactions)
        ? json.transactions
            .map((x: any) => ({
              txHash: cleanString(x?.txHash),
              blockTime: typeof x?.blockTime === "number" ? x.blockTime : null,
            }))
            .filter((x: any) => x.txHash)
            .sort((a: any, b: any) => Number(b.blockTime || 0) - Number(a.blockTime || 0))
        : [];
      setProductionTransactions(txs);
    } catch (e) {
      setProductionError(e instanceof Error ? e.message : "Không lấy được lịch sử vụ mùa.");
    } finally {
      setProductionBusy(false);
    }
  }, [trace?.productionInventoryKey]);

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
                <Box sx={{ mt: 2 }}>
                  {trace.productionInventoryKey ? (
                    <Box sx={{ mb: 1, border: "1px solid #e5e7eb", borderRadius: 1, px: 1, py: 0.75 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        Mã truy xuất vụ mùa
                      </Typography>
                      <Typography
                        variant="caption"
                        onClick={() => void loadProductionTransactions()}
                        sx={{
                          wordBreak: "break-all",
                          display: "block",
                          cursor: "pointer",
                          color: "primary.main",
                          textDecoration: "underline",
                        }}
                      >
                        {trace.productionInventoryKey}
                      </Typography>
                      {productionBusy ? (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                          Đang tải lịch sử vụ mùa...
                        </Typography>
                      ) : null}
                      {productionError ? (
                        <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.75 }}>
                          {productionError}
                        </Typography>
                      ) : null}
                      {productionTransactions.length ? (
                        <Stack spacing={0.75} sx={{ mt: 1 }}>
                          {productionTransactions.map((tx) => (
                            <Box key={`production-${tx.txHash}`} sx={{ border: "1px solid #e5e7eb", borderRadius: 1, px: 1, py: 0.75 }}>
                              <Typography variant="caption" sx={{ wordBreak: "break-all", display: "block" }}>
                                {tx.txHash}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {tx.blockTime
                                  ? new Date(tx.blockTime * 1000).toLocaleString("vi-VN")
                                  : "Chưa có thời gian block"}
                              </Typography>
                            </Box>
                          ))}
                          <Typography
                            variant="caption"
                            onClick={() => {
                              setProductionTransactions([]);
                              setProductionError("");
                            }}
                            sx={{
                              cursor: "pointer",
                              color: "primary.main",
                              textDecoration: "underline",
                              pt: 0.5,
                            }}
                          >
                            Thu gọn
                          </Typography>
                        </Stack>
                      ) : null}
                    </Box>
                  ) : null}
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Lịch sử
                  </Typography>
                  <Stack spacing={0.75}>
                    {trace.transactions.length ? (
                      trace.transactions.map((tx) => (
                        <Box key={tx.txHash} sx={{ border: "1px solid #e5e7eb", borderRadius: 1, px: 1, py: 0.75 }}>
                          <Typography variant="caption" sx={{ wordBreak: "break-all", display: "block" }}>
                            {tx.txHash}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {tx.blockTime
                              ? new Date(tx.blockTime * 1000).toLocaleString("vi-VN")
                              : "Chưa có thời gian block"}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="caption">Chưa có dữ liệu giao dịch.</Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

