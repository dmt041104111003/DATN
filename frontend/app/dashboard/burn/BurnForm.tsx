"use client";

import * as React from "react";
import { BrowserWallet, CIP68_100, stringToHex } from "@meshsdk/core";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type BurnCheckResult = {
  inWarehouse: boolean;
  policyId?: string;
  assetName?: string;
  unit?: string;
  walletHasNft?: boolean;
  message?: string;
};

const getToken = () => {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("auth_token="));
  return cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
};

export function BurnForm() {
  const [assetName, setAssetName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [burning, setBurning] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<BurnCheckResult | null>(null);
  const [burnTxHash, setBurnTxHash] = React.useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setBurnTxHash("");

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
      const res = await fetch(`${BACKEND_URL}/burn/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assetName: name }),
      });
      const data = (await res.json()) as BurnCheckResult;
      if (!res.ok) {
        throw new Error((data as any)?.message ?? "Check failed");
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setLoading(false);
    }
  };

  const canBurn =
    !!result?.inWarehouse &&
    !!result?.walletHasNft &&
    !!result?.assetName &&
    !!result?.policyId &&
    !!result?.unit;

  const handleBurn = async () => {
    setError("");
    setBurnTxHash("");
    if (!result) {
      setError("Check must succeed before retiring an asset.");
      return;
    }
    const token = getToken();
    if (!token) {
      setError("Unauthorized. Please sign in again.");
      return;
    }
    setBurning(true);
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

      if (!result.policyId || !result.assetName) {
        throw new Error(
          "Missing policyId or assetName to resolve reference token.",
        );
      }
      const referenceUnit =
        result.policyId + CIP68_100(stringToHex(result.assetName));
      const traceRes = await fetch(
        `${BACKEND_URL}/trace/${encodeURIComponent(referenceUnit)}`,
        { cache: "no-store" },
      );
      const traceData = await traceRes.json();
      const meta = (traceData?.metadata || {}) as Record<string, unknown>;
      const rawOwners =
        typeof meta["owners"] === "string" ? (meta["owners"] as string) : "";
      let owners = rawOwners
        .replace(/^\s*\[\s*/, "")
        .replace(/\s*\]\s*$/, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (owners.length === 0 && result.unit) {
        const ownersRes = await fetch(`${BACKEND_URL}/burn/owners`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ unit: result.unit }),
        });
        const ownersData = (await ownersRes.json()) as {
          success?: boolean;
          owners?: string[];
          message?: string;
        };
        if (
          ownersRes.ok &&
          ownersData?.success &&
          Array.isArray(ownersData.owners)
        ) {
          owners = ownersData.owners.map((s) => s.trim()).filter(Boolean);
        }
      }

      if (owners.length === 0) {
        throw new Error(
          "Owners not found (datum/script params). Cannot build retire transaction.",
        );
      }

      const unsignedRes = await fetch(`${BACKEND_URL}/contract/retire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          owners,
          assets: [{ assetName: result.assetName }],
        }),
      });
      const unsignedData = await unsignedRes.json();
      if (!unsignedRes.ok || !unsignedData?.result || !unsignedData?.data) {
        throw new Error(
          unsignedData?.message || "Failed to build retire transaction",
        );
      }

      const signed = await wallet.signTx(unsignedData.data, true);
      const submitRes = await fetch(`${BACKEND_URL}/contract/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedTx: signed }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok || !submitData?.result || !submitData?.data) {
        throw new Error(
          submitData?.message || "Failed to submit transaction",
        );
      }

      const hash = submitData.data as string;
      setBurnTxHash(hash);

      await fetch(`${BACKEND_URL}/burn/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          policyId: result.policyId,
          assetName: result.assetName,
          unit: result.unit,
          txHash: hash,
        }),
      }).catch(() => null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retire failed");
    } finally {
      setBurning(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
          {error}
        </p>
      )}

      <form
        onSubmit={handleCheck}
        className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
      >
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Asset name
          </label>
          <input
            type="text"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            disabled={loading || burning}
            placeholder="Enter asset name to retire"
            className="w-full px-4 py-2.5 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] bg-white disabled:bg-gray-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !assetName.trim()}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-[#c41e3a] text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Checking..." : "Check asset"}
        </button>
      </form>

      {result && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2 text-sm">
          <p className="font-semibold text-gray-800">Check result</p>
          <p className="text-gray-700">
            {result.message ||
              "Ready to retire if NFT is in your wallet and asset is in your warehouse."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <div>
              <span className="text-sm text-gray-500">In warehouse</span>
              <p className="text-sm font-medium text-gray-900">
                {result.inWarehouse ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Wallet holds NFT</span>
              <p
                className={
                  result.walletHasNft
                    ? "text-sm font-medium text-emerald-600"
                    : "text-sm font-medium text-amber-600"
                }
              >
                {result.walletHasNft ? "Yes" : "No"}
              </p>
            </div>
            {result.policyId && (
              <div className="sm:col-span-2">
                <span className="text-sm text-gray-500">Policy ID</span>
                <p className="text-sm font-mono break-all text-gray-900">
                  {result.policyId}
                </p>
              </div>
            )}
            {result.assetName && (
              <div>
                <span className="text-sm text-gray-500">Asset name</span>
                <p className="text-sm font-medium text-gray-900">
                  {result.assetName}
                </p>
              </div>
            )}
            {result.unit && (
              <div className="sm:col-span-2">
                <span className="text-sm text-gray-500">Unit</span>
                <p className="text-sm font-mono break-all text-gray-900">
                  {result.unit}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {canBurn && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-900">
            Retire this asset from the supply chain
          </p>
          <p className="text-sm text-gray-600">
            This will burn the on-chain NFT and detach the asset from your
            warehouse. The burn will be recorded in your history.
          </p>
          <button
            type="button"
            onClick={handleBurn}
            disabled={burning}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-[#c41e3a] text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {burning ? "Retiring..." : "Retire asset"}
          </button>
          {burnTxHash && (
            <p className="text-sm text-emerald-700 break-all mt-1">
              Burn tx hash: {burnTxHash}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

