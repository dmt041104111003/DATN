"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { AssetForm, type InitialAssetData } from "../../asset-tools/AssetForm";
import { signTxWithEternl, submitSignedTxHex } from "@/lib/wallet";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type AssetRecord = {
  id: string;
  policyId: string;
  assetName: string;
  unit: string;
  txHash: string;
  owners: string[];
  name: string;
  description: string;
  quantity?: string;
  quantityUnit?: string;
  brand?: string | null;
  model?: string | null;
  material?: string | null;
  notes?: string | null;
  battery?: string | null;
  image?: string | null;
  mediaType?: string | null;
  roadmap?: string | null;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function WarehouseAssetsPage() {
  const params = useParams();
  const warehouseId = typeof params?.id === "string" ? params.id : null;
  const [warehouseCode, setWarehouseCode] = React.useState<string>("");
  const [warehouseName, setWarehouseName] = React.useState<string>("");
  const [assets, setAssets] = React.useState<AssetRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [roleCode, setRoleCode] = React.useState<string>("");

  const [actionMode, setActionMode] = React.useState<"list" | "update" | "burn">("list");
  const [selectedAsset, setSelectedAsset] = React.useState<AssetRecord | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [consumingId, setConsumingId] = React.useState<string | null>(null);

  const canEdit = roleCode === "ENTERPRISE";
  const canConsume = roleCode === "AGENT";

  React.useEffect(() => {
    if (!warehouseId) return;
    let cancelled = false;
    (async () => {
      try {
        const [listRes, assetsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/warehouses`, {
            cache: "no-store",
            credentials: "include",
          }),
          fetch(`${BACKEND_URL}/warehouses/${warehouseId}/assets`, {
            cache: "no-store",
            credentials: "include",
          }),
        ]);

        if (!assetsRes.ok) {
          const data = await assetsRes.json().catch(() => null);
          throw new Error(
            data?.message || data?.error || "Failed to load assets in warehouse",
          );
        }

        const assetsData = (await assetsRes.json()) as AssetRecord[];
        if (!cancelled) {
          setAssets(Array.isArray(assetsData) ? assetsData : []);
        }

        if (listRes.ok) {
          const list = (await listRes.json()) as { id: string; code: string; name: string }[];
          const wh = Array.isArray(list) ? list.find((w) => w.id === warehouseId) : null;
          if (wh && !cancelled) {
            setWarehouseCode(wh.code);
            setWarehouseName(wh.name);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [warehouseId, refreshKey]);

  React.useEffect(() => {
    const loadRole = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        const rc =
          (typeof (data?.user as any)?.roleCode === "string" &&
            (data.user as any).roleCode) ||
          (typeof (data?.user as any)?.role === "string" &&
            (data.user as any).role) ||
          "";
        setRoleCode(String(rc || "").trim());
      } catch {
        // ignore
      }
    };
    loadRole();
  }, []);

  if (!warehouseId) {
    return (
      <div className="w-full">
        <Link
          href="/dashboard/warehouses?tab=table"
          className="text-sm text-[#c41e3a] hover:text-red-700 underline underline-offset-2"
        >
          ← Warehouses
        </Link>
        <p className="text-sm text-gray-500 mt-4">Invalid warehouse.</p>
      </div>
    );
  }

  const initialAsset = React.useMemo<InitialAssetData | null>(() => {
    if (!selectedAsset) return null;
    return {
      assetName: selectedAsset.assetName,
      owners: selectedAsset.owners,
      name: selectedAsset.name,
      description: selectedAsset.description,
      quantity: (selectedAsset as any).quantity ?? "",
      quantityUnit: (selectedAsset as any).quantityUnit ?? "",
      brand: selectedAsset.brand ?? null,
      model: selectedAsset.model ?? null,
      material: selectedAsset.material ?? null,
      notes: selectedAsset.notes ?? null,
      battery: selectedAsset.battery ?? null,
      image: selectedAsset.image ?? null,
      mediaType: selectedAsset.mediaType ?? null,
      roadmap: selectedAsset.roadmap ?? null,
      location: selectedAsset.location ?? null,
    };
  }, [selectedAsset]);

  const handleDownloadQr = React.useCallback(async (row: AssetRecord) => {
    if (typeof window === "undefined") return;
    try {
      setDownloadingId(row.id);
      const id = row.policyId + row.assetName;
      const productUrl = `${window.location.origin}/product/${encodeURIComponent(id)}`;

      const dataUrl = await QRCode.toDataURL(productUrl, {
        errorCorrectionLevel: "H",
        width: 512,
        margin: 4,
        color: { dark: "#1e293b", light: "#ffffff" },
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      const safeId = (row.policyId + row.assetName).replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `QR_${safeId || "asset"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setError("Failed to generate QR for this asset.");
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const handleConsume222 = React.useCallback(
    async (row: AssetRecord) => {
      if (!warehouseId) return;
      setError("");
      setNotice("");
      setConsumingId(row.id);
      try {
        const burnRes = await fetch(`${BACKEND_URL}/warehouses/${warehouseId}/burn-token222`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ unit: row.unit }),
        });
        const burnData = await burnRes.json();
        if (!burnRes.ok || !burnData?.result || !burnData?.data) {
          throw new Error(
            burnData?.message || burnData?.error || "Failed to build burn token 222 transaction",
          );
        }

        const signed = await signTxWithEternl(String(burnData.data));
        const txHash = await submitSignedTxHex(signed);
        setNotice(`Consumed ${row.assetName}. Tx: ${txHash}`);

        // Keep warehouse list in sync after consume.
        try {
          await fetch(`${BACKEND_URL}/order/clear-warehouse`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ unit: row.unit, status: "CONSUMED", txHash }),
          });
        } catch {
          // ignore
        }
        setRefreshKey((k) => k + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setConsumingId(null);
      }
    },
    [warehouseId],
  );

  if (actionMode !== "list" && selectedAsset) {
    // ENTERPRISE only: render update/burn flow inside this warehouse page.
    if (!canEdit) {
      return (
        <div className="flex flex-col gap-4 w-full">
          <Link
            href="/dashboard/warehouses"
            className="text-sm text-[#c41e3a] hover:text-red-700 underline underline-offset-2"
          >
            ← Warehouses
          </Link>
          <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
            <h1 className="text-lg font-semibold text-gray-900">Forbidden</h1>
            <p className="text-sm text-gray-600 mt-1">
              Only ENTERPRISE can update/burn assets.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setActionMode("list");
              setSelectedAsset(null);
            }}
            className="text-sm text-[#c41e3a] hover:text-red-700 underline underline-offset-2"
          >
            ← Back to assets
          </button>
          <span className="text-sm text-gray-500">
            {warehouseCode ? `${warehouseCode} — ${warehouseName}` : "Warehouse"}
          </span>
        </div>

        <AssetForm
          mode={actionMode as "update" | "burn"}
          initialAssetName={selectedAsset.assetName}
          initialAsset={initialAsset}
          onSuccess={() => {
            setActionMode("list");
            setSelectedAsset(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/warehouses?tab=table"
          className="text-sm text-[#c41e3a] hover:text-red-700 underline underline-offset-2"
        >
          ← Warehouses
        </Link>
      </div>

      <div>
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          {warehouseCode ? `${warehouseCode} — ${warehouseName}` : "Warehouse"} — Assets
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Assets in this warehouse.
        </p>
      </div>

      <div className="w-full space-y-2">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
            {error}
          </p>
        )}
        {notice && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-4 py-3">
            {notice}
          </p>
        )}

        <div className="overflow-auto">
          <table className="min-w-full text-base">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                  #
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                  Asset name
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                  Tx hash
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                  Location
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-left">
                  Created
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-gray-500 bg-white"
                  >
                    Loading assets...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-gray-500 bg-white"
                  >
                    No assets in this warehouse.
                  </td>
                </tr>
              ) : (
                assets.map((row, index) => (
                  <tr key={row.id} className="border-t border-gray-200">
                    <td className="px-4 py-3 border-r border-gray-200 text-gray-700">
                      {index + 1}
                    </td>
                    <td
                      className="px-4 py-3 border-r border-gray-200 text-gray-900 max-w-[160px] whitespace-nowrap overflow-hidden text-ellipsis"
                      title={row.assetName}
                    >
                      {row.assetName}
                    </td>
                    <td
                      className="px-4 py-3 border-r border-gray-200 font-mono text-base text-emerald-700 max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis"
                      title={row.txHash}
                    >
                      {row.txHash}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 text-gray-700">
                      {row.location || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="flex flex-wrap gap-2 text-base text-gray-700">
                        <button
                          type="button"
                          onClick={() => handleDownloadQr(row)}
                          className="underline-offset-2 hover:underline"
                        >
                          {downloadingId === row.id ? "Downloading..." : "Download"}
                        </button>
                        {canEdit && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAsset(row);
                                setActionMode("update");
                              }}
                              className="underline-offset-2 hover:underline"
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAsset(row);
                                setActionMode("burn");
                              }}
                              className="underline-offset-2 hover:underline"
                            >
                              Burn
                            </button>
                          </>
                        )}
                        {canConsume && (
                          <button
                            type="button"
                            onClick={() => handleConsume222(row)}
                            disabled={consumingId === row.id}
                            className="underline-offset-2 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {consumingId === row.id ? "Consuming..." : "Consume"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
