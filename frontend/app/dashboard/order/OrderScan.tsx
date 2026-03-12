"use client";

import * as React from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { ref100Unit } from "@/lib/cip68";
import { CheckCircle, XCircle } from "lucide-react";
import {
  getWalletChangeAddress,
  signTxWithEternl,
  submitSignedTxHex,
} from "@/lib/wallet";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type OrderRow = {
  id: string;
  assetUnit: string;
  policyId: string;
  assetName: string;
  senderWalletAddress: string;
  receiverWalletAddress: string;
  txHash?: string | null;
  status: "PENDING" | "SHIPPED" | "RECEIVED" | "CANCELLED";
};

type WarehouseOption = {
  id: string;
  code: string;
  name: string;
  maxAssets?: number | null;
  assetCount?: number;
};

export function OrderScan() {
  const [result, setResult] = React.useState<string | null>(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [scanMessage, setScanMessage] = React.useState("");
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [confirmTxHash, setConfirmTxHash] = React.useState<string | null>(null);

  const [order, setOrder] = React.useState<OrderRow | null>(null);
  const [warehouses, setWarehouses] = React.useState<WarehouseOption[]>([]);
  const [receiveWarehouseId, setReceiveWarehouseId] = React.useState("");
  const [receiveLocation, setReceiveLocation] = React.useState("");
  const [traceMeta, setTraceMeta] = React.useState<Record<string, unknown> | null>(null);
  const [loadingTrace, setLoadingTrace] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [profileLocation, setProfileLocation] = React.useState<string | null>(null);

  const getToken = () => {
    if (typeof document === "undefined") return "";
    const cookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("auth_token="));
    return cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
  };

  const parseStops = React.useCallback((roadmapRaw: unknown) => {
    const raw = typeof roadmapRaw === "string" ? roadmapRaw.trim() : "";
    if (!raw) return [] as string[];
    const inner = raw.replace(/^\s*\[\s*/, "").replace(/\s*\]\s*$/, "");
    return inner
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, []);

  const fetchRef100Metadata = React.useCallback(
    async (policyId: string, assetName: string) => {
      const pid = (policyId || "").trim();
      const name = (assetName || "").trim();
      if (!pid || !name) return null as Record<string, unknown> | null;
      const referenceUnit = ref100Unit(pid, name);
      const res = await fetch(
        `${BACKEND_URL}/trace/${encodeURIComponent(referenceUnit)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { metadata?: Record<string, unknown> };
      return (data?.metadata || null) as Record<string, unknown> | null;
    },
    [],
  );

  const loadOrderById = React.useCallback(
    async (orderId: string) => {
      const token = getToken();
      if (!token) {
        setError("");
        return;
      }
      setError("");
      setOrder(null);
      setTraceMeta(null);
      setReceiveWarehouseId("");
      setReceiveLocation("");
      setShowConfirm(false);
      setScanMessage("");

      const incomingRes = await fetch(`${BACKEND_URL}/order/incoming`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!incomingRes.ok) {
        setScanMessage("Failed to load incoming orders.");
        return;
      }
      const raw = await incomingRes.json();
      const rows: OrderRow[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as any)?.data)
        ? (raw as any).data
        : Array.isArray((raw as any)?.orders)
        ? (raw as any).orders
        : [];
      const orderIdNorm = String(orderId).trim();
      const found = rows.find(
        (r) => r != null && r.id != null && String(r.id).trim() === orderIdNorm
      );
      if (!found) {
        setScanMessage(
          "Order not found in your incoming list. Check that the QR is for an order sent to you and status is SHIPPED."
        );
        return;
      }
      if (found.status !== "SHIPPED") {
        setScanMessage(
          `Order status is "${found.status}". Only SHIPPED orders can be received here.`
        );
        return;
      }
      setScanMessage("");
      setOrder(found);
      setShowConfirm(true);

      setLoadingTrace(true);
      try {
        const meta = await fetchRef100Metadata(found.policyId, found.assetName);
        if (!meta) {
          setTraceMeta({});
        } else {
          setTraceMeta(meta);
          const stops = parseStops(meta["roadmap"]);
          let defaultLoc =
            typeof meta["location"] === "string"
              ? ((meta["location"] as string) || "").trim()
              : (stops[0] ?? "").trim();

          if (profileLocation) {
            const match = stops.find(
              (s) => s.trim().toLowerCase() === profileLocation.trim().toLowerCase(),
            );
            if (match) {
              defaultLoc = match;
            }
          }

          if (defaultLoc) {
            setReceiveLocation(defaultLoc);
          }
        }
      } finally {
        setLoadingTrace(false);
      }
    },
    [fetchRef100Metadata, parseStops, profileLocation],
  );

  const handleScan = (results: any[]) => {
    if (results.length === 0 || isPaused || isProcessing) return;
    setIsProcessing(true);
    const text = results[0].rawValue as string;
    setResult(text);
    setIsPaused(true);

    try {
      let url: URL | null = null;
      if (text.startsWith("http://") || text.startsWith("https://")) {
        url = new URL(text);
      } else if (typeof window !== "undefined") {
        url = new URL(text.trim(), window.location.origin);
      }
      let orderId: string | null = null;
      if (url) {
        orderId = url.searchParams.get("orderId")?.trim() || null;
        if (!orderId && url.hash) {
          const hashParams = new URLSearchParams(
            url.hash.replace(/^#/, "").replace(/^\?/, "")
          );
          orderId = hashParams.get("orderId")?.trim() || null;
        }
      }
      if (!orderId) {
        setScanMessage("QR does not contain a valid orderId.");
        setIsProcessing(false);
        return;
      }
      loadOrderById(orderId).finally(() => {
        setIsProcessing(false);
      });
    } catch {
      setScanMessage("Not a valid system QR.");
      setIsProcessing(false);
    }
  };

  const handleRestart = () => {
    setResult(null);
    setIsPaused(false);
    setIsProcessing(false);
    setError("");
    setScanMessage("");
    setOrder(null);
    setTraceMeta(null);
    setReceiveWarehouseId("");
    setReceiveLocation("");
    setShowConfirm(false);
    setConfirmTxHash(null);
  };

  React.useEffect(() => {
    const token = getToken();
    if (!token) return;
    const load = async () => {
      try {
        const [whRes, meRes] = await Promise.all([
          fetch(`${BACKEND_URL}/warehouses`, {
            cache: "no-store",
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BACKEND_URL}/auth/me`, {
            cache: "no-store",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (whRes.ok) {
          const whData = (await whRes.json()) as WarehouseOption[];
          setWarehouses(Array.isArray(whData) ? whData : []);
        }
        if (meRes.ok) {
          const me = (await meRes.json()) as {
            profile?: { location?: string | null } | null;
          };
          const loc = (me.profile as any)?.location;
          if (typeof loc === "string" && loc.trim()) {
            setProfileLocation(loc.trim());
          }
        }
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  const handleConfirm = async () => {
    if (!order) return;
    setError("");
    const token = getToken();
    if (!token) {
      setError("Unauthorized. Please sign in again.");
      return;
    }
    const warehouseId = receiveWarehouseId.trim();
    if (!warehouseId) {
      setError("Select a warehouse before confirming receive.");
      return;
    }
    const nextLocation = receiveLocation.trim();
    if (!nextLocation) {
      setError("Select a location before confirming receive.");
      return;
    }
    setConfirming(true);
    try {
      const walletAddress = await getWalletChangeAddress();

      const latestMeta = await fetchRef100Metadata(
        order.policyId,
        order.assetName,
      );
      if (!latestMeta) {
        throw new Error(
          "Failed to load on-chain datum for reference token (ref100).",
        );
      }
      const ownersRes = await fetch(`${BACKEND_URL}/order/owners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order.id }),
      });
      const ownersData = (await ownersRes.json()) as {
        success?: boolean;
        owners?: string[];
        message?: string;
      };
      const owners =
        ownersRes.ok && ownersData?.success && Array.isArray(ownersData.owners)
          ? ownersData.owners
          : [];
      if (owners.length === 0) {
        throw new Error(ownersData?.message || "Owners not found for this order");
      }
      const signer = (walletAddress || "").trim();
      if (signer && !owners.includes(signer)) {
        throw new Error(
          "Your wallet is not in script owners list. Cannot update ref100.",
        );
      }

      const updatedMeta: Record<string, string> = {};
      for (const [k, v] of Object.entries(latestMeta)) {
        updatedMeta[k] = typeof v === "string" ? v : JSON.stringify(v);
      }
      updatedMeta["location"] = nextLocation;

      const unsignedRes = await fetch(`${BACKEND_URL}/contract/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          owners,
          assets: [{ assetName: order.assetName, metadata: updatedMeta }],
        }),
      });
      const unsignedData = await unsignedRes.json();
      if (!unsignedRes.ok || !unsignedData?.result || !unsignedData?.data) {
        throw new Error(
          unsignedData?.message || "Failed to build update transaction",
        );
      }

      const signed = await signTxWithEternl(unsignedData.data);
      const updateTxHash = await submitSignedTxHex(signed);

      await fetch(
        `${BACKEND_URL}/assets/${encodeURIComponent(order.assetUnit)}/location`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            location: nextLocation,
            txHash: updateTxHash,
          }),
        },
      ).catch(() => null);

      const res = await fetch(`${BACKEND_URL}/order/confirm-receive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order.id, warehouseId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to confirm receive");
      }
      setError("");
      setConfirmTxHash(updateTxHash);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to confirm receive",
      );
    } finally {
      setConfirming(false);
    }
  };

  React.useEffect(() => {
    if (!confirmTxHash) return;
    try {
      const AudioCtx =
        typeof window !== "undefined"
          ? (window.AudioContext || (window as any).webkitAudioContext)
          : null;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.value = 0.12;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => {
          osc.stop();
          ctx.close();
        }, 150);
      }
    } catch {
    }
    const t = setTimeout(() => {
      handleRestart();
    }, 2000);
    return () => clearTimeout(t);
  }, [confirmTxHash]);

  return (
    <div className="w-full space-y-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-full max-w-md">
          <div className="relative aspect-square rounded-md overflow-hidden border border-gray-300 bg-black">
            <Scanner
              onScan={handleScan}
              paused={isPaused}
              constraints={{
                facingMode: "environment",
                width: { ideal: 1280, min: 640 },
                height: { ideal: 720, min: 480 },
              }}
              scanDelay={120}
              formats={["qr_code"]}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { objectFit: "cover", width: "100%", height: "100%" },
              }}
              components={{
                torch: true,
                zoom: true,
                finder: true,
              }}
              allowMultiple={false}
            />

            {!isPaused && !result && (
              <>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 md:w-56 md:h-56 border-4 border-dashed border-[#c41e3a]/45 rounded-2xl" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-48 h-48 md:w-56 md:h-56 overflow-hidden rounded-2xl border border-transparent">
                    <div
                      className="absolute left-0 right-0 h-1 md:h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"
                      style={{ animation: "scanLine 2s linear infinite" }}
                    />
                  </div>
                </div>
              </>
            )}

            {result && !confirmTxHash && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-md overflow-hidden">
                <div className="w-full px-4 py-6 text-center space-y-3 max-w-xs mx-auto">
                  {isProcessing ? (
                    <>
                      <div className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                      <p className="text-lg font-bold text-white">
                        Checking order…
                      </p>
                    </>
                  ) : order ? (
                    <>
                      <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
                      <p className="text-lg font-bold text-white">
                        Scan successful
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-14 h-14 text-red-500 mx-auto" />
                      <p className="text-lg font-bold text-white">
                        {scanMessage || "Scan failed"}
                      </p>
                      <button
                        type="button"
                        onClick={handleRestart}
                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-[#c41e3a] text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        Scan again
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {showConfirm && order && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center px-3"
              style={{
                backgroundColor: confirmTxHash ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.6)",
              }}
              onClick={() => {
                if (!confirming && !confirmTxHash) {
                  handleRestart();
                }
              }}
            >
              {confirmTxHash ? (
                <div className="text-center pointer-events-none">
                  <CheckCircle
                    className="w-28 h-28 md:w-32 md:h-32 text-green-500 mx-auto"
                    style={{ animation: "orderScanCheck 0.5s ease-out" }}
                  />
                  <p className="mt-4 text-lg font-semibold text-white">
                    Order confirmed
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    Closing in 2s…
                  </p>
                </div>
              ) : (
              <div
                className="w-full max-w-md bg-white border border-gray-200 rounded-md p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      Confirm receive
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {order.assetName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirming) {
                        handleRestart();
                      }
                    }}
                    disabled={confirming}
                    className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Close
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <select
                    value={receiveWarehouseId}
                    onChange={(e) => setReceiveWarehouseId(e.target.value)}
                    className="w-full px-3 py-2 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] bg-white"
                  >
                    <option value="">Select warehouse…</option>
                    {warehouses.map((w) => {
                      const max =
                        typeof w.maxAssets === "number" && w.maxAssets > 0
                          ? w.maxAssets
                          : null;
                      const count = w.assetCount ?? 0;
                      const isFull = max !== null && count >= max;
                      return (
                        <option
                          key={w.id}
                          value={w.id}
                          disabled={isFull}
                        >
                          {w.code} — {w.name}
                          {isFull ? " (Full)" : ""}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    value={receiveLocation}
                    onChange={(e) => setReceiveLocation(e.target.value)}
                    className="w-full px-3 py-2 text-base border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/30 focus:border-[#c41e3a] bg-white"
                    disabled={loadingTrace}
                  >
                    <option value="">
                      {loadingTrace ? "Loading locations…" : "Select location…"}
                    </option>
                    {(() => {
                      const meta = traceMeta || {};
                      const stops = parseStops((meta as any)["roadmap"]);
                      return stops.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ));
                    })()}
                  </select>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={
                      confirming ||
                      !receiveWarehouseId.trim() ||
                      !receiveLocation.trim()
                    }
                    className="mt-1 inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#c41e3a] text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {confirming ? "Confirming..." : "Confirm (sign with wallet)"}
                  </button>
                </div>
              </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

