"use client";

import * as React from "react";
import { Eye, Flame, Pencil, QrCode } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { TablePagination } from "@/components/TablePagination";
import type { ProductRow } from "./types";
import { shortUnit } from "@/lib/short-unit";

export type ProductTableProps = {
  rows: ProductRow[];
  loading: boolean;
  saving: boolean;
  onView: (inventoryKey: string) => void;
  onDownloadQr: (inventoryKey: string) => void;
  onEdit: (inventoryKey: string) => void;
  onRetire: (inventoryKey: string) => void;
};

export function ProductTable({
  rows,
  loading,
  saving,
  onView,
  onDownloadQr,
  onEdit,
  onRetire,
}: ProductTableProps) {
  const PAGE_SIZE = 10;
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [rows.length, page]);

  const startIdx = (page - 1) * PAGE_SIZE;
  const pageRows = rows.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Containers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      {loading ? "Loading..." : "No containers yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((r, idx) => {
                    const hasPending =
                      Boolean(r.hasPending) ||
                      (Boolean(String((r as any).txHash || "").trim()) && !Boolean(r.verified));
                    const verifiedText = r.verified ? "Yes" : hasPending ? "Pending" : "No";
                    const viewDisabled = saving || loading;
                    const qrDisabled = saving || loading;
                    const statusUpper = String(r.status ?? "").trim().toUpperCase();
                    const locked =
                      statusUpper === "OUTBOUND_DISPATCH" || statusUpper === "CONSUMED";
                    const editDisabled = saving || loading || locked || hasPending || !Boolean(r.verified);
                    const retireDisabled = saving || loading || locked || hasPending || !Boolean(r.verified);

                    return (
                      <TableRow key={r.inventoryKey}>
                        <TableCell className="text-muted-foreground">
                          {startIdx + idx + 1}
                        </TableCell>
                        <TableCell className="font-mono text-xs" title={r.inventoryKey}>
                          {shortUnit(r.inventoryKey)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {r.planInventoryKey ? (
                            <span title={r.planInventoryKey}>{shortUnit(r.planInventoryKey)}</span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{verifiedText}</TableCell>
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
                                    onClick={() => onView(r.inventoryKey)}
                                    disabled={viewDisabled}
                                    aria-label="View details"
                                  >
                                    <Eye className="size-4" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Details</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => onDownloadQr(r.inventoryKey)}
                                    disabled={qrDisabled}
                                    aria-label="Download QR"
                                  >
                                    <QrCode className="size-4" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Download QR</TooltipContent>
                            </Tooltip>

                            {!locked ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 text-muted-foreground hover:text-foreground"
                                      onClick={() => onEdit(r.inventoryKey)}
                                      disabled={editDisabled}
                                      aria-label="Edit"
                                    >
                                      <Pencil className="size-4" />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {editDisabled ? "Unavailable" : "Edit"}
                                </TooltipContent>
                              </Tooltip>
                            ) : null}

                            {!locked ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 text-destructive hover:text-destructive"
                                      onClick={() => onRetire(r.inventoryKey)}
                                      disabled={retireDisabled}
                                      aria-label="Retire"
                                    >
                                      <Flame className="size-4" />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {retireDisabled ? "Unavailable" : "Retire"}
                                </TooltipContent>
                              </Tooltip>
                            ) : null}
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

