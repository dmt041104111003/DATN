"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/TablePagination";
import type { PlanRow } from "./types";
import { shortUnit } from "@/lib/short-unit";

type OpRow = {
  id: string;
  opType: string;
  txHash: string;
  verified: boolean;
  createdAt: string;
  verifiedAt?: string | null;
};

function opLabel(opType: string): string {
  const t = String(opType || "").trim().toUpperCase();
  if (t === "CREATE") return "Created";
  if (t === "UPDATE") return "Saved";
  if (t === "HARVEST") return "Harvested";
  if (t === "PACKAGING") return "Packaging";
  if (t === "RETIRE") return "Deleted";
  if (!t) return "Updated";
  return `${t.slice(0, 1)}${t.slice(1).toLowerCase()}`;
}

function fmtTime(v: unknown): string {
  const d = new Date(String(v || ""));
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function shortRef(v: unknown): string {
  const s = String(v ?? "").trim();
  return shortUnit(s, { head: 18, tail: 4, min: 22 });
}

function ipfsToHttp(v: unknown): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  if (s.startsWith("ipfs://")) {
    const cid = s.slice("ipfs://".length).replace(/^ipfs\//, "");
    if (!cid) return null;
    return `https://ipfs.io/ipfs/${encodeURIComponent(cid)}`;
  }
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return null;
}

function LinkRef({
  value,
  href,
}: {
  value: unknown;
  href: string | null;
}) {
  const label = shortRef(value);
  if (!href) {
    return <span className="min-w-0 text-right font-mono text-xs break-all">{label}</span>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="min-w-0 text-right font-mono text-xs break-all underline underline-offset-2 text-muted-foreground hover:text-foreground"
      title={String(value ?? "").trim() || undefined}
    >
      {label}
    </a>
  );
}

function milestoneLabel(raw: unknown): string {
  const t = String(raw || "").trim();
  if (!t) return "—";
  const x = t.toUpperCase();
  if (x === "LOT FIRST REGISTERED") return "Initial record created";
  if (x === "LOT CLOSED IN CIRCULATION") return "Record closed";
  if (x === "PASSPORT REFRESHED") return "Record updated";
  if (x === "CUSTODY HANDOFF") return "Transfer of custody";
  if (x === "HANDLING EVENT RECORDED") return "Event recorded";
  return t;
}

export type PlanDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: PlanRow | null;
  ops: OpRow[];
  loadingOps: boolean;
  publicCheck?: {
    latestRecordedAt?: string;
    latestMilestone?: string;
    statusText?: string;
  } | null;
  loadingPublicCheck?: boolean;
};

const TX_EXPLORER_BASE = (
  process.env.NEXT_PUBLIC_CARDANO_EXPLORER_TX_PREFIX ?? "https://preprod.cexplorer.io/tx/"
).replace(/\/?$/, "/");

