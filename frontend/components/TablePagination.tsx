"use client";

import * as React from "react";

type TablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(total, currentPage * pageSize);

  const goTo = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== currentPage) onPageChange(next);
  };

  return (
    <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-700">
      <span className="text-xs md:text-sm">
        Showing{" "}
        <span className="font-semibold">
          {start}-{end}
        </span>{" "}
        of{" "}
        <span className="font-semibold">
          {total}
        </span>
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-md border border-gray-200 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <span className="text-xs md:text-sm text-gray-600">
          Page{" "}
          <span className="font-semibold">
            {currentPage}
          </span>{" "}
          of{" "}
          <span className="font-semibold">
            {totalPages}
          </span>
        </span>
        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-md bg-[#c41e3a] text-white text-xs md:text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

