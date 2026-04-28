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
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { useQrScanPage } from "@/hooks/useQrScanPage";

export function QrScanResourcePage() {
  const { busy, statusText, statusError, warehouseId, setWarehouseId, warehouseChoices, insertFromQr } = useQrScanPage();

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
              const raw =
                Array.isArray(result) && result[0] ? result[0].rawValue : "";
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

