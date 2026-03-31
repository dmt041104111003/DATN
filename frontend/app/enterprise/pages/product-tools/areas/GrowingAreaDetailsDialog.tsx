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
import type { GrowingAreaRow } from "./types";
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

export type GrowingAreaDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: GrowingAreaRow | null;
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

export function GrowingAreaDetailsDialog({
  open,
  onOpenChange,
  row,
  ops,
  loadingOps,
  publicCheck,
  loadingPublicCheck,
}: GrowingAreaDetailsDialogProps) {
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

  const owners = React.useMemo(() => {
    const raw = row?.custodyRoster;
    if (!raw) return [];
    return raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [row?.custodyRoster]);

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
      <DialogContent
        className="sm:max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Area details</DialogTitle>
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
                        (Boolean(String((row as any).txHash || "").trim()) && !Boolean(row.verified))
                      ? "Pending"
                      : "No"}
                </div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">Name</div>
                <div>{row.name || "—"}</div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">Location</div>
                <div>{row.location || "—"}</div>
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground">Created</div>
                <div>{fmtTime(row.createdAt)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2 rounded-md border p-3">
                <div className="text-sm font-medium">Area info</div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Area size</span>
                  <span className="min-w-0 text-right break-words">{row.areaSize || "—"}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Soil type</span>
                  <span className="min-w-0 text-right break-words">{row.soilType || "—"}</span>
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Owners</span>
                  <span className="min-w-0 text-right break-all">
                    {owners.length === 0 ? (
                      "—"
                    ) : (
                      <span className="inline-flex flex-wrap justify-end gap-2">
                        {owners.map((addr) => (
                          <button
                            key={addr}
                            type="button"
                            className="max-w-[160px] truncate rounded-md px-1 text-sm underline underline-offset-2 text-muted-foreground hover:text-foreground focus:outline-none"
                            title={addr}
                            onClick={() => void copyOwner(addr)}
                          >
                            {shortRef(addr)}
                          </button>
                        ))}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2 rounded-md border p-3">
                <div className="text-sm font-medium">Attachments</div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Image file</span>
                  <LinkRef value={row.nftImageIpfs} href={ipfsToHttp(row.nftImageIpfs)} />
                </div>
                <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                  <span className="shrink-0 text-muted-foreground">Public record reference</span>
                  <span className="min-w-0 text-right font-mono text-xs break-all">{shortRef(row.inventoryKey)}</span>
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

