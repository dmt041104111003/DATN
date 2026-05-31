"use client";

import * as React from "react";
import {
  Alert,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Scanner } from "@yudiel/react-qr-scanner";
import { usePermissions } from "react-admin";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { useQrScanPage } from "@/hooks/useQrScanPage";
import {
  getQrScanChoicesForRole,
  isQrScanTypeAllowed,
  type QrScanTypeId,
} from "./constants";

function scanTitle(scanType: string) {
  if (scanType === "WAREHOUSE_OUT") return "Quét QR xuất kho";
  if (scanType === "CONSUME") return "Quét QR tiêu thụ";
  return "Quét QR nhập kho";
}

function busyLabel(scanType: string) {
  if (scanType === "WAREHOUSE_OUT") return "Đang xuất kho...";
  if (scanType === "CONSUME") return "Đang tiêu thụ...";
  return "Đang nhập kho...";
}

export function QrScanResourcePage() {
  const { permissions } = usePermissions();
  const role = cleanString(permissions).toUpperCase();
  const scanTypeChoices = getQrScanChoicesForRole(role);
  const [scanType, setScanType] = React.useState<QrScanTypeId>("WAREHOUSE_IN");
  const {
    busy,
    statusText,
    statusError,
    warehouseReady,
    warehouseLoading,
    activeWarehouse,
    insertFromQr,
    exportFromQr,
    consumeFromQr,
  } = useQrScanPage();

  React.useEffect(() => {
    if (isQrScanTypeAllowed(role, scanType)) return;
    setScanType("WAREHOUSE_IN");
  }, [role, scanType]);

  const handleScan = (raw: string) => {
    if (!warehouseReady) return;
    if (scanType === "WAREHOUSE_OUT") {
      void exportFromQr(raw);
      return;
    }
    if (scanType === "CONSUME") {
      void consumeFromQr(raw);
      return;
    }
    void insertFromQr(raw);
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">{scanTitle(scanType)}</Typography>
          {role === "ENTERPRISE" ? (
            <Typography variant="body2" color="text.secondary">
              Nhập kho khi đóng gói xong; xuất kho khi đơn vị trung chuyển đến lấy hàng (quét QR thùng).
            </Typography>
          ) : null}
          {role === "TRANSIT" ? (
            <Typography variant="body2" color="text.secondary">
              Nhập kho khi nhận hàng; xuất kho khi chuyển giao cho đại lý hoặc bàn giao tiếp.
            </Typography>
          ) : null}
          <TextField
            select
            label="Loại thao tác"
            value={scanType}
            onChange={(event) => {
              const next = cleanString(event.target.value);
              if (isQrScanTypeAllowed(role, next)) setScanType(next as QrScanTypeId);
            }}
            fullWidth
          >
            {scanTypeChoices.map((choice) => (
              <MenuItem key={choice.id} value={choice.id}>
                {choice.name}
              </MenuItem>
            ))}
          </TextField>
          {warehouseLoading ? (
            <Alert severity="info">Đang tải thông tin kho...</Alert>
          ) : activeWarehouse ? (
            <Alert severity="info" icon={false}>
              Kho: <strong>{activeWarehouse.name}</strong>
            </Alert>
          ) : (
            <Alert severity="warning">
              Chưa có kho gắn với tài khoản. Vào Hồ sơ để khai báo kho trước khi quét.
            </Alert>
          )}
          <Scanner
            onScan={(result) => {
              const raw =
                Array.isArray(result) && result[0] ? result[0].rawValue : "";
              handleScan(raw);
            }}
            onError={() => undefined}
          />
          {busy ? <Alert severity="info">{busyLabel(scanType)}</Alert> : null}
          {statusText ? <Alert severity="success">{statusText}</Alert> : null}
          {statusError ? <Alert severity="error">{statusError}</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
