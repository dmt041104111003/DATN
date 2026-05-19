"use client";

import { Box, Typography } from "@mui/material";
import { TraceSection } from "@/features/public/shared/TracePageShell";
import { GOV_RED } from "@/features/public/shared/govTheme";

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
  weightPerBoxKg: string;
  productionMetadata: Record<string, unknown> | null;
};

export default function TraceInfo(props: TraceInfoProps) {
  return (
    <TraceSection title="Thông tin sản phẩm">
      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start" }}>
        <Box sx={{ width: { xs: "100%", md: 240 }, flexShrink: 0 }}>
          <img
            src={resolveProductionImage(props.productionMetadata)}
            alt="Ảnh vụ mùa"
            style={{ width: "100%", borderRadius: 2, border: "2px solid #e8c4ca" }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: GOV_RED, mb: 0.5 }}>
            Thùng hàng
          </Typography>
          <Typography variant="body2">Mã thùng: {props.containerCode || "-"}</Typography>
          <Typography variant="body2">Loại thùng: {props.containerType || "-"}</Typography>
          <Typography variant="body2">Khối lượng mỗi thùng (kg): {props.weightPerBoxKg || "-"}</Typography>
          {props.isConsumed ? (
            <Typography variant="body2" sx={{ color: GOV_RED, fontWeight: 700 }}>
              Thời gian tiêu thụ: {formatDateTimeVi(props.consumedAt)}
            </Typography>
          ) : null}
          <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 700, color: GOV_RED }}>
            Vụ mùa
          </Typography>
          <Typography variant="body2">Mã vụ mùa: {cleanString(props.productionMetadata?.production_code) || "-"}</Typography>
          <Typography variant="body2">Cơ sở: {cleanString(props.productionMetadata?.facility) || "-"}</Typography>
          <Typography variant="body2">Vị trí: {cleanString(props.productionMetadata?.location) || "-"}</Typography>
          <Typography variant="body2">
            Phương thức:{" "}
            {cleanString(props.productionMetadata?.farming_method).toUpperCase() === "OUTDOOR"
              ? "Ngoài trời"
              : cleanString(props.productionMetadata?.farming_method).toUpperCase() === "HYDROPONIC"
                ? "Thủy canh"
                : cleanString(props.productionMetadata?.farming_method) || "-"}
          </Typography>
          <Typography variant="body2">Ngày gieo: {formatDateVi(props.productionMetadata?.seeding_date)}</Typography>
          <Typography variant="body2">Ngày thu hoạch: {formatDateVi(props.productionMetadata?.harvest_date)}</Typography>
          <Typography variant="body2">Sản lượng (kg): {cleanString(props.productionMetadata?.actual_yield_kg) || "-"}</Typography>
          <Typography variant="body2">Loại cây: {cleanString(props.productionMetadata?.crop_type) || "-"}</Typography>
          <Typography variant="body2">Giống: {cleanString(props.productionMetadata?.variety) || "-"}</Typography>
        </Box>
      </Box>
    </TraceSection>
  );
}
