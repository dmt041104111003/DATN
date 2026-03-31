"use client";

import * as React from "react";
import { Calendar, ExternalLink, MapPin, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TraceEventKind =
  | "INIT"
  | "UPDATE"
  | "DISPATCH"
  | "CHECKIN"
  | "CONSUMED";

export function ProductTracePublicSelectedCheckpointCard({
  selectedTx,
  selectedHash,
  explorerTxUrl,
  FMT_LONG,
  readableOpsEventFromStatus,
  readableMilestone,
  isConsumedStatus,
  mode,
  planAction,
}: {
  selectedTx: any | undefined;
  selectedHash: string;
  explorerTxUrl: (txHash: string) => string;
  FMT_LONG: Intl.DateTimeFormat;
  readableOpsEventFromStatus: (status: unknown) => string | null;
  readableMilestone: (raw: string | undefined) => string;
  isConsumedStatus: (status: unknown) => boolean;
  mode?: "product" | "plan" | "area";
  planAction?: "Created" | "Harvested" | "Packaging" | "Updated";
}) {
  const traceEventForSelected = React.useMemo(() => {
    const txAny = (selectedTx as any) || null;
    const status = txAny?.lotPassport?.status;
    const milestone = txAny?.milestone;

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
          label: "Outbound dispatched",
          iconBgClass: "bg-emerald-500",
          iconFgClass: "text-emerald-50",
          labelClass: "text-emerald-600",
        };
      }
      if (statusUpper === "INBOUND_CHECKIN") {
        return {
          kind: "CHECKIN" as const,
          label: "Check-in to warehouse",
          iconBgClass: "bg-emerald-500",
          iconFgClass: "text-emerald-50",
          labelClass: "text-emerald-600",
        };
      }

      return {
        kind: "UPDATE" as const,
        label: "Update data",
        iconBgClass: "bg-emerald-500",
        iconFgClass: "text-emerald-50",
        labelClass: "text-emerald-600",
      };
    }

    if (milestoneStr === "Custody handoff") {
      if (statusUpper === "OUTBOUND_DISPATCH") {
        return {
          kind: "DISPATCH" as const,
          label: "Outbound dispatched",
          iconBgClass: "bg-emerald-500",
          iconFgClass: "text-emerald-50",
          labelClass: "text-emerald-600",
        };
      }

      if (statusUpper === "INBOUND_CHECKIN") {
        return {
          kind: "CHECKIN" as const,
          label: "Check-in to warehouse",
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

    if (milestoneStr === "Handling event recorded") {
      if (statusUpper === "OUTBOUND_DISPATCH") {
        return {
          kind: "DISPATCH" as const,
          label: "Outbound dispatched",
          iconBgClass: "bg-emerald-500",
          iconFgClass: "text-emerald-50",
          labelClass: "text-emerald-600",
        };
      }
      if (statusUpper === "INBOUND_CHECKIN") {
        return {
          kind: "CHECKIN" as const,
          label: "Check-in to warehouse",
          iconBgClass: "bg-emerald-500",
          iconFgClass: "text-emerald-50",
          labelClass: "text-emerald-600",
        };
      }
      // Fallback: keep it specific but safe.
      return {
        kind: "UPDATE" as const,
        label: "Update data",
        iconBgClass: "bg-emerald-500",
        iconFgClass: "text-emerald-50",
        labelClass: "text-emerald-600",
      };
    }

    // Last resort: keep previous wording.
    const fallbackLabel =
      readableOpsEventFromStatus(statusUpper) ??
      readableMilestone(milestoneStr || undefined);

    return {
      kind: (fallbackLabel ? "UPDATE" : "UPDATE") as TraceEventKind,
      label: fallbackLabel ?? "Update data",
      iconBgClass: "bg-emerald-500",
      iconFgClass: "text-emerald-50",
      labelClass: "text-emerald-600",
    };
  }, [selectedTx, isConsumedStatus, readableOpsEventFromStatus, readableMilestone]);

  const planLabel = React.useMemo(() => {
    if (mode !== "plan") return "";
    return planAction || "Created";
  }, [mode, planAction]);

  return (
    <Card className="order-2 flex max-h-[min(48vh,18rem)] min-h-0 flex-col gap-2 overflow-hidden rounded-none py-2.5 sm:py-3 lg:h-full lg:max-h-none lg:order-none">
      <CardHeader className="shrink-0 px-4 pb-0 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="text-primary size-5 shrink-0 sm:size-4" />
          {mode === "plan" ? "Selected plan event" : "Selected checkpoint"}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain px-4 text-base sm:px-6">
        {selectedTx ? (
          <>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Calendar className="text-primary/60 size-3.5 shrink-0" />
              {FMT_LONG.format(new Date(Number(selectedTx.recordedAt) * 1000))}
            </div>
            <div>
              <p className="text-primary/80 text-xs font-semibold tracking-wider uppercase">
                {mode === "plan" ? "Plan event" : "Logistics event"}
              </p>
              <p className="mt-0.5 text-base font-semibold">
                {mode === "plan" ? planLabel || "Created" : traceEventForSelected.label}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`flex size-6 items-center justify-center rounded-full ${traceEventForSelected.iconBgClass}`}
              >
                <Package
                  className={`${traceEventForSelected.iconFgClass} size-4`}
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
              </span>
              <span className={`${traceEventForSelected.labelClass} text-sm font-semibold`}>
                {mode === "plan" ? planLabel || "Created" : traceEventForSelected.label}
              </span>
            </div>
            <div>
              <p className="text-primary/80 text-xs font-semibold tracking-wider uppercase">
                Verification dossier
              </p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Opens the third-party record matching this filing (for audit or public
                confirmation).
              </p>
              {selectedHash ? (
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary mt-2 inline-flex min-h-11 w-full touch-manipulation items-center justify-start gap-1 px-0 py-2 font-mono text-sm break-words sm:mt-1 sm:min-h-0 sm:w-auto sm:py-0"
                  asChild
                >
                  <a href={explorerTxUrl(selectedHash)} target="_blank" rel="noreferrer">
                    Open verification dossier
                    <ExternalLink className="size-4 shrink-0 sm:size-3" />
                  </a>
                </Button>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-base italic">
            No particulars filed for this checkpoint yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

