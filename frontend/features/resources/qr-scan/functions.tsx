"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  Typography,
  Alert,
  Stack,
  TextField,
  MenuItem,
} from "@mui/material";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useDataProvider, useGetList } from "react-admin";
import { captureCurrentGpsLocation } from "@/features/resources/shared/location";

const DEFAULT_WAREHOUSE_KEY = "qr-scan-default-warehouse-id";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function parsePositiveNumber(value: unknown) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parseRoadmapTriples(raw: unknown): string[] {
  const value = cleanString(raw);
  if (!value) return [];
  const compact = value.replace(/[\[\]\(\)"']/g, " ");
  const matches = compact.match(/\d+\s*,\s*\d+\s*,\s*\d+/g) || [];
  const normalized = matches
    .map((item) =>
      item
        .split(",")
        .map((x) => cleanString(x))
        .filter(Boolean)
        .join(", "),
    )
    .filter(Boolean);
  return Array.from(new Set(normalized));
}

function parseWhitelist(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((x) => cleanString(x)).filter(Boolean);
  const value = cleanString(raw);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((x) => cleanString(x)).filter(Boolean);
    }
  } catch {}
  return value
    .split(/[;,|\s]+/)
    .map((x) => cleanString(x))
    .filter((x) => x.startsWith("addr"));
}

function parseLocationTriple(raw: unknown): string {
  const value = cleanString(raw);
  if (!value) return "";
  const parts = value
    .split(",")
    .map((x) => cleanString(x))
    .filter(Boolean);
  if (parts.length < 3) return "";
  return `${parts[0]}, ${parts[1]}, ${parts[2]}`;
}

