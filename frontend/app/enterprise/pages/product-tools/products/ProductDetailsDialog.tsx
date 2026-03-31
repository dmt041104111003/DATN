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
import type { ProductRow } from "./types";
import { shortUnit } from "@/lib/short-unit";

type OpRow = {
  id: string;
  opType: string;
  txHash: string;
  verified: boolean;
  createdAt: string;
  verifiedAt?: string | null;
};

const TX_EXPLORER_BASE = (
  process.env.NEXT_PUBLIC_CARDANO_EXPLORER_TX_PREFIX ?? "https://preprod.cexplorer.io/tx/"
).replace(/\/?$/, "/");

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

function opLabel(opType: string): string {
  const t = String(opType || "").trim().toUpperCase();
  if (t === "CREATE") return "Created";
  if (t === "UPDATE") return "Saved";
  if (t === "RETIRE") return "Deleted";
  if (!t) return "Updated";
  return `${t.slice(0, 1)}${t.slice(1).toLowerCase()}`;
}

function roadmapLine(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (!s) return "—";
  if (s.includes("→")) return s;
  if (s.includes("->")) return s.replace(/\s*->\s*/g, " \u2192 ");
  const steps = s
    .split(/\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
  return steps.length ? steps.join(" \u2192 ") : s;
}

function linkText(v: unknown): string {
  const s = String(v ?? "").trim();
  return shortUnit(s, { head: 18, tail: 4, min: 28 });
}

function LinkRef({
  value,
  href,
}: {
  value: unknown;
  href: string | null;
}) {
  const label = linkText(value);
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

export type ProductDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: ProductRow | null;
  ops: OpRow[];
  loadingOps: boolean;
  publicCheck?: {
    latestRecordedAt?: string;
    latestMilestone?: string;
    statusText?: string;
  } | null;
  loadingPublicCheck?: boolean;
};

export function ProductDetailsDialog({
  open,
  onOpenChange,
  row,
  ops,
  loadingOps,
  publicCheck,
  loadingPublicCheck,
}: ProductDetailsDialogProps) {
  const HISTORY_PAGE_SIZE = 10;
  const [historyPage, setHistoryPage] = React.useState(1);

  React.useEffect(() => {
    if (!open) setHistoryPage(1);
  }, [open]);

  const totalHistoryPages = Math.max(1, Math.ceil((ops?.length || 0) / HISTORY_PAGE_SIZE));
  const safeHistoryPage = Math.min(Math.max(1, historyPage), totalHistoryPages);
  const historyStartIdx = (safeHistoryPage - 1) * HISTORY_PAGE_SIZE;
  const historyOps = (ops || []).slice(historyStartIdx, historyStartIdx + HISTORY_PAGE_SIZE);
  const latestTx = ops && ops.length ? String(ops[0]?.txHash || "").trim() : "";
  const hasPending = (ops || []).some((o) => !o?.verified);
  const hasConfirmed = (ops || []).some((o) => o?.verified);
  const checkText = hasPending ? "Pending" : hasConfirmed ? "Yes" : "No";

  const owners = React.useMemo(() => {
    const list = Array.isArray(row?.custodyParties) ? row!.custodyParties : [];
    return list.map((x) => String(x ?? "").trim()).filter(Boolean);
  }, [row?.custodyParties]);

  const copyOwner = React.useCallback(async (addr: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(addr);
        return;
      }
    } catch {
      // fallback below
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = addr;
      ta.setAttribute("readonly", "true");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch {
      // ignore
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto custom-scrollbar" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Container details</DialogTitle>
        </DialogHeader>

        {!row ? (
          <div className="text-sm text-muted-foreground">No record selected.</div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2 rounded-md border p-3">
                <div className="text-sm font-medium">Core</div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Unit</span>
                  <span className="min-w-0 text-right font-mono text-xs" title={row.inventoryKey}>
                    {shortUnit(row.inventoryKey)}
                  </span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Plan</span>
                  <span className="min-w-0 text-right font-mono text-xs" title={row.planInventoryKey || undefined}>
                    {row.planInventoryKey ? shortUnit(row.planInventoryKey) : "—"}
                  </span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Commercial title</span>
                  <span className="min-w-0 text-right break-words">{row.name || "—"}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Lot story</span>
                  <span className="min-w-0 text-right break-words">{row.description || "—"}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Location</span>
                  <span className="min-w-0 text-right break-words">{row.location || "—"}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Roadmap</span>
                  <span className="min-w-0 text-right break-words">{roadmapLine(row.roadmap)}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Image</span>
                  <LinkRef value={row.imageIpfs} href={ipfsToHttp(row.imageIpfs)} />
                </div>
              </div>

              <div className="space-y-2 rounded-md border p-3">
                <div className="text-sm font-medium">Public record</div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Public record reference</span>
                  <span className="min-w-0 text-right font-mono text-xs break-all">{shortRef(row.inventoryKey)}</span>
                </div>
                {loadingPublicCheck ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : publicCheck ? (
                  <>
                    <div className="text-sm font-medium">Public record check</div>
                    <div className="text-sm text-muted-foreground break-words">
                      {publicCheck.statusText || checkText}
                    </div>
                    <div className="mt-2 text-sm flex min-w-0 items-start justify-between gap-2">
                      <span className="shrink-0 text-muted-foreground">Latest update</span>
                      <span className="min-w-0 text-right break-words">{publicCheck.latestRecordedAt || "—"}</span>
                    </div>
                    <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                      <span className="shrink-0 text-muted-foreground">Latest action</span>
                      <span className="min-w-0 text-right break-words">{publicCheck.latestMilestone || "—"}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium">Public record check</div>
                    <div className="text-sm text-muted-foreground break-words">{checkText}</div>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2 rounded-md border p-3">
                <div className="text-sm font-medium">Packaging</div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Container</span>
                  <span className="min-w-0 text-right break-words">{row.containerType || "—"}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Max weight</span>
                  <span className="min-w-0 text-right break-words">
                    {row.maxWeightValue && row.maxWeightUnit
                      ? `${row.maxWeightValue} ${row.maxWeightUnit}`
                      : "—"}
                  </span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Max volume</span>
                  <span className="min-w-0 text-right break-words">
                    {row.maxVolumeValue && row.maxVolumeUnit
                      ? `${row.maxVolumeValue} ${row.maxVolumeUnit}`
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 rounded-md border p-3">
                <div className="text-sm font-medium">Custody</div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Owners</span>
                  <span className="min-w-0 text-right text-muted-foreground">
                    {owners.length ? `${owners.length}` : "—"}
                  </span>
                </div>
                <div className="space-y-1">
                  {owners.slice(0, 6).map((addr, i) => (
                    <button
                      key={`${i}-${addr}`}
                      type="button"
                      className="block w-full text-left font-mono text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground break-all"
                      title={addr}
                      onClick={() => void copyOwner(addr)}
                    >
                      {i + 1}. {shortRef(addr)}
                    </button>
                  ))}
                  {owners.length > 6 ? (
                    <div className="text-xs text-muted-foreground">
                      +{owners.length - 6} more
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

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
                page={safeHistoryPage}
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

