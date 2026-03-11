"use client";

import * as React from "react";
import { TablePagination } from "@/components/TablePagination";

export type ProductTypeRow = {
  id: string;
  name: string;
  code?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProductTypeTableProps = {
  rows: ProductTypeRow[];
  loading: boolean;
  saving: boolean;
  error: string;
  onEdit: (row: ProductTypeRow) => void;
  onDelete: (row: ProductTypeRow) => void;
};

export function ProductTypeTable({
  rows,
  loading,
  saving,
  error,
  onEdit,
  onDelete,
}: ProductTypeTableProps) {
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
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
          {error}
        </p>
      )}

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
                Code
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
                  colSpan={4}
                  className="px-4 py-4 text-center text-gray-500 bg-white"
                >
                  Loading product types...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-4 text-center text-gray-500 bg-white"
                >
                  No product types found.
                </td>
              </tr>
            ) : (
              pagedRows.map((row, index) => (
                <tr key={row.id} className="border-t border-gray-200">
                  <td className="px-4 py-3 border-r border-gray-200 text-gray-700">
                    {(page - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-gray-900 max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-gray-700 max-w-[160px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {row.code || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="flex flex-wrap gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        disabled={saving}
                        className="underline-offset-2 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        disabled={saving}
                        className="underline-offset-2 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
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

