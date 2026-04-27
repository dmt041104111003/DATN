"use client";

import * as React from "react";
import { Card, CardContent, Typography, Alert, Stack, TextField } from "@mui/material";
import { Scanner } from "@yudiel/react-qr-scanner";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function makePartnerCode() {
  return `DVLK_${Date.now()}`;
}

export function QrScanResourcePage() {
  const [statusText, setStatusText] = React.useState("");
  const [statusError, setStatusError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const lastWalletRef = React.useRef("");

  const insertFromWallet = React.useCallback(async (walletRaw: string) => {
    const wallet = cleanString(walletRaw);
    if (!wallet) {
      setStatusError("Chưa có địa chỉ ví từ QR.");
      return;
    }
    if (busy) return;
    if (lastWalletRef.current === wallet) return;
    lastWalletRef.current = wallet;
    setBusy(true);
    setStatusError("");
    setStatusText("");
    try {
      const meRes = await fetch(`${BACKEND_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });
      if (!meRes.ok) throw new Error("Không xác định được tài khoản hiện tại.");
      const meJson = (await meRes.json()) as any;
      const myWallet = cleanString(
        meJson?.user?.paymentAddress || meJson?.user?.walletAddress || meJson?.user?.sub || "",
      );
      if (myWallet && wallet === myWallet) {
        throw new Error("Không thể tự thêm chính tài khoản của bạn.");
      }

      const partnerListRes = await fetch(`${BACKEND_URL}/partners`, {
        method: "GET",
        credentials: "include",
      });
      if (!partnerListRes.ok) throw new Error("Không kiểm tra được danh sách đơn vị liên kết.");
      const partnerRows = (await partnerListRes.json()) as any[];
      const duplicated = (partnerRows || []).some(
        (row: any) => cleanString(row?.walletAddress).toLowerCase() === wallet.toLowerCase(),
      );
      if (duplicated) {
        throw new Error("Địa chỉ ví này đã tồn tại trong đơn vị liên kết.");
      }

      const profileRes = await fetch(`${BACKEND_URL}/profile/public/${encodeURIComponent(wallet)}`, {
        method: "GET",
        credentials: "include",
      });
      if (!profileRes.ok) throw new Error("Không kiểm tra được hồ sơ ví.");
      const profileJson = (await profileRes.json()) as any;
      const profile = profileJson?.profile;
      if (!profile) throw new Error("Ví chưa có tài khoản trong hệ thống.");

      const createRes = await fetch(`${BACKEND_URL}/partners`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: makePartnerCode(),
          walletAddress: wallet,
          displayName: cleanString(profile?.displayName) || wallet,
          provinceId: cleanString(profile?.provinceId),
          districtId: cleanString(profile?.districtId),
          wardId: cleanString(profile?.wardId),
          note: "",
        }),
      });
      if (!createRes.ok) throw new Error(await createRes.text());
      setStatusText(`Đã insert đơn vị liên kết: ${wallet}`);
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Insert thất bại.");
    } finally {
      setBusy(false);
    }
  }, [busy]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Quét QR</Typography>
          <TextField label="Loại QR" value="Đơn vị liên kết" disabled fullWidth />
          <Scanner
            onScan={(result) => {
              const raw = Array.isArray(result) && result[0] ? result[0].rawValue : "";
              insertFromWallet(raw);
            }}
            onError={() => undefined}
          />
          {statusText ? <Alert severity="success">{statusText}</Alert> : null}
          {statusError ? <Alert severity="error">{statusError}</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

