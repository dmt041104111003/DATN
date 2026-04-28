"use client";

import { Box, Typography } from "@mui/material";

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

function formatDateVi(value: unknown) {
  const raw = cleanString(value);
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("vi-VN");
}

function formatDateTimeVi(value: unknown) {
  const raw = cleanString(value);
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString("vi-VN");
}

type TraceInfoProps = {
  isConsumed: boolean;
  consumedAt: string;
  containerCode: string;
  containerType: string;
  capacityKg: string;
  actualCapacityKg: string;
  productionMetadata: Record<string, unknown> | null;
};

export default function TraceInfo(props: TraceInfoProps) {
  return (
    <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 1, px: 1.5, py: 1 }}>
      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start" }}>
        <Box sx={{ width: { xs: "100%", md: 260 }, flexShrink: 0 }}>
          <img
            src={resolveProductionImage(props.productionMetadata)}
            alt="Ảnh vụ mùa"
            style={{ width: "100%", borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Thông tin thùng hàng
          </Typography>
          <Typography variant="body2">Mã thùng: {props.containerCode || "-"}</Typography>
          <Typography variant="body2">Loại thùng: {props.containerType || "-"}</Typography>
          <Typography variant="body2">Sản lượng dự kiến (kg): {props.capacityKg || "-"}</Typography>
          <Typography variant="body2">Sản lượng thực tế (kg): {props.actualCapacityKg || "-"}</Typography>
          {props.isConsumed ? (
            <Typography variant="body2" sx={{ color: "error.main", fontWeight: 700 }}>
              Thời gian tiêu thụ: {formatDateTimeVi(props.consumedAt)}
            </Typography>
          ) : null}
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
            Thông tin vụ mùa
          </Typography>
          <Typography variant="body2">Mã vụ mùa: {cleanString(props.productionMetadata?.production_code) || "-"}</Typography>
          <Typography variant="body2">Cơ sở: {cleanString(props.productionMetadata?.facility) || "-"}</Typography>
          <Typography variant="body2">Vị trí: {cleanString(props.productionMetadata?.location) || "-"}</Typography>
          <Typography variant="body2">Phương thức: {cleanString(props.productionMetadata?.farming_method).toUpperCase() === "OUTDOOR" ? "Ngoài trời" : cleanString(props.productionMetadata?.farming_method).toUpperCase() === "HYDROPONIC" ? "Thủy canh" : cleanString(props.productionMetadata?.farming_method) || "-"}</Typography>
          <Typography variant="body2">Ngày gieo: {formatDateVi(props.productionMetadata?.seeding_date)}</Typography>
          <Typography variant="body2">Ngày thu hoạch: {formatDateVi(props.productionMetadata?.harvest_date)}</Typography>
          <Typography variant="body2">Sản lượng (kg): {cleanString(props.productionMetadata?.actual_yield_kg) || "-"}</Typography>
          <Typography variant="body2">Loại cây: {cleanString(props.productionMetadata?.crop_type) || "-"}</Typography>
          <Typography variant="body2">Giống: {cleanString(props.productionMetadata?.variety) || "-"}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
