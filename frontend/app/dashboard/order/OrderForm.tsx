"use client";

import * as React from "react";
import {
  getWalletChangeAddress,
  signTxWithEternl,
  submitSignedTxHex,
} from "@/lib/wallet";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type OrderCheckResult = {
  inWarehouse: boolean;
  policyId?: string;
  assetName?: string;
  unit?: string;
  walletHasNft?: boolean;
  owners?: string[];
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

  const receiverOptions = React.useMemo(() => {
    const owners = Array.isArray(result?.owners) ? result?.owners : [];
    const me = (senderInfo?.walletAddress || "").trim();
    if (!me) return owners;
    return owners.filter((o) => o !== me);
  }, [result?.owners, senderInfo?.walletAddress]);

  React.useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
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
      const res = await fetch(`${BACKEND_URL}/order/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ assetName: name }),
      });
      const data = (await res.json()) as OrderCheckResult;
      if (!res.ok) {
        throw new Error((data as any)?.message ?? "Check failed");
      }
      setResult(data);
      const owners = Array.isArray(data?.owners) ? data.owners : [];
      const me = (senderInfo?.walletAddress || "").trim();
      const filtered = me ? owners.filter((o) => o !== me) : owners;
      setReceiver(filtered.length > 0 ? filtered[0] : "");
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
    !!result?.unit &&
    Array.isArray(result?.owners) &&
    (receiverOptions?.length ?? 0) > 0 &&
    !!receiver.trim();

  React.useEffect(() => {
    if (!Array.isArray(result?.owners)) return;
    if (receiverOptions.length === 0) {
      if (receiver) setReceiver("");
      return;
    }
    if (!receiverOptions.includes(receiver)) {
      setReceiver(receiverOptions[0] ?? "");
    }
  }, [receiverOptions, receiver, result?.owners]);

  const handleSend = async () => {
    setError("");
    setSendTxHash("");
    if (!canSend) {
      setError("Check must succeed and wallet must hold the NFT before sending.");
      return;
    }
    const to = receiver.trim();
    if (!to) {
      setError("Enter receiver address.");
      return;
    }
    if (senderInfo?.walletAddress && to === senderInfo.walletAddress) {
      setError("Receiver cannot be your own wallet address.");
      return;
    }
    if (!Array.isArray(result?.owners) || !result.owners.includes(to)) {
      setError("Receiver must be selected from the dropdown.");
      return;
    }
    setSending(true);
    try {
      if (typeof window === "undefined") {
        throw new Error("Browser environment required");
      }

      const walletAddress = await getWalletChangeAddress();

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

      const signed = await signTxWithEternl(unsignedData.data);

      const hash = await submitSignedTxHex(signed);
      setSendTxHash(hash);

      const shipRes = await fetch(`${BACKEND_URL}/order/ship`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          receiverWalletAddress: to,
          policyId: result!.policyId,
          assetName: result!.assetName,
          unit: result!.unit,
          txHash: hash,
        }),
      });

      await shipRes.json().catch(() => null);

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
              <select
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                disabled={
                  sending ||
                  loading ||
                  !Array.isArray(result?.owners) ||
                  receiverOptions.length === 0
                }
                className="w-full px-4 py-3 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] bg-white disabled:bg-gray-50"
              >
                <option value="">Select receiver...</option>
                {receiverOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
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
        </div>
      )}
    </div>
  );
}

