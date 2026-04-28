"use client";

import * as React from "react";
import { Alert, Box, Pagination, Stack, Typography } from "@mui/material";

export type HistoryItem = {
  source: "PRODUCTION" | "CONTAINER";
  txHash: string;
  time: string;
  metadata: Record<string, unknown> | null;
};

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function formatDateTimeVi(value: unknown) {
  const raw = cleanString(value);
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString("vi-VN");
}

function formatDateVi(value: unknown) {
  const raw = cleanString(value);
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("vi-VN");
}

function formatAny(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  const text = cleanString(value);
  return text || "-";
}

function MetadataDetail({ item }: { item: HistoryItem }) {
  const metadata = item.metadata || {};
  const farmingMethodRaw = cleanString(metadata.farming_method).toUpperCase();
  const farmingMethod =
    farmingMethodRaw === "OUTDOOR" ? "Ngoài trời" : farmingMethodRaw === "HYDROPONIC" ? "Thủy canh" : cleanString(metadata.farming_method) || "-";

  return (
    <Box sx={{ mt: 1, p: 1, bgcolor: "#f8fafc", borderRadius: 1 }}>
      {item.source === "CONTAINER" ? (
        <>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Thông tin thùng hàng
          </Typography>
          <Typography variant="body2">Mã thùng: {formatAny(metadata.container_code)}</Typography>
          <Typography variant="body2">Loại thùng: {formatAny(metadata.container_type)}</Typography>
          <Typography variant="body2">Sản lượng dự kiến (kg): {formatAny(metadata.capacity_kg)}</Typography>
          <Typography variant="body2">Sản lượng thực tế (kg): {formatAny(metadata.actual_capacity_kg)}</Typography>
          <Typography variant="body2">Thời gian tiêu thụ: {formatDateTimeVi(metadata.storage_updated_at)}</Typography>
        </>
      ) : (
        <>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Thông tin vụ mùa
          </Typography>
          <Typography variant="body2">Mã vụ mùa: {formatAny(metadata.production_code)}</Typography>
          <Typography variant="body2">Cơ sở: {formatAny(metadata.facility)}</Typography>
          <Typography variant="body2">Vị trí: {formatAny(metadata.location)}</Typography>
          <Typography variant="body2">Phương thức: {farmingMethod}</Typography>
          <Typography variant="body2">Ngày gieo: {formatDateVi(metadata.seeding_date)}</Typography>
          <Typography variant="body2">Ngày thu hoạch: {formatDateVi(metadata.harvest_date)}</Typography>
          <Typography variant="body2">Sản lượng (kg): {formatAny(metadata.actual_yield_kg)}</Typography>
          <Typography variant="body2">Loại cây: {formatAny(metadata.crop_type)}</Typography>
          <Typography variant="body2">Giống: {formatAny(metadata.variety)}</Typography>
        </>
      )}
      <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
        Metadata đầy đủ
      </Typography>
      {Object.keys(metadata).map((key) => (
        <Typography key={key} variant="body2">
          {key}: {formatAny(metadata[key])}
        </Typography>
      ))}
      {Object.keys(metadata).length === 0 ? <Typography variant="body2">-</Typography> : null}
    </Box>
  );
}

type HistoryResponse = {
  items: HistoryItem[];
  total: number;
  page: number;
  limit: number;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default function TraceHistory({
  inventoryKey,
}: {
  inventoryKey: string;
}) {
  const [enabled, setEnabled] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [items, setItems] = React.useState<HistoryItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [activeHash, setActiveHash] = React.useState("");
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = page > pageCount ? pageCount : page;

  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!enabled) return;
      setBusy(true);
      setError("");
      try {
        const key = encodeURIComponent(cleanString(inventoryKey));
        const res = await fetch(`${BACKEND_URL}/trace/${key}/history?page=${safePage}&limit=${pageSize}`, { method: "GET" });
        if (!res.ok) throw new Error("Không tải được lịch sử.");
        const json = (await res.json()) as HistoryResponse;
        if (!mounted) return;
        setItems(Array.isArray(json?.items) ? json.items : []);
        setTotal(Number(json?.total || 0));
      } catch (e) {
        if (!mounted) return;
        setItems([]);
        setTotal(0);
        setError(e instanceof Error ? e.message : "Không tải được lịch sử.");
      } finally {
        if (mounted) setBusy(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [enabled, inventoryKey, safePage]);

  return (
    <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 1, p: 1.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
        Lịch sử giao dịch
      </Typography>
      {!enabled ? (
        <Typography
          variant="body2"
          sx={{ color: "primary.main", textDecoration: "underline", cursor: "pointer", width: "fit-content" }}
          onClick={() => {
            setEnabled(true);
            setPage(1);
          }}
        >
          Xem lịch sử
        </Typography>
      ) : null}
      {enabled && busy ? <Alert severity="info">Đang tải lịch sử...</Alert> : null}
      {enabled && error ? <Alert severity="error">{error}</Alert> : null}
      {enabled && !busy && !error && items.length === 0 ? (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Chưa có lịch sử.
        </Typography>
      ) : (
        enabled && !busy && !error ? <Stack spacing={1}>
          {items.map((item) => {
            const isOpen = activeHash === item.txHash;
            return (
              <Box key={`${item.source}-${item.txHash}`} sx={{ border: "1px solid #e5e7eb", borderRadius: 1, p: 1 }}>
                <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                  {item.source === "PRODUCTION" ? "Vụ mùa" : "Thùng hàng"} - {formatDateTimeVi(item.time)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    wordBreak: "break-all",
                    color: "primary.main",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: isOpen ? 700 : 400,
                  }}
                  onClick={() => {
                    setActiveHash(item.txHash);
                  }}
                >
                  {item.txHash}
                </Typography>
                {isOpen ? (
                  <MetadataDetail item={item} />
                ) : null}
              </Box>
            );
          })}
          <Box sx={{ display: "flex", justifyContent: "center", pt: 0.5, visibility: total > pageSize ? "visible" : "hidden" }}>
            <Pagination
              page={safePage}
              count={pageCount}
              color="primary"
              size="small"
              onChange={(_, value) => setPage(value)}
            />
          </Box>
        </Stack> : null
      )}
    </Box>
  );
}
