"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { GOV_RED, GOV_GOLD } from "@/features/public/shared/govTheme";
import { TraceSection } from "@/features/public/shared/TracePageShell";

export type HistorySummary = {
  title: string;
  signerName: string;
  signerRoleText: string;
  signerLocationText: string;
  storageOpText: string;
  statusText: string;
};

export type HistoryItem = {
  source: "PRODUCTION" | "CONTAINER";
  txHash: string;
  time: string;
  metadata: Record<string, unknown> | null;
  summary: HistorySummary | null;
};

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function displayLocation(value: unknown) {
  const text = cleanString(value);
  if (!text) return "";
  if (/^\d+\s*,\s*\d+\s*,\s*\d+$/.test(text)) return "";
  return text;
}

function formatDateTimeVi(value: unknown) {
  const raw = cleanString(value);
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString("vi-VN");
}

type HistoryResponse = {
  items: HistoryItem[];
  total: number;
  page: number;
  limit: number;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

const headCellSx = {
  bgcolor: GOV_RED,
  color: "#fff",
  fontWeight: 700,
  fontSize: "0.72rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  borderBottom: `2px solid ${GOV_GOLD}`,
  py: 1,
};

export default function TraceHistory({ inventoryKey }: { inventoryKey: string }) {
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
        const res = await fetch(`${BACKEND_URL}/trace/${key}/history?page=${safePage}&limit=${pageSize}`, {
          method: "GET",
        });
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
    <TraceSection title="Lịch sử giao dịch on-chain">
      {!enabled ? (
        <Typography
          variant="body2"
          sx={{ color: GOV_RED, textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}
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
        <Typography variant="body2" color="text.secondary">
          Chưa có lịch sử.
        </Typography>
      ) : null}
      {enabled && !busy && !error && items.length > 0 ? (
        <>
          <TableContainer sx={{ border: "1px solid #e8c4ca", borderRadius: "2px" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headCellSx}>Nguồn</TableCell>
                  <TableCell sx={headCellSx}>Thời gian</TableCell>
                  <TableCell sx={headCellSx}>Người ký / Địa điểm</TableCell>
                  <TableCell sx={headCellSx}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, idx) => {
                  const isOpen = activeHash === item.txHash;
                  return (
                    <React.Fragment key={`${item.source}-${item.txHash}`}>
                      <TableRow
                        hover
                        sx={{
                          bgcolor: idx % 2 === 0 ? "#fff" : "#fdf5f6",
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#fae8eb" },
                        }}
                        onClick={() => setActiveHash(isOpen ? "" : item.txHash)}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>
                          {item.summary?.title || (item.source === "PRODUCTION" ? "Vụ mùa" : "Thùng hàng")}
                        </TableCell>
                        <TableCell>{formatDateTimeVi(item.time)}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.summary?.signerName || "Chưa rõ"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {item.summary?.signerRoleText || "-"}
                            {displayLocation(item.summary?.signerLocationText)
                              ? ` · ${displayLocation(item.summary?.signerLocationText)}`
                              : ""}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.summary?.storageOpText || item.summary?.statusText || "-"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      {isOpen ? (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ bgcolor: "#fdf5f6", py: 1 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              Mã giao dịch:{" "}
                              <Box component="span" sx={{ color: GOV_RED, wordBreak: "break-all" }}>
                                {item.txHash}
                              </Box>
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {total > pageSize ? (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, borderTop: `2px solid ${GOV_RED}`, mt: 1 }}>
              <Pagination
                page={safePage}
                count={pageCount}
                onChange={(_, value) => setPage(value)}
                size="small"
                sx={{
                  "& .MuiPaginationItem-root": { fontWeight: 600, borderRadius: "2px" },
                  "& .Mui-selected": { bgcolor: `${GOV_RED} !important`, color: "#fff" },
                }}
              />
            </Box>
          ) : null}
        </>
      ) : null}
    </TraceSection>
  );
}
