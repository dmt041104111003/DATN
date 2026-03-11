"use client";

import * as React from "react";
import { TablePagination } from "@/components/TablePagination";

export type AssetImageRow = {
  id: string;
  name: string;
  type: string;
  input: string;
  previewUrl: string;
  createdAt: string;
};

const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY ||
  process.env.NEXT_PUBLIC_PINATA_PUBLIC_GATEWAY ||
  "";

function buildGatewayUrl(raw: string): string {
  const value = (raw || "").trim();
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("ipfs://")) {
    const cid = value.replace(/^ipfs:\/\//, "");
    return PINATA_GATEWAY
      ? `https://${PINATA_GATEWAY}/ipfs/${cid}`
      : `https://ipfs.io/ipfs/${cid}`;
  }

  return PINATA_GATEWAY
    ? `https://${PINATA_GATEWAY}/ipfs/${value}`
    : `https://ipfs.io/ipfs/${value}`;
}

function formatPreviewLabel(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname || "";
    if (!path || path === "/") return u.hostname;
    if (path.length <= 24) return `${u.hostname}${path}`;
    const start = path.slice(0, 8);
    const end = path.slice(-6);
    return `${u.hostname}${start}...${end}`;
  } catch {
    if (url.length <= 28) return url;
    return `${url.slice(0, 12)}...${url.slice(-8)}`;
  }
}

type AssetImageTableProps = {
  rows: AssetImageRow[];
  onEdit: (row: AssetImageRow) => void;
  onDelete: (row: AssetImageRow) => void;
  saving?: boolean;
};

export function AssetImageTable({
  rows,
  onEdit,
  onDelete,
  saving = false,
}: AssetImageTableProps) {
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 10;

  const pagedRows = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  React.useEffect(() => {
    setPage(1);
  }, [rows.length]);

  return (
    <div className="w-full space-y-2">
      <div className="overflow-auto">
        <table className="min-w-full text-base">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200 w-16">
                #
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                Name
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                Type
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-left border-r border-gray-200">
                Preview
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-left">
                Created at
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-left w-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-4 text-center text-gray-500 bg-white"
                >
                  No images yet. Use the image form above to add entries.
                </td>
              </tr>
            ) : (
              pagedRows.map((row, index) => (
                <tr key={row.id} className="border-t border-gray-200">
                  <td className="px-4 py-3 border-r border-gray-200 text-gray-700">
                    {(page - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-gray-900 max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-gray-700 max-w-[160px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {row.type || "-"}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    {buildGatewayUrl(row.previewUrl || row.input) && (
                      <a
                        href={buildGatewayUrl(row.previewUrl || row.input)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[#c41e3a] underline-offset-2 hover:underline break-all"
                      >
                        {formatPreviewLabel(
                          buildGatewayUrl(row.previewUrl || row.input),
                        )}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="flex flex-wrap gap-2 text-sm">
                      <button
                        type="button"
                        className="underline-offset-2 hover:underline"
                        onClick={() => onEdit(row)}
                        disabled={saving}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="underline-offset-2 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() => onDelete(row)}
                        disabled={saving}
                      >
                        Delete
                      </button>
                    </div>
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
        total={rows.length}
        onPageChange={setPage}
      />
    </div>
  );
}

