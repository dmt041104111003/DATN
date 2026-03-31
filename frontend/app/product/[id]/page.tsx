"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getProductTrace } from "@/actions/trace";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductCheckpoints } from "./ProductCheckpoints";
import { ProductTracePublicHeaderCard } from "./ProductTracePublicHeaderCard";
import { ProductTracePublicImageCard } from "./ProductTracePublicImageCard";
import { ProductTracePublicSelectedCheckpointCard } from "./ProductTracePublicSelectedCheckpointCard";
import { ProductTracePublicMovementHistoryCard } from "./ProductTracePublicMovementHistoryCard";
import { shortUnit } from "@/lib/short-unit";

const CIP68_100 = "000643b0";
const TX_EXPLORER_BASE = (
  process.env.NEXT_PUBLIC_CARDANO_EXPLORER_TX_PREFIX ??
  "https://preprod.cexplorer.io/tx/"
).replace(/\/?$/, "/");
const IPFS_GATEWAY =
  (process.env.NEXT_PUBLIC_PINATA_GATEWAY || "").trim() ||
  (process.env.NEXT_PUBLIC_IPFS_GATEWAY || "").trim();

const FMT_LONG = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeStyle: "short",
});
const FMT_DATE = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const FMT_VI_DT = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const MILESTONE_READABLE: Record<string, string> = {
  "Lot first registered": "Initial lot registration filed",
  "Lot closed in circulation": "Consignment closed — trace completed",
  "Custody handoff": "Custody transferred to next logistics party",
  "Passport refreshed": "Lot master data amended",
  "Handling event recorded": "Handling or inspection event recorded",
};

type UnknownRecord = Record<string, unknown>;

function asRecord(v: unknown): UnknownRecord | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as UnknownRecord;
}

function readableMilestone(raw: string | undefined) {
  if (!raw) return "—";
  return MILESTONE_READABLE[raw] ?? raw;
}

function isConsumedStatus(status: unknown): boolean {
  return String(status ?? "").trim().toUpperCase() === "CONSUMED";
}

function readableOpsEventFromStatus(status: unknown): string | null {
  const s = String(status ?? "").trim().toUpperCase();
  if (!s) return null;
  if (s === "CONSUMED") return "Consumed";
  if (s === "OUTBOUND_DISPATCH") return "Outbound dispatch";
  if (s === "INBOUND_CHECKIN") return "Inbound check-in";
  if (s === "UPDATED") return "Data updated";
  if (s === "INITIAL") return "Initial record created";
  return null;
}

function explorerTxUrl(txHash: string) {
  return `${TX_EXPLORER_BASE}${txHash}`;
}

function parseRoadmap(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
  const s = String(raw).trim();
  if (!s) return [];
  try {
    const j = JSON.parse(s);
    if (Array.isArray(j)) return j.map((x) => String(x).trim()).filter(Boolean);
  } catch {
    // ignore malformed JSON and fall through
  }
  // Fallback: treat as a single waypoint string (legacy minimal support).
  return [s];
}

function normalizeLoc(s: string) {
  return s?.toLowerCase().trim() || "";
}

