"use client";

import * as React from "react";
import Link from "next/link";
import { Boxes, Pencil, Trash2 } from "lucide-react";

import { TablePagination } from "@/components/TablePagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { WarehouseRow } from "./types";

type WarehouseTableProps = {
  /** e.g. `/agent` or `/enterprise` */
  routePrefix: string;
  rows: WarehouseRow[];
  loading: boolean;
  saving: boolean;
  error: string;
  onDelete: (row: WarehouseRow) => void;
  onEdit: (row: WarehouseRow) => void;
};

export function WarehouseTable({
  routePrefix,
  rows,
  loading,
  saving,
  error,
  onDelete,
  onEdit,
}: WarehouseTableProps) {
  const PAGE_SIZE = 10;
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [rows.length, page]);

  const startIdx = (page - 1) * PAGE_SIZE;
  const pageRows = rows.slice(startIdx, startIdx + PAGE_SIZE);

  const base = routePrefix.replace(/\/$/, "");

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Warehouses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Facility reference</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Container capacity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      {loading ? "Loading..." : "No warehouses yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((row, idx) => {
                    const stagedDisabled = saving || loading;
                    const editDisabled = saving || loading;
                    const hasProducts = Number(row.productCount || 0) > 0;
                    const deleteDisabled = saving || loading || hasProducts;

                    return (
                      <TableRow key={row.id}>
                        <TableCell className="text-muted-foreground">
                          {startIdx + idx + 1}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {row.code}
                        </TableCell>
                        <TableCell
                          className="max-w-[220px] truncate"
                          title={row.name}
                        >
                          {row.name}
                        </TableCell>
                        <TableCell>
                          {typeof row.maxProducts === "number" &&
                          row.maxProducts > 0
                            ? `${row.productCount ?? 0} / ${row.maxProducts}`
                            : (row.productCount ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground"
                                    disabled={stagedDisabled}
                                    asChild
                                  >
                                    <Link
                                      href={`${base}/warehouses/${row.id}`}
                                      aria-label="View staged containers"
                                    >
                                      <Boxes className="size-4" />
                                    </Link>
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {stagedDisabled ? "Unavailable" : "View staged containers"}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => onEdit(row)}
                                    disabled={editDisabled}
                                    aria-label="Edit warehouse"
                                  >
                                    <Pencil className="size-4" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {editDisabled ? "Unavailable" : "Edit"}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-destructive hover:text-destructive"
                                    onClick={() => onDelete(row)}
                                    disabled={deleteDisabled}
                                    aria-label="Remove warehouse"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {deleteDisabled
                                  ? hasProducts
                                    ? "Cannot remove: warehouse has staged lots"
                                    : "Unavailable"
                                  : "Remove"}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={rows.length}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
