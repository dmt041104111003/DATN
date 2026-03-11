"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

  React.useEffect(() => {
    if (!warehouseId) return;
    let cancelled = false;
    (async () => {
      try {
        const cookie = document.cookie
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("auth_token="));
        const token = cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
        if (!token) {
          setError("Unauthorized. Please sign in again.");
          return;
        }

        const [listRes, assetsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/warehouses`, {
            cache: "no-store",
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BACKEND_URL}/warehouses/${warehouseId}/assets`, {
            cache: "no-store",
            headers: { Authorization: `Bearer ${token}` },
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
  }, [warehouseId]);

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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500 bg-white">
                    Loading assets...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500 bg-white">
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
