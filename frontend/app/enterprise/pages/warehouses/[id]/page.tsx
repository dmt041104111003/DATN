"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  ArrowLeft,
  Truck,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { APP_AGENT, APP_ENTERPRISE, APP_TRANSIT } from "@/lib/app-routes";
import { shortUnit } from "@/lib/short-unit";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

type ProductRecord = {
  id: string;
  traceSchemeRef: string;
  lotReference: string;
  inventoryKey: string;
  confirmationRef: string;
  custodyParties: string[];
  warehouseId?: string | null;
  name: string;
  description: string;
  containerType?: string | null;
  maxWeightValue?: string | null;
  maxWeightUnit?: string | null;
  maxVolumeValue?: string | null;
  maxVolumeUnit?: string | null;
  roadmap?: string | null;
  location?: string | null;
  verified?: boolean;
  hasPending?: boolean;
  status?: string;
};

function useWorkspaceBasePath(): string {
  const pathname = usePathname();
  if (pathname.startsWith(APP_ENTERPRISE)) return APP_ENTERPRISE;
  if (pathname.startsWith(`${APP_TRANSIT}/pages`)) return `${APP_TRANSIT}/pages`;
  if (pathname.startsWith(`${APP_AGENT}/pages`)) return `${APP_AGENT}/pages`;
  if (pathname.startsWith(APP_TRANSIT)) return APP_TRANSIT;
  return APP_AGENT;
}

export default function WarehouseProductsPage() {
  const params = useParams();
  const basePath = useWorkspaceBasePath();
  const warehouseId = typeof params?.id === "string" ? params.id : null;
  const [warehouseCode, setWarehouseCode] = React.useState<string>("");
  const [warehouseName, setWarehouseName] = React.useState<string>("");
  const [products, setProducts] = React.useState<ProductRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [roleCode, setRoleCode] = React.useState<string>("");

  const [refreshKey, setRefreshKey] = React.useState(0);
  const [dispatchingId, setDispatchingId] = React.useState<string | null>(null);

  const canEdit = roleCode === "ENTERPRISE";
  const canDispatch =
    roleCode === "ENTERPRISE" ||
    roleCode === "AGENT" ||
    roleCode === "TRANSIT";

  const warehousesListHref = `${basePath}/warehouses`;

  const PAGE_SIZE = 10;
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [products.length, page]);

  const startIdx = (page - 1) * PAGE_SIZE;
  const pageRows = products.slice(startIdx, startIdx + PAGE_SIZE);

  React.useEffect(() => {
    if (!warehouseId) return;
    let cancelled = false;
    (async () => {
      try {
        const [listRes, productsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/warehouses`, {
            cache: "no-store",
            credentials: "include",
          }),
          fetch(`${BACKEND_URL}/warehouses/${warehouseId}/products`, {
            cache: "no-store",
            credentials: "include",
          }),
        ]);

        if (!productsRes.ok) {
          const data = await productsRes.json().catch(() => null);
          throw new Error(
            data?.message ||
              data?.error ||
              "Failed to load agri lots staged at this warehouse.",
          );
        }

        const productsData = (await productsRes.json()) as ProductRecord[];
        if (!cancelled) {
          setProducts(Array.isArray(productsData) ? productsData : []);
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
  }, [warehouseId, refreshKey]);

  React.useEffect(() => {
    const loadRole = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        const rc =
          (typeof (data?.user as { roleCode?: string })?.roleCode === "string" &&
            (data.user as { roleCode?: string }).roleCode) ||
          (typeof (data?.user as { role?: string })?.role === "string" &&
            (data.user as { role?: string }).role) ||
          "";
        setRoleCode(String(rc || "").trim());
      } catch {
        // ignore
      }
    };
    loadRole();
  }, []);

  if (!warehouseId) {
    return (
      <TooltipProvider>
        <div className="w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9" asChild>
                <Link href={warehousesListHref} aria-label="Back to warehouses">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to warehouses</TooltipContent>
          </Tooltip>
          <p className="text-muted-foreground mt-4 text-sm">Invalid warehouse.</p>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex w-full flex-col gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="size-9" asChild>
            <Link href={warehousesListHref} aria-label="Back to warehouses">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Back to warehouses</TooltipContent>
      </Tooltip>

      <div>
        <h1 className="text-lg font-semibold md:text-xl">
          {warehouseCode ? `${warehouseCode} — ${warehouseName}` : "Warehouse"} — Staged lots
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Agri traceability lots currently on hand at this logistics site.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle>Staged lots</CardTitle>
              <CardDescription>
                Agri traceability lots currently on hand at this logistics site.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {notice ? (
            <Alert>
              <AlertDescription className="text-emerald-700">
                {notice}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Registry confirmation</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      {loading ? "Loading..." : "No staged lots yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((row, idx) => (
                    <TableRow key={row.id}>
                      {(() => {
                        const hasPending =
                          Boolean(row.hasPending) ||
                          (Boolean(String((row as any).txHash || "").trim()) &&
                            !Boolean(row.verified));
                        const verifiedText = row.verified
                          ? "Yes"
                          : hasPending
                            ? "Pending"
                            : "No";
                        return (
                          <>
                      <TableCell className="text-muted-foreground">
                        {startIdx + idx + 1}
                      </TableCell>
                      <TableCell
                        className="max-w-[180px] truncate font-mono text-xs"
                        title={row.inventoryKey}
                      >
                        {shortUnit(row.inventoryKey)}
                      </TableCell>
                      <TableCell
                        className="max-w-[260px] truncate font-mono text-xs text-emerald-700"
                        title={row.confirmationRef || "—"}
                      >
                        {row.confirmationRef || "—"}
                      </TableCell>
                      <TableCell>{verifiedText}</TableCell>
                      <TableCell className="max-w-[220px] truncate" title={row.location || "-"}>
                        {row.location || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {canDispatch &&
                          String(row.status || "").trim().toUpperCase() !==
                            "CONSUMED" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground"
                                    disabled={
                                      loading ||
                                      Boolean(dispatchingId) ||
                                      Boolean(row.hasPending) ||
                                      row.verified === false ||
                                      String(row.status || "").trim().toUpperCase() === "OUTBOUND_DISPATCH" ||
                                      String(row.status || "").trim().toUpperCase() === "CONSUMED"
                                    }
                                    asChild
                                  >
                                    <Link
                                      href={`${warehousesListHref}/${encodeURIComponent(
                                        String(warehouseId),
                                      )}/scan-dispatch?expected=${encodeURIComponent(
                                        String(row.inventoryKey || ""),
                                      )}`}
                                      aria-label="Warehouse dispatch"
                                    >
                                      <Truck className="size-4" />
                                    </Link>
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Outbound dispatch</TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                          </>
                        );
                      })()}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={products.length}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

    </div>
    </TooltipProvider>
  );
}