export function QrScanResourcePage() {
  const dataProvider = useDataProvider();
  const [statusText, setStatusText] = React.useState("");
  const [statusError, setStatusError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [warehouseId, setWarehouseId] = React.useState("");
  const lastInventoryKeyRef = React.useRef("");
  const scanGuardRef = React.useRef(false);

  const { data: warehouses = [] } = useGetList("warehouse", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "createdAt", order: "DESC" },
  });
  const { data: containers = [] } = useGetList("container", {
    pagination: { page: 1, perPage: 2000 },
    sort: { field: "createdAt", order: "DESC" },
  });
  const { data: storageRows = [], refetch: refetchStorageRows } = useGetList("warehouse-storage", {
    pagination: { page: 1, perPage: 3000 },
    sort: { field: "createdAt", order: "DESC" },
  });

  React.useEffect(() => {
    const fromStorage = cleanString(window.localStorage.getItem(DEFAULT_WAREHOUSE_KEY));
    if (fromStorage) {
      setWarehouseId(fromStorage);
    }
  }, []);

  React.useEffect(() => {
    if (!warehouseId) return;
    window.localStorage.setItem(DEFAULT_WAREHOUSE_KEY, warehouseId);
  }, [warehouseId]);

  const warehouseChoices = (warehouses || []).map((row: any) => ({
    id: cleanString(row?.id),
    name: `${cleanString(row?.name)} - ${cleanString(row?.location)}`,
  }));

  React.useEffect(() => {
    if (warehouseId) return;
    if (warehouseChoices.length !== 1) return;
    setWarehouseId(cleanString(warehouseChoices[0]?.id));
  }, [warehouseChoices, warehouseId]);

  const containerByInventoryKey = React.useMemo(
    () =>
      new Map(
        (containers || []).map((row: any) => [cleanString(row?.inventoryKey), row]),
      ),
    [containers],
  );

  const insertFromQr = React.useCallback(
    async (inventoryKeyRaw: string) => {
      const inventoryKey = cleanString(inventoryKeyRaw);
      if (!inventoryKey) {
        setStatusError("QR không có mã thùng hàng.");
        return;
      }
      if (!warehouseId) {
        setStatusError("Chọn kho mặc định trước khi quét.");
        return;
      }
      if (busy || scanGuardRef.current) return;
      if (lastInventoryKeyRef.current === inventoryKey) return;
      const selectedContainer = containerByInventoryKey.get(inventoryKey);
      if (!selectedContainer) {
        setStatusError("Không tìm thấy thùng hàng từ QR.");
        return;
      }
      const warehouse = (warehouses || []).find((row: any) => cleanString(row?.id) === warehouseId);
      if (!warehouse) {
        setStatusError("Kho mặc định không hợp lệ.");
        return;
      }
      const warehouseLocationTriple = parseLocationTriple(warehouse?.location);
      if (!warehouseLocationTriple) {
        setStatusError("Kho chưa có location hợp lệ dạng 'tỉnh, quận, xã'.");
        return;
      }
      const selectedContainerCapacity = parsePositiveNumber(
        selectedContainer?.actualCapacityKg || selectedContainer?.capacityKg,
      );
      const warehouseCapacity = parsePositiveNumber(warehouse?.capacity);
      const usedCapacity = (storageRows || [])
        .filter((row: any) => cleanString(row?.warehouseId) === warehouseId)
        .reduce((sum: number, row: any) => {
          const key = cleanString(row?.containerInventoryKey || row?.productId);
          const c = containerByInventoryKey.get(key);
          return sum + parsePositiveNumber(c?.actualCapacityKg || c?.capacityKg);
        }, 0);
      if (
        warehouseCapacity > 0 &&
        selectedContainerCapacity > 0 &&
        usedCapacity + selectedContainerCapacity > warehouseCapacity
      ) {
        setStatusError("Kho đầy.");
        return;
      }
      const alreadyStored = (storageRows || []).some(
        (row: any) => cleanString(row?.containerInventoryKey || row?.productId) === inventoryKey,
      );
      if (alreadyStored) {
        setStatusError("Thùng hàng đã ở trong kho.");
        return;
      }
      scanGuardRef.current = true;
      lastInventoryKeyRef.current = inventoryKey;
      setBusy(true);
      setStatusError("");
      setStatusText("");
      try {
        const gps = await captureCurrentGpsLocation();
        const gpsTriple = `${cleanString(gps?.provinceId)}, ${cleanString(gps?.districtId)}, ${cleanString(gps?.wardId)}`;
        if (!gpsTriple.replace(/[,\s]/g, "")) {
          throw new Error("Không đọc được GPS location hiện tại.");
        }

        const [traceRes, meRes] = await Promise.all([
          fetch(`${BACKEND_URL}/trace/${encodeURIComponent(inventoryKey)}`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`${BACKEND_URL}/auth/me`, {
            method: "GET",
            credentials: "include",
          }),
        ]);
        if (!traceRes.ok) {
          throw new Error("Không lấy được roadmap onchain từ NFT.");
        }
        if (!meRes.ok) {
          throw new Error("Không lấy được thông tin ví hiện tại.");
        }
        const traceJson = (await traceRes.json()) as any;
        const meJson = (await meRes.json()) as any;
        const lotPassport = (traceJson?.lotPassport || {}) as Record<string, unknown>;

        const roadmapRaw =
          lotPassport.roadmap ??
          lotPassport.route_map ??
          lotPassport.routeMap ??
          lotPassport.ref99 ??
          lotPassport.ref98;
        const roadmapTriples = parseRoadmapTriples(roadmapRaw);
        if (roadmapTriples.length === 0) {
          throw new Error("NFT chưa có roadmap hợp lệ.");
        }

        const gpsMatched = roadmapTriples.includes(gpsTriple);
        if (!gpsMatched) {
          throw new Error("GPS hiện tại không khớp roadmap NFT.");
        }

        const warehouseMatched = roadmapTriples.includes(warehouseLocationTriple);
        if (!warehouseMatched) {
          throw new Error("Location kho không khớp roadmap NFT.");
        }

        const whitelistRaw =
          lotPassport.ref100 ??
          lotPassport.owner_whitelist ??
          lotPassport.ownerWhitelist ??
          lotPassport.participant_wallet_addresses;
        const whitelist = parseWhitelist(whitelistRaw);
        const currentWallet =
          cleanString(meJson?.user?.paymentAddress) ||
          cleanString(meJson?.user?.walletAddress) ||
          cleanString(meJson?.user?.sub);
        if (!currentWallet) {
          throw new Error("Không xác định được ví người dùng hiện tại.");
        }
        const isOwnerWhitelisted = whitelist.includes(currentWallet);
        if (!isOwnerWhitelisted) {
          throw new Error("Ví hiện tại không thuộc whitelist owner (ref100).");
        }

        await dataProvider.create("warehouse-storage", {
          data: {
            warehouseId,
            containerInventoryKey: inventoryKey,
            conditions: "",
          },
        });
        setStatusText(`Đã nhập kho: ${inventoryKey}`);
        void refetchStorageRows();
      } catch (e) {
        setStatusError(e instanceof Error ? e.message : "Nhập kho thất bại.");
      } finally {
        setBusy(false);
        window.setTimeout(() => {
          scanGuardRef.current = false;
        }, 1200);
      }
    },
    [busy, containerByInventoryKey, dataProvider, refetchStorageRows, storageRows, warehouseId, warehouses],
  );

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Quét QR nhập kho</Typography>
          <TextField label="Loại QR" value="Nhập kho" disabled fullWidth />
          <TextField
            select
            label="Kho mặc định"
            value={warehouseId}
            onChange={(event) => setWarehouseId(cleanString(event.target.value))}
            disabled
            fullWidth
          >
            {warehouseChoices.map((choice) => (
              <MenuItem key={choice.id} value={choice.id}>
                {choice.name}
              </MenuItem>
            ))}
          </TextField>
          <Scanner
            onScan={(result) => {
              const raw = Array.isArray(result) && result[0] ? result[0].rawValue : "";
              void insertFromQr(raw);
            }}
            onError={() => undefined}
          />
          {busy ? <Alert severity="info">Đang nhập kho...</Alert> : null}
          {statusText ? <Alert severity="success">{statusText}</Alert> : null}
          {statusError ? <Alert severity="error">{statusError}</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
