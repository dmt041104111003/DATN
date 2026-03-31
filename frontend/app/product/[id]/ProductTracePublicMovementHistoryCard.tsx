"use client";

import * as React from "react";
import { Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TraceEventKind =
  | "INIT"
  | "UPDATE"
  | "DISPATCH"
  | "CHECKIN"
  | "CONSUMED";

export function ProductTracePublicMovementHistoryCard({
  pageSlice,
  historyTxRef,
  normalizeLoc,
  waypoints,
  selectedStep,
  setHistoryTxRef,
  setSelectedStep,
  FMT_DATE,
  readableOpsEventFromStatus,
  readableMilestone,
  isConsumedStatus,
  txRefOf,
  mode,
  planEvents,
  planSelectedIdx,
  setPlanSelectedIdx,
  FMT_VI_DT,
}: {
  pageSlice: any[];
  historyTxRef: string | null;
  normalizeLoc: (s: string) => string;
  waypoints: string[];
  selectedStep: number;
  setHistoryTxRef: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedStep: React.Dispatch<React.SetStateAction<number>>;
  FMT_DATE: Intl.DateTimeFormat;
  readableOpsEventFromStatus: (status: unknown) => string | null;
  readableMilestone: (raw: string | undefined) => string;
  isConsumedStatus: (status: unknown) => boolean;
  txRefOf: (entry: any) => string;
  mode?: "product" | "plan" | "area";
  planEvents?: Array<{ entry: any; action: "Created" | "Harvested" | "Packaging" | "Updated" }>;
  planSelectedIdx?: number;
  setPlanSelectedIdx?: React.Dispatch<React.SetStateAction<number>>;
  FMT_VI_DT?: Intl.DateTimeFormat;
}) {
  const areaActionLabel = React.useCallback((entry: any): "Created" | "Updated" => {
    const milestone = String(entry?.milestone ?? "").trim();
    const statusUpper = String(entry?.lotPassport?.status ?? entry?.status ?? "").trim().toUpperCase();
    const opUpper = String(entry?.opType ?? entry?.op_type ?? "").trim().toUpperCase();
    if (milestone === "Lot first registered") return "Created";
    if (statusUpper === "INITIAL") return "Created";
    if (opUpper === "CREATE") return "Created";
    return "Updated";
  }, []);

  const traceEventForEntry = React.useCallback(
    (entry: any) => {
      const status = entry?.lotPassport?.status;
      const milestone = entry?.milestone;

      const statusUpper = String(status ?? "").trim().toUpperCase();
      const milestoneStr = String(milestone ?? "").trim();

      if (isConsumedStatus(status)) {
        return {
          kind: "CONSUMED" as const,
          label: "Consumed",
          iconBgClass: "bg-red-600",
          iconFgClass: "text-red-50",
          labelClass: "text-red-700",
        };
      }

      if (milestoneStr === "Lot first registered") {
        return {
          kind: "INIT" as const,
          label: "Created",
          iconBgClass: "bg-emerald-500",
          iconFgClass: "text-emerald-50",
          labelClass: "text-emerald-600",
        };
      }

      if (milestoneStr === "Passport refreshed") {
        if (statusUpper === "OUTBOUND_DISPATCH") {
          return {
            kind: "DISPATCH" as const,
            label: "Outbound dispatch",
            iconBgClass: "bg-emerald-500",
            iconFgClass: "text-emerald-50",
            labelClass: "text-emerald-600",
          };
        }
        if (statusUpper === "INBOUND_CHECKIN") {
          return {
            kind: "CHECKIN" as const,
            label: "Inbound check-in",
            iconBgClass: "bg-emerald-500",
            iconFgClass: "text-emerald-50",
            labelClass: "text-emerald-600",
          };
        }

        return {
          kind: "UPDATE" as const,
          label: "Data updated",
          iconBgClass: "bg-emerald-500",
          iconFgClass: "text-emerald-50",
          labelClass: "text-emerald-600",
        };
      }

      if (milestoneStr === "Custody handoff") {
        if (statusUpper === "OUTBOUND_DISPATCH") {
          return {
            kind: "DISPATCH" as const,
            label: "Outbound dispatch",
            iconBgClass: "bg-emerald-500",
            iconFgClass: "text-emerald-50",
            labelClass: "text-emerald-600",
          };
        }
        if (statusUpper !== "INBOUND_CHECKIN") {
          return {
            kind: "UPDATE" as const,
            label: "Data updated",
            iconBgClass: "bg-emerald-500",
            iconFgClass: "text-emerald-50",
            labelClass: "text-emerald-600",
          };
        }
        return {
          kind: "CHECKIN" as const,
          label: "Inbound check-in",
          iconBgClass: "bg-emerald-500",
          iconFgClass: "text-emerald-50",
          labelClass: "text-emerald-600",
        };
      }

      if (milestoneStr === "Handling event recorded") {
        if (statusUpper === "OUTBOUND_DISPATCH") {
          return {
            kind: "DISPATCH" as const,
            label: "Outbound dispatch",
            iconBgClass: "bg-emerald-500",
            iconFgClass: "text-emerald-50",
            labelClass: "text-emerald-600",
          };
        }
        if (statusUpper === "INBOUND_CHECKIN") {
          return {
            kind: "CHECKIN" as const,
            label: "Inbound check-in",
            iconBgClass: "bg-emerald-500",
            iconFgClass: "text-emerald-50",
            labelClass: "text-emerald-600",
          };
        }
        return {
          kind: "UPDATE" as const,
          label: "Data updated",
          iconBgClass: "bg-emerald-500",
          iconFgClass: "text-emerald-50",
          labelClass: "text-emerald-600",
        };
      }

      const fallbackLabel =
        readableOpsEventFromStatus(statusUpper) ?? readableMilestone(milestoneStr || undefined);

      return {
        kind: (fallbackLabel ? "UPDATE" : "UPDATE") as TraceEventKind,
        label: fallbackLabel ?? "Data updated",
        iconBgClass: "bg-emerald-500",
        iconFgClass: "text-emerald-50",
        labelClass: "text-emerald-600",
      };
    },
    [
      isConsumedStatus,
      readableOpsEventFromStatus,
      readableMilestone,
    ],
  );

  return (
    <Card className="order-3 flex max-h-[min(48vh,18rem)] min-h-0 flex-col gap-2 overflow-hidden rounded-none py-2.5 sm:py-3 lg:h-full lg:max-h-none lg:order-none">
      <CardHeader className="shrink-0 px-4 pb-0 sm:px-6">
        <CardTitle className="text-lg">
          {mode === "plan" ? "Plan history" : "Movement and filing history"}
        </CardTitle>
        {mode === "plan" ? null : (
          <CardDescription className="text-sm leading-snug">
            Newest first. Tap a row to focus.
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-4 sm:px-6">
        {mode === "plan" ? (
          <div className="min-h-0 flex-1 overflow-auto rounded-none border custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Confirmed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(Array.isArray(planEvents) ? planEvents : []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No history yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  (planEvents || []).slice(0, 20).map((ev, idx) => {
                    const e = ev.entry;
                    const isOn = typeof planSelectedIdx === "number" && idx === planSelectedIdx;
                    const ref = txRefOf(e);
                    const confirmed = Boolean(ref);
                    const submittedAt = Number(e?.recordedAt || 0) * 1000;
                    const action = ev.action;
                    return (
                      <TableRow
                        key={`${ref || ""}-${String(e?.recordedAt || idx)}`}
                        className={cn(isOn && "bg-emerald-500/5")}
                        onClick={() => setPlanSelectedIdx?.(idx)}
                      >
                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-medium">{action}</TableCell>
                        <TableCell>{confirmed ? "Confirmed" : "Pending"}</TableCell>
                        <TableCell>
                          {FMT_VI_DT ? FMT_VI_DT.format(new Date(submittedAt)) : "—"}
                        </TableCell>
                        <TableCell>
                          {confirmed && FMT_VI_DT ? FMT_VI_DT.format(new Date(submittedAt)) : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        ) : mode === "area" ? (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1">
            <div className="space-y-1">
              {pageSlice.map((entry, idx) => {
                const ref = txRefOf(entry);
                const rowOn = (historyTxRef != null && ref === historyTxRef) || (historyTxRef == null && idx === 0);
                const label = areaActionLabel(entry);
                const t = Number(entry?.recordedAt || 0);
                const when = !t
                  ? "—"
                  : FMT_VI_DT
                    ? FMT_VI_DT.format(new Date(t * 1000))
                    : FMT_DATE.format(new Date(t * 1000));

                return (
                  <Button
                    key={ref || String(entry.recordedAt)}
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-auto min-h-12 w-full touch-manipulation flex-col items-start gap-1 rounded-none py-3 text-left whitespace-normal sm:min-h-0 sm:gap-0.5 sm:py-2",
                      rowOn && "border-emerald-500/40 bg-emerald-500/5",
                    )}
                    onClick={() => {
                      if (ref) setHistoryTxRef(ref);
                    }}
                  >
                    <div className="flex w-full items-baseline justify-between gap-1.5">
                      <span className="text-foreground text-left text-sm font-semibold">{label}</span>
                      <span className="text-muted-foreground shrink-0 text-xs">{when}</span>
                    </div>
                    <span className="text-muted-foreground text-left text-sm font-normal">
                      {entry?.lotPassport?.location || "—"}
                    </span>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500">
                        <Package
                          className="size-3 text-emerald-50"
                          strokeWidth={2.25}
                          aria-hidden="true"
                        />
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">{label}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1 custom-scrollbar">
          <div className="space-y-1">
            {pageSlice.map((entry) => {
              const ev = traceEventForEntry(entry);
              const ref = txRefOf(entry);
              const rowOn =
                (historyTxRef != null && ref === historyTxRef) ||
                (historyTxRef == null &&
                  normalizeLoc(String(entry?.lotPassport?.location || "")) ===
                    normalizeLoc(String(waypoints[selectedStep] ?? "")));

              return (
                <Button
                  key={ref || String(entry.recordedAt)}
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-auto w-full touch-manipulation flex-col items-start gap-1 rounded-none py-2.5 text-left whitespace-normal sm:gap-0.5 sm:py-2",
                    rowOn && "border-emerald-500/40 bg-emerald-500/5",
                  )}
                  onClick={() => {
                    if (ref) setHistoryTxRef(ref);
                    const idx = waypoints.findIndex(
                      (w) =>
                        normalizeLoc(w) ===
                        normalizeLoc(String(entry?.lotPassport?.location || "")),
                    );
                    if (idx >= 0) setSelectedStep(idx);
                  }}
                >
                  <div className="flex w-full items-baseline justify-between gap-1.5">
                    <span className="text-foreground text-left text-sm font-semibold">
                      {ev.label}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {FMT_DATE.format(new Date(Number(entry.recordedAt) * 1000))}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-left text-sm font-normal">
                    {entry?.lotPassport?.location || "—"}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  );
}

