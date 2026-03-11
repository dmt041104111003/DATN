"use client";

import * as React from "react";
import { BrowserWallet } from "@meshsdk/core";
import QRCode from "qrcode";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type OrderCheckResult = {
  inWarehouse: boolean;
  policyId?: string;
  assetName?: string;
  unit?: string;
  walletHasNft?: boolean;
  message?: string;
};

export function OrderForm() {
  const [assetName, setAssetName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [senderInfo, setSenderInfo] = React.useState<{
    walletAddress: string;
    displayName?: string | null;
    location?: string | null;
    roleCode?: string | null;
  } | null>(null);
  const [result, setResult] = React.useState<OrderCheckResult | null>(null);
  const [receiver, setReceiver] = React.useState("");
  const [sendTxHash, setSendTxHash] = React.useState("");
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [qrUrl, setQrUrl] = React.useState<string | null>(null);

  const getToken = () => {
    if (typeof document === "undefined") return "";
    const cookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("auth_token="));
    return cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
  };

  React.useEffect(() => {
    const loadMe = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          user?: { walletAddress?: string; paymentAddress?: string; sub?: string } | null;
          profile?: { walletAddress?: string; displayName?: string; location?: string; roleCode?: string } | null;
        };
        const walletAddress =
          data?.profile?.walletAddress ||
          data?.user?.walletAddress ||
          data?.user?.paymentAddress ||
          data?.user?.sub ||
          "";
        if (!walletAddress) return;
        setSenderInfo({
          walletAddress,
          displayName: data?.profile?.displayName ?? null,
          location: (data?.profile as any)?.location ?? null,
          roleCode: data?.profile?.roleCode ?? null,
        });
      } catch {
      }
    };
    loadMe();
  }, []);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setSendTxHash("");
    const name = assetName.trim();
    if (!name) {
      setError("Enter asset name.");
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setError("Unauthorized. Please sign in again.");
        return;
      }
      const res = await fetch(`${BACKEND_URL}/order/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assetName: name }),
      });
      const data = (await res.json()) as OrderCheckResult;
      if (!res.ok) {
        throw new Error((data as any)?.message ?? "Check failed");
      }
      setResult(data);
      setReceiver("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setLoading(false);
    }
  };

  const canSend =
    !!result?.inWarehouse &&
    !!result?.walletHasNft &&
    !!result?.policyId &&
    !!result?.assetName &&
    !!result?.unit;

  const handleSend = async () => {
    setError("");
    setSendTxHash("");
    setOrderId(null);
    setQrUrl(null);
    if (!canSend) {
      setError("Check must succeed and wallet must hold the NFT before sending.");
      return;
    }
    const to = receiver.trim();
    if (!to) {
      setError("Enter receiver address.");
      return;
    }
    const token = getToken();
    if (!token) {
      setError("Unauthorized. Please sign in again.");
      return;
    }

    setSending(true);
    try {
      if (typeof window === "undefined") {
        throw new Error("Browser environment required");
      }

      const installed = await BrowserWallet.getInstalledWallets();
      if (installed.length === 0) {
        throw new Error("No browser wallet found");
      }

      const eternl = installed.find((w) => w.name.toLowerCase() === "eternl");
      const walletInfo = eternl ?? installed[0];
      const wallet = await BrowserWallet.enable(walletInfo.name);
      const walletAddress = await wallet.getChangeAddress();

      const unsignedRes = await fetch(`${BACKEND_URL}/contract/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          receiver: to,
          policyId: result!.policyId,
          assetName: result!.assetName,
          quantity: "1",
        }),
      });
      const unsignedData = await unsignedRes.json();
      if (!unsignedRes.ok || !unsignedData?.result || !unsignedData?.data) {
        throw new Error(unsignedData?.message || "Failed to build transfer transaction");
      }

      const signed = await wallet.signTx(unsignedData.data, true);

      const submitRes = await fetch(`${BACKEND_URL}/contract/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedTx: signed }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok || !submitData?.result || !submitData?.data) {
        throw new Error(submitData?.message || "Failed to submit transaction");
      }

      const hash = submitData.data as string;
      setSendTxHash(hash);

      const shipRes = await fetch(`${BACKEND_URL}/order/ship`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverWalletAddress: to,
          policyId: result!.policyId,
          assetName: result!.assetName,
          unit: result!.unit,
          txHash: hash,
        }),
      });

      if (shipRes.ok) {
        const shipData = (await shipRes.json()) as {
          success?: boolean;
          order?: { id: string };
        };
        if (shipData?.success && shipData.order?.id) {
          const id = shipData.order.id;
          setOrderId(id);
          if (typeof window !== "undefined") {
            const url = `${window.location.origin}/dashboard/order?orderId=${encodeURIComponent(
              id,
            )}&tab=incoming`;
            try {
              const dataUrl = await QRCode.toDataURL(url, {
                errorCorrectionLevel: "H",
                width: 512,
                margin: 4,
                color: { dark: "#1f2933", light: "#ffffff" },
              });
              setQrUrl(dataUrl);
            } catch {
              // ignore QR generation errors
            }
          }
        }
      }

      setResult((prev) =>
        prev
          ? {
              ...prev,
              message: "Transfer submitted. Shipment created.",
            }
          : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
          {error}
        </p>
      )}

      <form onSubmit={handleCheck} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Asset name
          </label>
          <input
            type="text"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            disabled={loading}
            placeholder="e.g. Organic Mango Batch 01"
            className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] bg-white disabled:bg-gray-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-3 rounded-md bg-[#c41e3a] text-white text-base font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </form>

      {result && (
        <div className="border border-gray-200 rounded-lg bg-white p-4 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Result</h2>
          <p className="text-sm text-gray-700">{result.message}</p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="font-semibold text-gray-600">In warehouse</dt>
              <dd className="text-gray-900">
                {result.inWarehouse ? "Yes" : "No"}
              </dd>
            </div>
            {result.walletHasNft !== undefined && (
              <div>
                <dt className="font-semibold text-gray-600">Wallet holds NFT</dt>
                <dd className={result.walletHasNft ? "text-emerald-600 font-medium" : "text-amber-600"}>
                  {result.walletHasNft ? "Yes" : "No"}
                </dd>
              </div>
            )}
            {result.policyId && (
              <div className="sm:col-span-2">
                <dt className="font-semibold text-gray-600">Policy ID</dt>
                <dd className="font-mono text-gray-900 break-all">{result.policyId}</dd>
              </div>
            )}
            {result.assetName && (
              <div>
                <dt className="font-semibold text-gray-600">Asset name</dt>
                <dd className="text-gray-900">{result.assetName}</dd>
              </div>
            )}
            {result.unit && (
              <div className="sm:col-span-2">
                <dt className="font-semibold text-gray-600">Unit</dt>
                <dd className="font-mono text-gray-900 break-all text-xs">{result.unit}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {canSend && (
        <div className="border border-gray-200 rounded-lg bg-white p-4 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Send NFT</h2>
          {senderInfo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Sender (your wallet)
                </label>
                <div className="w-full px-4 py-3 text-sm border border-gray-200 rounded-md bg-gray-50 font-mono text-gray-700 break-all">
                  {senderInfo.walletAddress}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Display name
                </label>
                <div className="w-full px-4 py-3 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                  {senderInfo.displayName || "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Location
                </label>
                <div className="w-full px-4 py-3 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                  {senderInfo.location || "-"}
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[240px] flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Receiver address
              </label>
              <input
                type="text"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                disabled={sending || loading}
                placeholder="addr_test1..."
                className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] bg-white disabled:bg-gray-50"
              />
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || loading || !receiver.trim()}
              className="px-4 py-3 rounded-md bg-[#c41e3a] text-white text-base font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>

          {sendTxHash && (
            <p className="text-sm text-emerald-700 break-all">
              Tx hash: {sendTxHash}
            </p>
          )}
          {orderId && qrUrl && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-600">
                Download this QR and send it to the receiver. They can scan it in the dashboard scan tab to confirm receipt.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <img
                  src={qrUrl}
                  alt="Order QR"
                  className="w-32 h-32 border border-gray-200 rounded-md bg-white"
                />
                <a
                  href={qrUrl}
                  download={`ORDER_${orderId}.png`}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-gray-800 text-white text-sm font-semibold hover:bg-black transition-colors"
                >
                  Download order QR
                </a>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500">
            This sends the NFT (CIP-68 user token 222) to the receiver. After submit, the asset will be detached from your warehouse (asset record remains).
          </p>
        </div>
      )}
    </div>
  );
}

