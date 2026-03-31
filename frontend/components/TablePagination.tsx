"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

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
    <Pagination className="mx-0 w-full justify-between px-2 py-2">
      <p className="text-muted-foreground text-sm">
        Showing{" "}
        <span className="text-foreground font-medium">
          {start}-{end}
        </span>{" "}
        of{" "}
        <span className="text-foreground font-medium">{total}</span>
      </p>
      <PaginationContent className="gap-2">
        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            title="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <span className="text-muted-foreground px-1 text-sm">
            Page{" "}
            <span className="text-foreground font-medium">{currentPage}</span>{" "}
            of{" "}
            <span className="text-foreground font-medium">{totalPages}</span>
          </span>
        </PaginationItem>
        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            title="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
