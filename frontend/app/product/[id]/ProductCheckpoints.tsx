"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

function isConsumedStatus(status: unknown): boolean {
  return String(status ?? "").trim().toUpperCase() === "CONSUMED";
}

function checkpointStatusLine(status: unknown): {
  text: string;
  className: string;
} | null {
  const s = String(status ?? "").trim().toUpperCase();
  if (!s) return { text: "Data updated", className: "text-emerald-600" };
  if (s === "CONSUMED") return { text: "Consumed", className: "text-red-700" };
  if (s === "OUTBOUND_DISPATCH")
    return { text: "Outbound dispatch", className: "text-emerald-600" };
  if (s === "INBOUND_CHECKIN") return { text: "Inbound check-in", className: "text-emerald-600" };
  return null;
}

function normalizeLoc(s: string) {
  return s?.toLowerCase().trim() || "";
}

function checkpointTextForEntry(entryAtLoc: any): {
  text: string;
  className: string;
} {
  const statusUpper = String(entryAtLoc?.lotPassport?.status ?? "").trim().toUpperCase();
  const milestoneStr = String(entryAtLoc?.milestone ?? "").trim();

  if (statusUpper === "CONSUMED") {
    return { text: "Consumed", className: "text-red-700" };
  }

  if (milestoneStr === "Lot first registered") {
    return { text: "Initial record created", className: "text-emerald-600" };
  }

  if (milestoneStr === "Passport refreshed") {
    return { text: "Data updated", className: "text-emerald-600" };
  }

  if (milestoneStr === "Custody handoff" || milestoneStr === "Handling event recorded") {
    if (statusUpper === "OUTBOUND_DISPATCH") {
      return { text: "Outbound dispatch", className: "text-emerald-600" };
    }
    if (statusUpper === "INBOUND_CHECKIN") {
      return { text: "Inbound check-in", className: "text-emerald-600" };
    }
  }

  // Fallback to previous status-only behavior.
  return (
    checkpointStatusLine(entryAtLoc?.lotPassport?.status) ?? {
      text: "Data updated",
      className: "text-emerald-600",
    }
  );
}

