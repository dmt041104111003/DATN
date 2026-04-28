"use client";

import * as React from "react";
import { Alert, Box, Card, CardContent, Stack, Typography } from "@mui/material";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
const DEFAULT_NFT_IMAGE = "ipfs://bafkreiet2c7tmtcph6qvyoitypfphb7s7t3pnjdiq5bnhsfwby37o5cvaa";

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeIpfsUri(value: string) {
  const raw = cleanString(value);
  if (!raw) return "";
  if (raw.startsWith("ipfs://")) return `https://ipfs.io/ipfs/${raw.slice("ipfs://".length)}`;
  return raw;
}

function resolveProductionImage(metadata: Record<string, unknown> | null) {
  if (!metadata) return normalizeIpfsUri(DEFAULT_NFT_IMAGE);
  const image = cleanString(metadata.image);
  if (image) return normalizeIpfsUri(image);
  const imageCidsRaw = cleanString(metadata.image_cids);
  if (imageCidsRaw) {
    try {
      const parsed = JSON.parse(imageCidsRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = cleanString(parsed[0]);
        if (first) return normalizeIpfsUri(first);
      }
    } catch {}
  }
  return normalizeIpfsUri(DEFAULT_NFT_IMAGE);
}

type TraceView = {
  containerTitle: string;
  containerCode: string;
  containerType: string;
  capacityKg: string;
  actualCapacityKg: string;
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
        const points: Array<{ name: string; walletAddress: string; location: string }> = Array.isArray(json?.points)
          ? json.points
              .map((x: any) => ({
                name: cleanString(x?.name),
                walletAddress: cleanString(x?.walletAddress).toLowerCase(),
                location: cleanString(x?.location),
              }))
              .filter((x: any) => x.walletAddress)
          : [];
        const latestSignerWallet = cleanString(json?.latestSignerWallet).toLowerCase();
        if (!points.length) {
          throw new Error(cleanString(json?.message) || "Không có dữ liệu point.");
        }
        const signerIndex =
          latestSignerWallet && points.length
            ? points.findIndex((p) => p.walletAddress === latestSignerWallet)
            : -1;
        const matchedIndex = signerIndex >= 0 && signerIndex < points.length ? signerIndex : -1;
        const containerTitle = cleanString(lotPassport.product_name) || "Chưa có tên sản phẩm";
        const containerCode = cleanString(lotPassport.container_code);
        const containerType = cleanString(lotPassport.container_type);
        const capacityKg = cleanString(lotPassport.capacity_kg);
        const actualCapacityKg = cleanString(lotPassport.actual_capacity_kg);
        const productionMetadata =
          json?.productionMetadata && typeof json.productionMetadata === "object"
            ? (json.productionMetadata as Record<string, unknown>)
            : null;
        if (!mounted) return;
        setTrace({
          containerTitle,
          containerCode,
          containerType,
          capacityKg,
          actualCapacityKg,
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
                  <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start" }}>
                    <Box sx={{ width: { xs: "100%", md: 260 }, flexShrink: 0 }}>
                      <img
                        src={resolveProductionImage(trace.productionMetadata)}
                        alt="Ảnh vụ mùa"
                        style={{ width: "100%", borderRadius: 8, border: "1px solid #e5e7eb" }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Thông tin thùng hàng
                      </Typography>
                      <Typography variant="body2">Mã thùng: {trace.containerCode || "-"}</Typography>
                      <Typography variant="body2">Loại thùng: {trace.containerType || "-"}</Typography>
                      <Typography variant="body2">Sản lượng dự kiến: {trace.capacityKg || "-"}</Typography>
                      <Typography variant="body2">Sản lượng thực tế: {trace.actualCapacityKg || "-"}</Typography>
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                        Thông tin vụ mùa
                      </Typography>
                      <Typography variant="body2">Mã vụ mùa: {cleanString(trace.productionMetadata?.production_code) || "-"}</Typography>
                      <Typography variant="body2">Cơ sở: {cleanString(trace.productionMetadata?.facility) || "-"}</Typography>
                      <Typography variant="body2">Vị trí: {cleanString(trace.productionMetadata?.location) || "-"}</Typography>
                      <Typography variant="body2">Phương thức: {cleanString(trace.productionMetadata?.farming_method) || "-"}</Typography>
                      <Typography variant="body2">Ngày gieo: {cleanString(trace.productionMetadata?.seeding_date) || "-"}</Typography>
                      <Typography variant="body2">Ngày thu hoạch: {cleanString(trace.productionMetadata?.harvest_date) || "-"}</Typography>
                      <Typography variant="body2">Sản lượng: {cleanString(trace.productionMetadata?.actual_yield_kg) || "-"}</Typography>
                      <Typography variant="body2">Loại cây: {cleanString(trace.productionMetadata?.crop_type) || "-"}</Typography>
                      <Typography variant="body2">Giống: {cleanString(trace.productionMetadata?.variety) || "-"}</Typography>
                    </Box>
                  </Box>
                </Box>
                {trace.points.map((point, index) => {
                  const active = trace.matchedIndex >= 0 && index <= trace.matchedIndex;
                  const lineActive = trace.matchedIndex >= 0 && index < trace.matchedIndex;
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
                <Box sx={{ mt: 1 }} />
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