function inventoryKeyFromDecoded(decodedId: string) {
  if (!decodedId || decodedId.length <= 56) return decodedId;
  const policy = decodedId.slice(0, 56);
  const rest = decodedId.slice(56);
  if (/^[0-9a-fA-F]+$/.test(rest) && rest.length % 2 === 0) return decodedId;
  const hexName = Array.from(new TextEncoder().encode(rest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return policy + CIP68_100 + hexName;
}

function decodeAssetName(decodedId: string) {
  if (!decodedId || decodedId.length <= 56) return "";
  const rest = decodedId.slice(56);
  if (!/^[0-9a-fA-F]+$/.test(rest) || rest.length % 2 !== 0) return rest;
  let hexName = rest.startsWith(CIP68_100) ? rest.slice(CIP68_100.length) : rest;
  if (!hexName || hexName.length % 2 !== 0) return "";
  try {
    return new TextDecoder().decode(
      new Uint8Array(
        hexName.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || [],
      ),
    );
  } catch {
    return "";
  }
}

function txRefOf(entry: any) {
  return String(entry?.confirmationRef ?? entry?.txHash ?? "");
}


function ipfsToHttp(uri: string): string {
  const raw = String(uri || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  const looksLikeCid =
    (raw.startsWith("Qm") && raw.length >= 46) ||
    raw.startsWith("bafy") ||
    raw.startsWith("bafk") ||
    raw.startsWith("bagy");
  if (looksLikeCid) {
    const hash = raw;
    if (IPFS_GATEWAY) return `https://${IPFS_GATEWAY.replace(/^https?:\/\//, "")}/ipfs/${hash}`;
    return `https://ipfs.io/ipfs/${hash}`;
  }

  if (raw.startsWith("ipfs://")) {
    const hash = raw.replace(/^ipfs:\/\//, "").replace(/^ipfs\//, "");
    if (IPFS_GATEWAY) return `https://${IPFS_GATEWAY.replace(/^https?:\/\//, "")}/ipfs/${hash}`;
    return `https://ipfs.io/ipfs/${hash}`;
  }
  return raw;
}

function pickFirstString(obj: UnknownRecord | null, keys: string[]): string {
  if (!obj) return "";
  for (const k of keys) {
    const v = String(obj[k] ?? "").trim();
    if (v) return v;
  }
  return "";
}

export default function ProductTraceabilityPage() {
  const params = useParams();
  const decodedId = decodeURIComponent(params.id as string);
  const inventoryKey = React.useMemo(
    () => inventoryKeyFromDecoded(decodedId),
    [decodedId],
  );
  const decodedAssetName = React.useMemo(() => decodeAssetName(decodedId), [decodedId]);

  const { data: tracking, isLoading, isError } = useQuery({
    queryKey: ["product-trace", inventoryKey],
    queryFn: () => getProductTrace({ inventoryKey }),
    enabled: !!inventoryKey,
  });

  const [selectedStep, setSelectedStep] = React.useState(0);
  const [historyTxRef, setHistoryTxRef] = React.useState<string | null>(null);

  const [linkedMode, setLinkedMode] = React.useState<"product" | "plan" | "area">("product");
  const [linkedTrace, setLinkedTrace] = React.useState<any | null>(null);

  React.useEffect(() => {
    setHistoryTxRef(null);
    setSelectedStep(0);
    setLinkedMode("product");
    setLinkedTrace(null);
  }, [inventoryKey]);

  const planHistory = React.useMemo(() => {
    if (linkedMode !== "plan") return [];
    const log = Array.isArray(linkedTrace?.handlingLog) ? linkedTrace.handlingLog : [];
    return [...log].sort((a, b) => Number(b?.recordedAt || 0) - Number(a?.recordedAt || 0));
  }, [linkedMode, linkedTrace]);

  const [planSelectedIdx, setPlanSelectedIdx] = React.useState(0);
  React.useEffect(() => {
    setPlanSelectedIdx(0);
  }, [linkedMode, linkedTrace]);

  const planEvents = React.useMemo(() => {
    if (linkedMode !== "plan")
      return [] as Array<{ entry: any; action: "Created" | "Harvested" | "Packaging" | "Updated" }>;
    // Plan filings often merge metadata; classify by time order instead.
    const sorted = [...planHistory].sort((a, b) => Number(b?.recordedAt || 0) - Number(a?.recordedAt || 0));
    return sorted.map((entry, idx) => {
      const lastIdx = Math.max(0, sorted.length - 1);
      let action: "Created" | "Harvested" | "Packaging" | "Updated" = "Updated";
      if (idx === 0) action = "Packaging";
      else if (idx === 1) action = "Harvested";
      else if (idx === lastIdx) action = "Created";
      return { entry, action };
    });
  }, [linkedMode, planHistory]);

  const planSelected = linkedMode === "plan" ? planEvents[planSelectedIdx]?.entry : undefined;
  const planSelectedAction = linkedMode === "plan" ? planEvents[planSelectedIdx]?.action : undefined;
  const planSelectedHash = planSelected ? txRefOf(planSelected) : "";

  const planMetaAt = React.useMemo(() => {
    if (linkedMode !== "plan") return null;
    return asRecord(planSelected?.lotPassport) || asRecord(linkedTrace?.lotPassport) || asRecord(linkedTrace);
  }, [linkedMode, planSelected, linkedTrace]);

  const planCheckpointTimes = React.useMemo(() => {
    if (linkedMode !== "plan") return {};
    const byAction: Record<string, number> = {};
    for (const ev of planEvents) {
      const act = ev.action;
      const t = Number(ev?.entry?.recordedAt || 0);
      if (!t) continue;
      byAction[act] = Math.max(byAction[act] || 0, t);
    }
    const out: Record<string, string> = {};
    for (const k of ["Created", "Harvested", "Packaging", "Updated"] as const) {
      const sec = byAction[k] || 0;
      if (!sec) continue; // only include checkpoints that really exist
      out[k] = FMT_VI_DT.format(new Date(sec * 1000));
    }
    return out;
  }, [linkedMode, planEvents]);

  const planCheckpointTimesSec = React.useMemo(() => {
    if (linkedMode !== "plan") return {};
    const byAction: Record<string, number> = {};
    for (const ev of planEvents) {
      const act = ev.action;
      const t = Number(ev?.entry?.recordedAt || 0);
      if (!t) continue;
      byAction[act] = Math.max(byAction[act] || 0, t);
    }
    return byAction;
  }, [linkedMode, planEvents]);

  const planCheckpointLabels = React.useMemo(() => {
    if (linkedMode !== "plan") return ["Created", "Harvested", "Packaging"];
    const ordered = ["Created", "Harvested", "Packaging", "Updated"] as const;
    return ordered.filter((k) => String(planCheckpointTimes[k] || "").trim());
  }, [linkedMode, planCheckpointTimes]);

  const planImageUrl = React.useMemo(() => {
    if (linkedMode !== "plan") return "";
    const entry = planSelected;
    const lp = asRecord(entry?.lotPassport);
    const action = planSelectedAction || "Created";
    let raw = "";
    if (action === "Packaging") {
      raw =
        pickFirstString(lp, ["packaging_image", "packagingImageIpfs", "packagingImage", "packaging_image_ipfs"]) ||
        "";
    } else if (action === "Harvested") {
      raw =
        pickFirstString(lp, ["harvest_image", "harvestImageIpfs", "harvestImage", "harvest_image_ipfs"]) ||
        "";
    } else if (action === "Updated") {
      raw =
        pickFirstString(lp, ["packaging_image", "packagingImageIpfs", "packagingImage", "packaging_image_ipfs"]) ||
        pickFirstString(lp, ["harvest_image", "harvestImageIpfs", "harvestImage", "harvest_image_ipfs"]) ||
        pickFirstString(lp, ["image", "imageIpfs", "image_ipfs"]) ||
        "";
    } else {
      raw = pickFirstString(lp, ["image", "imageIpfs", "image_ipfs"]) || "";
    }
    return ipfsToHttp(raw);
  }, [linkedMode, planSelected, planSelectedAction]);

  const areaImageUrl = React.useMemo(() => {
    if (linkedMode !== "area") return "";
    const lp = asRecord(linkedTrace?.lotPassport) || asRecord(linkedTrace);
    const raw =
      pickFirstString(lp, ["image", "imageIpfs", "image_ipfs"]) ||
      pickFirstString(lp, ["areaImage", "areaImageIpfs", "area_image", "area_image_ipfs"]) ||
      "";
    return ipfsToHttp(raw);
  }, [linkedMode, linkedTrace]);

  const areaHistory = React.useMemo(() => {
    if (linkedMode !== "area") return [];
    const log = Array.isArray(linkedTrace?.handlingLog) ? linkedTrace.handlingLog : [];
    return [...log].sort((a, b) => Number(b?.recordedAt || 0) - Number(a?.recordedAt || 0));
  }, [linkedMode, linkedTrace]);

  const areaSelected = React.useMemo(() => {
    if (linkedMode !== "area") return undefined;
    return areaHistory[0];
  }, [linkedMode, areaHistory]);

  const areaMetaAt = React.useMemo(() => {
    if (linkedMode !== "area") return null;
    return asRecord(areaSelected?.lotPassport) || asRecord(linkedTrace?.lotPassport) || asRecord(linkedTrace);
  }, [linkedMode, areaSelected, linkedTrace]);

  const areaSelectedImageUrl = React.useMemo(() => {
    if (linkedMode !== "area") return "";
    const lp = areaMetaAt;
    const raw =
      pickFirstString(lp, ["image", "imageIpfs", "image_ipfs"]) ||
      pickFirstString(lp, ["areaImage", "areaImageIpfs", "area_image", "area_image_ipfs"]) ||
      "";
    return ipfsToHttp(raw);
  }, [linkedMode, areaMetaAt]);

  const history = React.useMemo(() => {
    const log = Array.isArray(tracking?.handlingLog) ? tracking.handlingLog : [];
    return [...log].sort(
      (a, b) => Number(b?.recordedAt || 0) - Number(a?.recordedAt || 0),
    );
  }, [tracking]);

  const roadmapParsed = React.useMemo(
    () => parseRoadmap((tracking?.lotPassport as Record<string, unknown>)?.roadmap),
    [tracking],
  );

  const fallbackWaypoints = React.useMemo(() => {
    const locs = history
      .slice()
      .reverse()
      .map((e) => String(e?.lotPassport?.location || "").trim())
      .filter(Boolean);
    return [...new Set(locs)];
  }, [history]);

  const waypoints = roadmapParsed.length > 0 ? roadmapParsed : fallbackWaypoints;
  const usingRoadmap = roadmapParsed.length > 0;

  const progressIndex = React.useMemo(() => {
    if (waypoints.length === 0) return -1;
    let max = -1;
    const latest0 = normalizeLoc(String(history[0]?.lotPassport?.location || ""));
    const topLoc = normalizeLoc(
      String(
        history[0]?.lotPassport?.location ||
          pickFirstString(asRecord(tracking?.lotPassport), ["location"]) ||
          waypoints[0] ||
          "",
      ),
    );
    for (const e of history) {
      const loc = normalizeLoc(String(e?.lotPassport?.location || ""));
      if (!loc) continue;
      waypoints.forEach((w, i) => {
        if (normalizeLoc(w) === loc) max = Math.max(max, i);
      });
    }
    if (topLoc) {
      const j = waypoints.findIndex((w) => normalizeLoc(w) === topLoc);
      if (j >= 0) max = Math.max(max, j);
    }
    if (latest0) {
      const j = waypoints.findIndex((w) => normalizeLoc(w) === latest0);
      if (j >= 0) max = Math.max(max, j);
    }
    return max;
  }, [waypoints, history, tracking?.lotPassport]);

  const journeyComplete = tracking?.tracingEnded === true;

  React.useEffect(() => {
    if (waypoints.length === 0 || historyTxRef != null) return;
    const idx = progressIndex >= 0 ? progressIndex : 0;
    setSelectedStep(Math.min(idx, waypoints.length - 1));
  }, [progressIndex, waypoints.length, historyTxRef]);

  React.useEffect(() => {
    const lp = tracking?.lotPassport as Record<string, unknown> | undefined;
    const t = (lp?.model as string) || (lp?.name as string) || "Product journey";
    document.title = `${t} | Public lot trace`;
  }, [tracking]);

  const selectedTx = React.useMemo(() => {
    if (historyTxRef) {
      const hit = history.find((e) => txRefOf(e) === historyTxRef);
      if (hit) return hit;
    }
    const loc = waypoints[selectedStep];
    if (loc == null) return undefined;
    return history.find(
      (e) =>
        normalizeLoc(String(e?.lotPassport?.location || "")) ===
        normalizeLoc(String(loc)),
    );
  }, [historyTxRef, history, selectedStep, waypoints]);

  const selectedHash = selectedTx ? txRefOf(selectedTx) : "";

  const headerLotPassport = React.useMemo(() => {
    if (linkedMode !== "product") return tracking?.lotPassport as any;
    return (selectedTx?.lotPassport ?? tracking?.lotPassport) as any;
  }, [linkedMode, selectedTx, tracking?.lotPassport]);

  const imageUrl = React.useMemo(() => {
    const lpSelected = asRecord(selectedTx?.lotPassport);
    const lpBase = asRecord(tracking?.lotPassport);
    if (!lpSelected && !lpBase) return "";

    const statusUpper = String((lpSelected?.status ?? lpBase?.status ?? "") as unknown)
      .trim()
      .toUpperCase();

    let raw = "";
    if (statusUpper === "INBOUND_CHECKIN") {
      raw = pickFirstString(lpSelected, [
        "checkinImage",
        "checkinImageIpfs",
        "checkin_image",
        "checkin_image_ipfs",
      ]);
      if (!raw) {
        raw = pickFirstString(lpBase, [
          "checkinImage",
          "checkinImageIpfs",
          "checkin_image",
          "checkin_image_ipfs",
        ]);
      }
    } else if (statusUpper === "OUTBOUND_DISPATCH") {
      raw = pickFirstString(lpSelected, [
        "dispatchImage",
        "dispatchImageIpfs",
        "dispatch_image",
        "dispatch_image_ipfs",
      ]);
      if (!raw) {
        raw = pickFirstString(lpBase, [
          "dispatchImage",
          "dispatchImageIpfs",
          "dispatch_image",
          "dispatch_image_ipfs",
        ]);
      }
    } else if (statusUpper === "CONSUMED") {
      raw = pickFirstString(lpSelected, [
        "consumeImage",
        "consumeImageIpfs",
        "consume_image",
        "consume_image_ipfs",
      ]);
      if (!raw) {
        raw = pickFirstString(lpBase, [
          "consumeImage",
          "consumeImageIpfs",
          "consume_image",
          "consume_image_ipfs",
        ]);
      }
    }

    if (!raw) raw = pickFirstString(lpSelected, ["image", "imageIpfs", "image_ipfs"]);
    if (!raw) raw = pickFirstString(lpBase, ["image", "imageIpfs", "image_ipfs"]);

    return ipfsToHttp(raw);
  }, [tracking?.lotPassport, history, selectedTx]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50/90 via-white to-red-50/50 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]">
        <div className="space-y-2 text-center">
          <div className="flex justify-center gap-1.5">
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="bg-primary h-2 w-2 animate-bounce rounded-full"
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
          </div>
          <p className="text-foreground/80 text-base">Loading this container’s journey…</p>
        </div>
      </div>
    );
  }

  if (isError || !tracking) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom,0px))] sm:p-6">
        <Card className="w-full max-w-md gap-3 rounded-none py-5">
          <CardContent className="space-y-3">
            <Alert variant="destructive" className="rounded-none">
              <AlertCircle />
              <AlertTitle>We couldn’t open this page</AlertTitle>
              <AlertDescription>Try scanning the code again, or check back later.</AlertDescription>
            </Alert>
            <Button
              className="min-h-11 w-full touch-manipulation rounded-none sm:min-h-10"
              asChild
            >
              <Link href="/scan">Back to scanner</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lp = (asRecord(tracking.lotPassport) || {}) as UnknownRecord;
  const title =
    pickFirstString(lp, ["name", "productName", "assetName"]) ||
    decodedAssetName ||
    "Container journey";
  const sub = title;

  return (
    <main className="bg-background text-foreground min-h-screen pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]">
      <div className="mx-auto max-w-5xl space-y-2 px-3 pt-3 pb-6 sm:space-y-3 sm:px-4 sm:pt-4 lg:px-6 lg:pt-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary touch-manipulation -ml-1 min-h-11 rounded-none px-3 sm:-ml-2 sm:min-h-9"
          asChild
        >
          <Link href="/scan">
            <ArrowLeft className="size-4 shrink-0" />
            <span className="text-base sm:text-sm">Back to scanner</span>
          </Link>
        </Button>

        <ProductTracePublicHeaderCard
          title={title}
          sub={sub}
          journeyComplete={journeyComplete}
          trackingMessage={tracking.message}
          lotPassport={headerLotPassport}
          onLinkedTraceChange={(mode, trace) => {
            setHistoryTxRef(null);
            setLinkedMode(mode);
            setLinkedTrace(trace);
          }}
          planMetaOverride={linkedMode === "plan" ? planMetaAt : null}
          areaMetaOverride={linkedMode === "area" ? areaMetaAt : null}
        />

        {linkedMode !== "area" ? (
          <Card className="gap-2 rounded-none py-2.5 sm:gap-3 sm:py-3">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-lg">Distribution checkpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4 sm:px-6">
              <ProductCheckpoints
                waypoints={linkedMode === "plan" ? planCheckpointLabels : waypoints}
                history={linkedMode === "plan" ? [] : history}
                progressIndex={linkedMode === "plan" ? Math.max(0, planCheckpointLabels.length - 1) : progressIndex}
                journeyComplete={journeyComplete}
                usingRoadmap={linkedMode === "plan" ? true : usingRoadmap}
                setHistoryTxRef={setHistoryTxRef}
                setSelectedStep={setSelectedStep}
                mode={linkedMode}
                planTimes={linkedMode === "plan" ? planCheckpointTimes : undefined}
                planTimesSec={linkedMode === "plan" ? planCheckpointTimesSec : undefined}
                onPlanSelect={(label) => {
                  if (linkedMode !== "plan") return;
                  const idx = planEvents.findIndex((e) => e.action === label);
                  if (idx >= 0) setPlanSelectedIdx(idx);
                }}
              />
            </CardContent>
          </Card>
        ) : null}

        <div
          className={`grid grid-cols-1 gap-2 sm:gap-3 lg:h-[min(48vh,18rem)] lg:min-h-[7.5rem] lg:items-stretch ${
            linkedMode === "plan" || linkedMode === "area" ? "lg:grid-cols-2" : "lg:grid-cols-3"
          }`}
        >
          <ProductTracePublicImageCard
            imageUrl={
              linkedMode === "plan"
                ? planImageUrl
                : linkedMode === "area"
                  ? (areaSelectedImageUrl || areaImageUrl)
                  : imageUrl
            }
            title={linkedMode === "plan" ? "Plan evidence" : linkedMode === "area" ? "Growing area image" : title}
          />
          <ProductTracePublicSelectedCheckpointCard
            selectedTx={linkedMode === "plan" ? planSelected : linkedMode === "area" ? areaSelected : selectedTx}
            selectedHash={linkedMode === "plan" ? planSelectedHash : linkedMode === "area" ? (areaSelected ? txRefOf(areaSelected) : "") : selectedHash}
            explorerTxUrl={explorerTxUrl}
            FMT_LONG={linkedMode === "plan" || linkedMode === "area" ? FMT_VI_DT : FMT_LONG}
            readableOpsEventFromStatus={readableOpsEventFromStatus}
            readableMilestone={readableMilestone}
            isConsumedStatus={isConsumedStatus}
            mode={linkedMode}
            planAction={linkedMode === "plan" ? planSelectedAction : undefined}
          />
          {linkedMode !== "plan" && linkedMode !== "area" ? (
            <ProductTracePublicMovementHistoryCard
              pageSlice={history}
              historyTxRef={historyTxRef}
              normalizeLoc={normalizeLoc}
              waypoints={waypoints}
              selectedStep={selectedStep}
              setHistoryTxRef={setHistoryTxRef}
              setSelectedStep={setSelectedStep}
              FMT_DATE={FMT_DATE}
              readableOpsEventFromStatus={readableOpsEventFromStatus}
              readableMilestone={readableMilestone}
              isConsumedStatus={isConsumedStatus}
              txRefOf={txRefOf}
              mode={linkedMode}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