export function PlanDetailsDialog({
  open,
  onOpenChange,
  row,
  ops,
  loadingOps,
  publicCheck,
  loadingPublicCheck,
}: PlanDetailsDialogProps) {
  const HISTORY_PAGE_SIZE = 10;
  const [historyPage, setHistoryPage] = React.useState(1);

  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(ops.length / HISTORY_PAGE_SIZE));
    if (historyPage > totalPages) setHistoryPage(totalPages);
    if (historyPage < 1) setHistoryPage(1);
  }, [ops.length, historyPage]);

  const historyStartIdx = (historyPage - 1) * HISTORY_PAGE_SIZE;
  const historyOps = ops.slice(historyStartIdx, historyStartIdx + HISTORY_PAGE_SIZE);

  const latestTx = React.useMemo(() => {
    if (row?.txHash) return String(row.txHash).trim();
    const op = ops.find((o) => String(o.txHash || "").trim());
    return op ? String(op.txHash).trim() : "";
  }, [row?.txHash, ops]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Plan details</DialogTitle>
        </DialogHeader>

        {!row ? (
          <p className="text-sm text-muted-foreground">No record selected.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="text-sm">
                <div className="text-muted-foreground">Unit</div>
                <div className="font-mono text-xs" title={row.inventoryKey}>
                  {shortUnit(row.inventoryKey)}
                </div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">Verified</div>
                <div>
                  {row.verified
                    ? "Yes"
                    : Boolean(row.retirePending) ||
                        Boolean((row as any).harvestPending) ||
                        Boolean((row as any).packagingPending) ||
                        (Boolean(String((row as any).txHash || "").trim()) && !Boolean(row.verified))
                      ? "Pending"
                      : "No"}
                </div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">Crop</div>
                <div>{row.cropType || "—"}</div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">Growing area</div>
                <div className="font-mono text-xs" title={row.growingAreaInventoryKey || undefined}>
                  {row.growingAreaInventoryKey ? shortUnit(row.growingAreaInventoryKey) : "—"}
                </div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">Created</div>
                <div>{fmtTime(row.createdAt)}</div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">Last updated</div>
                <div>{fmtTime(row.updatedAt)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2 rounded-md border p-3">
                <div className="text-sm font-medium">Input quantities</div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Input quantity</span>
                  <span className="min-w-0 text-right break-words">
                    {row.seedQuantityValue ?? "—"} {row.seedQuantityUnit ?? ""}
                  </span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Plant quantity</span>
                  <span className="min-w-0 text-right break-words">
                    {row.plantQuantityValue ?? "—"} {row.plantQuantityUnit ?? ""}
                  </span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Nursery area</span>
                  <span className="min-w-0 text-right break-words">{row.nurseryArea || "—"}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Nursery batch</span>
                  <span className="min-w-0 text-right break-words">{row.nurseryBatch || "—"}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Planting area</span>
                  <span className="min-w-0 text-right break-words">{row.plantingArea || "—"}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Planting batch</span>
                  <span className="min-w-0 text-right break-words">{row.plantingBatch || "—"}</span>
                </div>
              </div>

              <div className="space-y-2 rounded-md border p-3">
                <div className="text-sm font-medium">Planned timeline</div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Planned sowing date</span>
                  <span className="min-w-0 text-right break-words">{fmtTime(row.plannedSeedingDate)}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Planting date</span>
                  <span className="min-w-0 text-right break-words">{fmtTime(row.plannedPlantingDate)}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Harvest date</span>
                  <span className="min-w-0 text-right break-words">
                    {row.plannedHarvestDate ? fmtTime(row.plannedHarvestDate) : "—"}
                  </span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Processing date</span>
                  <span className="min-w-0 text-right break-words">
                    {row.plannedProcessingDate ? fmtTime(row.plannedProcessingDate) : "—"}
                  </span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Packaging date</span>
                  <span className="min-w-0 text-right break-words">
                    {row.plannedPackagingDate ? fmtTime(row.plannedPackagingDate) : "—"}
                  </span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Expiry date</span>
                  <span className="min-w-0 text-right break-words">
                    {row.expiryDate ? fmtTime(row.expiryDate) : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2 rounded-md border p-3">
                <div className="text-sm font-medium">Expected results</div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Harvest yield</span>
                  <span className="min-w-0 text-right break-words">{row.expectedHarvestYield || "—"}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Processing yield</span>
                  <span className="min-w-0 text-right break-words">{row.expectedProcessingYield || "—"}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Packaging quantity</span>
                  <span className="min-w-0 text-right break-words">{row.expectedPackagingQuantity || "—"}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Packaging spec</span>
                  <span className="min-w-0 text-right break-words whitespace-pre-wrap">{row.packagingSpec || "—"}</span>
                </div>
              </div>

              <div className="space-y-2 rounded-md border p-3">
                <div className="text-sm font-medium">Attachments</div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Certificate file</span>
                  <LinkRef value={row.seedCertificateIpfs} href={ipfsToHttp(row.seedCertificateIpfs)} />
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Invoice file</span>
                  <LinkRef value={row.seedInvoiceIpfs} href={ipfsToHttp(row.seedInvoiceIpfs)} />
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Harvest image</span>
                  <LinkRef value={row.harvestImageIpfs} href={ipfsToHttp(row.harvestImageIpfs)} />
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Packaging image</span>
                  <LinkRef value={(row as any).packagingImageIpfs} href={ipfsToHttp((row as any).packagingImageIpfs)} />
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Public record reference</span>
                  <span className="min-w-0 text-right font-mono text-xs break-all">
                    {shortRef((row as any).inventoryKey)}
                  </span>
                </div>
              </div>
            </div>

            {loadingPublicCheck ? (
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium">Public record check</div>
                <div className="text-sm text-muted-foreground">Loading…</div>
              </div>
            ) : publicCheck ? (
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium">Public record check</div>
                <div className="text-sm text-muted-foreground break-words">{publicCheck.statusText || "Checked"}</div>
                <div className="mt-2 text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Latest update</span>
                  <span className="min-w-0 text-right break-words">{publicCheck.latestRecordedAt || "—"}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Latest action</span>
                  <span className="min-w-0 text-right break-words">{milestoneLabel(publicCheck.latestMilestone)}</span>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="text-sm font-medium">History</div>
              <div className="w-full overflow-auto rounded-md border custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Confirmed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingOps ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-muted-foreground">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : historyOps.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-muted-foreground">
                          No history yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      historyOps.map((o, idx) => (
                        <TableRow key={o.id}>
                          <TableCell className="text-muted-foreground">
                            {historyStartIdx + idx + 1}
                          </TableCell>
                          <TableCell>{opLabel(o.opType)}</TableCell>
                          <TableCell>{o.verified ? "Confirmed" : "Pending"}</TableCell>
                          <TableCell>{fmtTime(o.createdAt)}</TableCell>
                          <TableCell>{o.verified ? fmtTime(o.verifiedAt) : "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                page={historyPage}
                pageSize={HISTORY_PAGE_SIZE}
                total={ops.length}
                onPageChange={setHistoryPage}
              />
            </div>
          </div>
        )}

        <DialogFooter showCloseButton>
          {latestTx ? (
            <Button asChild variant="outline">
              <a href={`${TX_EXPLORER_BASE}${encodeURIComponent(latestTx)}`} target="_blank" rel="noreferrer">
                Open receipt
              </a>
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

