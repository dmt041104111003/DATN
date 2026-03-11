"use client";

import * as React from "react";
import { TablePagination } from "@/components/TablePagination";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type BurnRow = {
  id: string;
  assetUnit: string;
  policyId: string;
  assetName: string;
  burnerWalletAddress: string;
  txHash: string;
  createdAt: string;
};

const getToken = () => {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("auth_token="));
  return cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : "";
};

export function BurnHistoryTable() {
  const [burnRows, setBurnRows] = React.useState<BurnRow[]>([]);
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 10;

  const loadBurns = React.useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/burn/list`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as BurnRow[];
        setBurnRows(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    loadBurns();
  }, [loadBurns]);

  const pagedRows = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return burnRows.slice(start, start + PAGE_SIZE);
  }, [burnRows, page]);

  React.useEffect(() => {
    setPage(1);
  }, [burnRows.length]);

  return (
    <div className="w-full space-y-2">
      <div className="overflow-auto">
        <table className="min-w-full text-base">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                #
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                Asset
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                Unit
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                Tx
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-left">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {burnRows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-4 text-center text-gray-500 bg-white"
                >
                  No retired assets.
                </td>
              </tr>
            ) : (
              pagedRows.map((row, idx) => (
                <tr key={row.id} className="border-t border-gray-200">
                  <td className="px-4 py-3 border-r border-gray-200 text-gray-700">
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-gray-900 max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {row.assetName}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 font-mono text-gray-700 max-w-[260px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {row.assetUnit}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 font-mono text-emerald-700 max-w-[260px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {row.txHash}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        pageSize={PAGE_SIZE}
        total={burnRows.length}
        onPageChange={setPage}
      />
    </div>
  );
}