export function ProductCheckpoints({
  waypoints,
  history,
  progressIndex,
  journeyComplete,
  usingRoadmap,
  setHistoryTxRef,
  setSelectedStep,
  mode,
  planTimes,
  planTimesSec,
  onPlanSelect,
}: {
  waypoints: string[];
  history: Array<any>;
  progressIndex: number;
  journeyComplete: boolean;
  usingRoadmap: boolean;
  setHistoryTxRef: (v: string | null) => void;
  setSelectedStep: (idx: number) => void;
  mode?: "product" | "plan" | "area";
  planTimes?: Record<string, string>;
  planTimesSec?: Record<string, number>;
  onPlanSelect?: (label: string) => void;
}) {
  const sortedWaypoints = React.useMemo(() => {
    if (mode !== "plan") return waypoints;
    const t = planTimesSec || {};
    const withTime = waypoints.filter((k) => Number(t[k] || 0) > 0);
    if (withTime.length === 0) return waypoints;
    return [...withTime].sort((a, b) => Number(t[a] || 0) - Number(t[b] || 0));
  }, [mode, planTimesSec, waypoints]);

  return (
    <div className="relative z-0 flex flex-col md:flex-row md:items-start md:justify-between">
      <div
        className="bg-transparent absolute top-3 bottom-3 left-3 w-0.5 md:hidden"
        style={
          usingRoadmap
            ? {
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(16,185,129,0.7) 0px, rgba(16,185,129,0.7) 6px, transparent 6px, transparent 14px)",
              }
            : undefined
        }
      />
      <div
        className="bg-emerald-500 absolute top-3 bottom-3 left-3 w-0.5 transition-all md:hidden"
        style={{
          height:
            waypoints.length && progressIndex >= 0
              ? `${((progressIndex + 1) / waypoints.length) * 100}%`
              : "0%",
        }}
      />
      <div
        className="bg-transparent absolute top-[18px] right-0 left-0 hidden h-0.5 md:block"
        style={{
          marginLeft: waypoints.length ? "8%" : "4%",
          marginRight: waypoints.length ? "8%" : "4%",
          ...(usingRoadmap
            ? {
                backgroundImage:
                  "repeating-linear-gradient(to right, rgba(16,185,129,0.7) 0px, rgba(16,185,129,0.7) 10px, transparent 10px, transparent 22px)",
              }
            : {}),
        }}
      />
      <div
        className="bg-emerald-500 absolute top-[18px] hidden h-0.5 transition-all md:block"
        style={{
          left: waypoints.length ? "8%" : "4%",
          width:
            progressIndex >= 0 && waypoints.length > 1
              ? `${(progressIndex / (waypoints.length - 1)) * (100 - 16)}%`
              : progressIndex >= 0 && waypoints.length === 1
                ? `${100 - 16}%`
                : "0%",
        }}
      />

      {sortedWaypoints.length === 0 ? (
        <p className="text-muted-foreground text-base">
          No logistics checkpoints have been filed yet.
        </p>
      ) : (
        sortedWaypoints.map((loc, index) => {
          const p = progressIndex;
          const past = p >= 0 && index < p;
          const current = p >= 0 ? index === p : index === 0;
          const future = p >= 0 ? index > p : index > 0;
          const canClick = !future;

          const entryAtLoc =
            mode === "plan"
              ? null
              : history.find(
                  (e) =>
                    normalizeLoc(String(e?.lotPassport?.location || "")) ===
                    normalizeLoc(String(loc)),
                );
          const consumedAtLoc = isConsumedStatus((entryAtLoc as any)?.lotPassport?.status);
          const checkpointStatusLineRes = checkpointTextForEntry(entryAtLoc);

          return (
            <div
              key={`${loc}-${index}`}
              className="relative z-10 flex min-h-12 flex-1 flex-row items-center gap-2 py-1.5 pl-10 md:min-h-0 md:flex-col md:gap-1.5 md:py-0 md:pl-0"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                disabled={!canClick}
                className={cn(
                  "size-11 shrink-0 touch-manipulation rounded-full sm:size-10 md:size-9",
                  !canClick && "cursor-not-allowed opacity-45",
                )}
                onClick={() => {
                  if (!canClick) return;
                  if (mode === "plan") {
                    onPlanSelect?.(String(loc));
                    return;
                  }
                  setHistoryTxRef(null);
                  setSelectedStep(index);
                }}
              >
                {past || (current && journeyComplete) ? (
                  <span
                    className={cn(
                      "relative z-10 flex size-8 items-center justify-center rounded-full md:size-9",
                      consumedAtLoc ? "bg-red-600" : "bg-emerald-500",
                    )}
                  >
                    <Package
                      className={cn(
                        consumedAtLoc ? "text-red-50" : "text-emerald-50",
                        "size-5 md:size-6",
                      )}
                      strokeWidth={2.25}
                      aria-hidden="true"
                    />
                  </span>
                ) : future ? (
                  <span className="border-emerald-500/30 bg-muted/50 text-muted-foreground flex size-8 items-center justify-center rounded-full border-2 border-dashed md:size-9">
                    <Package className="size-6 md:size-7" strokeWidth={2.25} />
                  </span>
                ) : (
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border-2 md:size-9",
                      current
                        ? "bg-emerald-500 border-emerald-500 text-emerald-50"
                        : "bg-emerald-500/70 border-emerald-500/70 text-emerald-50",
                    )}
                  >
                    <Package className="size-6 md:size-7" strokeWidth={2.25} />
                  </span>
                )}
              </Button>

              <span className="text-foreground min-w-0 flex-1 text-left text-sm leading-snug font-medium [overflow-wrap:anywhere] md:mt-2 md:max-w-[130px] md:flex-none md:text-center md:text-sm">
                {loc}
                {mode === "plan" ? (
                  <span className="mt-0.5 block text-xs font-semibold text-muted-foreground">
                    {String(planTimes?.[loc] || "").trim() || "—"}
                  </span>
                ) : current ? (
                  <>
                    <span className="mt-0.5 block text-xs font-semibold">
                      {journeyComplete ? (
                        <span className="text-emerald-600">Final checkpoint</span>
                      ) : p >= 0 ? (
                        <span className="text-emerald-600">Current reporting point</span>
                      ) : (
                        <span className="text-muted-foreground">Origin point</span>
                      )}
                    </span>
                    {checkpointStatusLineRes ? (
                      <span
                        className={cn(
                          "mt-0.5 block text-xs font-semibold",
                          checkpointStatusLineRes.className,
                        )}
                      >
                        {checkpointStatusLineRes.text}
                      </span>
                    ) : null}
                  </>
                ) : null}
                {future && usingRoadmap ? (
                  <span className="text-muted-foreground mt-0.5 block text-xs">
                    Scheduled — not reported
                  </span>
                ) : null}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}

