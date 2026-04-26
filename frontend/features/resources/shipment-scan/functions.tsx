"use client";

import * as React from "react";
import { Title } from "react-admin";
import { Scanner } from "@yudiel/react-qr-scanner";
import { getCustodianSettlementAddress, publishAttestedRecord, signOutgoingAttestation } from "@/lib/wallet";
import { BACKEND_URL, SCAN_ERROR, SCAN_STATUS, SHIPMENT_SCAN_TITLE } from "./constants";

function cleanString(value: unknown): string {
  return String(value ?? "").trim();
}

function parseInventoryKeyFromQr(raw: string) {
  const value = cleanString(raw);
  if (!value) return "";
  try {
    const parsed = JSON.parse(value) as any;
    return cleanString(parsed?.inventoryKey || parsed?.shipmentInventoryKey || parsed?.shipment_inventory_key);
  } catch {
    return value;
  }
}

export function ShipmentScanResourceList() {
  const [scanning, setScanning] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [lastInventoryKey, setLastInventoryKey] = React.useState<string>("");

  const resetScanner = React.useCallback(() => {
    setScanning(true);
    setBusy(false);
    setMessage("");
    setLastInventoryKey("");
  }, []);

  const handleScanText = React.useCallback(async (text: string) => {
    const inventoryKey = parseInventoryKeyFromQr(text);
    if (!inventoryKey || busy) return;

    setBusy(true);
    setScanning(false);
    setLastInventoryKey(inventoryKey);
    setMessage(SCAN_STATUS.processing);

    try {
      const meRes = await fetch(`${BACKEND_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
      });
      const me = await meRes.json().catch(() => ({}));
      if (!meRes.ok) throw new Error(cleanString((me as any)?.message) || SCAN_ERROR.noSession);
      const profile = (me as any)?.profile ?? {};
      const user = (me as any)?.user ?? {};
      const actor =
        cleanString(user?.paymentAddress) ||
        cleanString(user?.walletAddress) ||
        cleanString(user?.sub);
      if (!actor) throw new Error(SCAN_ERROR.noWallet);

      const location = [cleanString(profile?.provinceId), cleanString(profile?.districtId), cleanString(profile?.wardId)]
        .filter(Boolean)
        .join("/");
      if (!location) throw new Error(SCAN_ERROR.noProfileLocation);

      const custodianAddress = await getCustodianSettlementAddress();
      const owners = [actor || custodianAddress];
      const metadata = {
        status: "IN_TRANSIT",
        current_location: location,
        updated_by: actor,
        updated_at: new Date().toISOString(),
      };

      const contractRes = await fetch(`${BACKEND_URL}/shipments/contract/save`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custodianAddress,
          owners,
          inventoryKey,
          metadata,
        }),
      });
      const contractJson = await contractRes.json().catch(() => ({}));
      if (!contractRes.ok || !(contractJson as any)?.result || !(contractJson as any)?.data) {
        throw new Error(cleanString((contractJson as any)?.message) || SCAN_ERROR.saveTx);
      }

      const signed = await signOutgoingAttestation(String((contractJson as any).data));
      const txHash = await publishAttestedRecord(signed);

      const patchRes = await fetch(`${BACKEND_URL}/shipment-scan/${encodeURIComponent(inventoryKey)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash,
          location,
        }),
      });
      const patchJson = await patchRes.json().catch(() => ({}));
      if (!patchRes.ok) {
        throw new Error(cleanString((patchJson as any)?.message) || SCAN_ERROR.patch);
      }

      setMessage(SCAN_STATUS.success);
    } catch (e: any) {
      setMessage(cleanString(e?.message) || SCAN_STATUS.failed);
    } finally {
      setBusy(false);
    }
  }, [busy]);

  return (
    <div className="p-4">
      <Title title={SHIPMENT_SCAN_TITLE} />
      <h2 className="mb-3 text-lg font-semibold">{SHIPMENT_SCAN_TITLE}</h2>
      {scanning ? (
        <div className="max-w-xl">
          <Scanner
            onScan={(detectedCodes) => {
              const text = cleanString(detectedCodes?.[0]?.rawValue);
              if (text) {
                void handleScanText(text);
              }
            }}
            onError={() => {}}
          />
        </div>
      ) : null}
      {busy ? <p className="mt-3 text-sm text-slate-700">Đang xử lý...</p> : null}
      {lastInventoryKey ? <p className="mt-3 text-sm text-slate-700">InventoryKey: {lastInventoryKey}</p> : null}
      {message ? <p className="mt-2 text-sm">{message}</p> : null}
      <button
        type="button"
        className="mt-4 rounded border px-3 py-1.5 text-sm"
        onClick={resetScanner}
      >
        Quét lại
      </button>
    </div>
  );
}

