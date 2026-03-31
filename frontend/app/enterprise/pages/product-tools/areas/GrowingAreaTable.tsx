"use client";

import * as React from "react";

import { Eye, Trash2 } from "lucide-react";

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
import type { GrowingAreaRow } from "./types";
import { shortUnit } from "@/lib/short-unit";

export type GrowingAreaTableProps = {
  rows: GrowingAreaRow[];
  loading: boolean;
  saving: boolean;
  onView: (inventoryKey: string) => void;
  onDelete: (inventoryKey: string) => void;
};

export function GrowingAreaTable({
  rows,
  loading,
  saving,
  onView,
  onDelete,
}: GrowingAreaTableProps) {
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
          <CardTitle>Areas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Soil</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-muted-foreground">
                      {loading ? "Loading..." : "No growing areas yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((r, idx) => {
                    const isDeleting = Boolean(r.retirePending);
                    const isVerified = Boolean(r.verified);
                    const hasPlans = Number((r as any).planCount || 0) > 0;
                    const hasPending =
                      Boolean(r.retirePending) ||
                      (Boolean(String((r as any).txHash || "").trim()) && !Boolean(r.verified));
                    const verifiedText = isVerified ? "Yes" : hasPending ? "Pending" : "No";
                    const actionsDisabled =
                      saving || loading || isDeleting || !isVerified;
                    const viewDisabled = saving || loading;
                    const deleteDisabled = actionsDisabled || hasPlans;
                    return (
                      <TableRow key={r.inventoryKey}>
                        <TableCell className="text-muted-foreground">{startIdx + idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs">
                          <span title={r.inventoryKey}>{shortUnit(r.inventoryKey)}</span>
                        </TableCell>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>{r.location}</TableCell>
                        <TableCell>{r.areaSize || ""}</TableCell>
                        <TableCell>{r.soilType || ""}</TableCell>
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
                                    className="size-8 text-destructive hover:text-destructive"
                                    onClick={() => onDelete(r.inventoryKey)}
                                    disabled={deleteDisabled}
                                    aria-label="Delete area"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {deleteDisabled
                                  ? hasPlans
                                    ? "Cannot delete: area has plans"
                                    : "Unavailable"
                                  : "Delete"}
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

