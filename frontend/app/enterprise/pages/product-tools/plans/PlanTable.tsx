"use client";

import * as React from "react";

import { Eye, Package, Pencil, Trash2, Wheat } from "lucide-react";

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
import type { PlanRow } from "./types";
import { shortUnit } from "@/lib/short-unit";

export type PlanTableProps = {
  rows: PlanRow[];
  loading: boolean;
  saving: boolean;
  onView: (inventoryKey: string) => void;
  onEdit: (inventoryKey: string) => void;
  onHarvest: (inventoryKey: string) => void;
  onPackaging: (inventoryKey: string) => void;
  onDelete: (inventoryKey: string) => void;
};

export function PlanTable({
  rows,
  loading,
  saving,
  onView,
  onEdit,
  onHarvest,
  onPackaging,
  onDelete,
}: PlanTableProps) {
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
          <CardTitle>Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead>Growing area</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      {loading ? "Loading..." : "No plans yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((r, idx) => {
                    const stage = String(r.stage || "").toUpperCase();
                    const isHarvested = stage === "HARVESTED";
                    const isClosed = stage === "PACKAGED";
                    const hasPending =
                      Boolean(r.retirePending) ||
                      Boolean(r.harvestPending) ||
                      Boolean((r as any).packagingPending) ||
                      (Boolean(String(r.txHash || "").trim()) && !Boolean(r.verified));

                    const verifiedText = r.verified ? "Yes" : hasPending ? "Pending" : "No";

                    const editDisabled = saving || loading || hasPending || isHarvested || isClosed;
                    const harvestDisabled = saving || loading || hasPending || isHarvested || isClosed || !Boolean(r.verified);
                    const deleteDisabled = saving || loading || hasPending || isHarvested || isClosed || !Boolean(r.verified);

                    const packagingDisabled =
                      saving || loading || hasPending || isClosed || !isHarvested || !Boolean(r.verified);
                    const viewDisabled = saving || loading;
                    return (
                      <TableRow key={r.inventoryKey}>
                        <TableCell className="text-muted-foreground">{startIdx + idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs">
                          <span title={r.inventoryKey}>{shortUnit(r.inventoryKey)}</span>
                        </TableCell>
                        <TableCell>{r.cropType}</TableCell>
                        <TableCell className="font-mono text-xs">
                          <span title={r.growingAreaInventoryKey}>
                            {shortUnit(r.growingAreaInventoryKey)}
                          </span>
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

                            {isClosed ? null : isHarvested ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 text-muted-foreground hover:text-foreground"
                                      onClick={() => onPackaging(r.inventoryKey)}
                                      disabled={packagingDisabled}
                                      aria-label="Packaging"
                                    >
                                      <Package className="size-4" />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>Packaging</TooltipContent>
                              </Tooltip>
                            ) : (
                              <>
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
                                        aria-label="Edit plan"
                                      >
                                        <Pencil className="size-4" />
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => onHarvest(r.inventoryKey)}
                                        disabled={harvestDisabled}
                                        aria-label="Harvest plan"
                                      >
                                        <Wheat className="size-4" />
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>Harvest</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 text-destructive hover:text-destructive"
                                        onClick={() => onDelete(r.inventoryKey)}
                                        disabled={deleteDisabled}
                                        aria-label="Delete plan"
                                      >
                                        <Trash2 className="size-4" />
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                              </>
                            )}
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

