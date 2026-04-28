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
import { QR_SCAN_TYPE_CHOICES } from "./constants";

export function QrScanResourcePage() {
  const { permissions } = usePermissions();
  const role = cleanString(permissions).toUpperCase();
  const isAgent = role === "AGENT";
  const [scanType, setScanType] = React.useState("WAREHOUSE_IN");
  const { busy, statusText, statusError, warehouseId, setWarehouseId, warehouseChoices, insertFromQr, consumeFromQr } = useQrScanPage();
  const scanTypeChoices = isAgent
    ? QR_SCAN_TYPE_CHOICES
    : QR_SCAN_TYPE_CHOICES.filter((x) => x.id === "WAREHOUSE_IN");

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">{scanType === "CONSUME" ? "Quét QR tiêu thụ" : "Quét QR nhập kho"}</Typography>
          <TextField
            select
            label="Loại QR"
            value={scanType}
            onChange={(event) => setScanType(cleanString(event.target.value))}
            fullWidth
          >
            {scanTypeChoices.map((choice) => (
              <MenuItem key={choice.id} value={choice.id}>
                {choice.name}
              </MenuItem>
            ))}
          </TextField>
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
              const raw =
                Array.isArray(result) && result[0] ? result[0].rawValue : "";
              if (scanType === "CONSUME") {
                void consumeFromQr(raw);
              } else {
                void insertFromQr(raw);
              }
            }}
            onError={() => undefined}
          />
          {busy ? <Alert severity="info">{scanType === "CONSUME" ? "Đang tiêu thụ..." : "Đang nhập kho..."}</Alert> : null}
          {statusText ? <Alert severity="success">{statusText}</Alert> : null}
          {statusError ? <Alert severity="error">{statusError}</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

