"use client";

import * as React from "react";
import { AlertCircle, CircleDot } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { shortUnit } from "@/lib/short-unit";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

function tryParseJsonObject(raw: unknown): Record<string, any> | null {
  if (!raw) return null;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw as any;
  const s = String(raw ?? "").trim();
  if (!s) return null;
  try {
    const v = JSON.parse(s);
    if (v && typeof v === "object" && !Array.isArray(v)) return v as any;
  } catch {
    // ignore
  }
  return null;
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

function shortLinkLabel(v: string): string {
  const s = String(v || "").trim();
  return shortUnit(s, { head: 14, tail: 4, min: 28 });
}

function LinkValue({ value }: { value: unknown }) {
  const s = String(value ?? "").trim();
  if (!s) return <span>—</span>;
  const href = ipfsToHttp(s);
  if (!href) return <span className="font-mono text-xs break-all">{s}</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-xs break-all underline underline-offset-2 text-muted-foreground hover:text-foreground"
      title={s}
    >
      {shortLinkLabel(s)}
    </a>
  );
}

function flattenJsonObject(
  obj: unknown,
  prefix = "",
  out: Array<{ k: string; v: unknown }> = [],
): Array<{ k: string; v: unknown }> {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    out.push({ k: prefix || "value", v: obj });
    return out;
  }
  for (const [k0, v0] of Object.entries(obj as Record<string, unknown>)) {
    const k = prefix ? `${prefix}.${k0}` : k0;
    if (v0 && typeof v0 === "object" && !Array.isArray(v0)) {
      flattenJsonObject(v0, k, out);
    } else if (Array.isArray(v0)) {
      out.push({ k, v: v0.map((x) => (typeof x === "string" ? x.trim() : x)) });
    } else {
      out.push({ k, v: v0 });
    }
  }
  return out;
}

function formatViDateTime(input: string): string | null {
  const s = String(input || "").trim();
  if (!s) return null;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    // Treat as UTC midnight so VN displays 07:00.
    const d = new Date(`${s}T00:00:00Z`);
    if (!Number.isNaN(d.getTime())) {
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d);
    }
  }

  // ISO date-time or other parseable date strings
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const hasTime =
      /T\d{2}:\d{2}/.test(s) ||
      /\d{2}:\d{2}/.test(s);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(hasTime
        ? {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }
        : {}),
    } as any).format(d);
  }

  return null;
}

function renderScalar(v: unknown): React.ReactNode {
  if (v == null) return "—";
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return "—";
    const formatted = formatViDateTime(s);
    if (formatted) return <span title={s}>{formatted}</span>;
    // auto-link ipfs/http
    return <LinkValue value={s} />;
  }
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return <span className="font-mono text-xs break-all">{JSON.stringify(v)}</span>;
  } catch {
    return <span className="font-mono text-xs break-all">{String(v)}</span>;
  }
}

function parseOwners(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
  const s = String(raw).trim();
  if (!s) return [];
  const normalized = s.replace(/^\[/, "").replace(/\]$/, "");
  return normalized
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseCapacities(raw: unknown): {
  maxWeightValue?: string;
  maxWeightUnit?: string;
  maxVolumeValue?: string;
  maxVolumeUnit?: string;
} | null {
  if (!raw) return null;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw as any;
  const s = String(raw ?? "").trim();
  if (!s) return null;
  try {
    const v = JSON.parse(s);
    if (v && typeof v === "object" && !Array.isArray(v)) return v as any;
  } catch {
    // ignore
  }
  return null;
}

function capLine(v?: string, u?: string) {
  const vv = String(v ?? "").trim();
  const uu = String(u ?? "").trim();
  if (!vv || !uu) return "—";
  return `${vv} ${uu}`;
}

function shortAddr(v: string): string {
  const s = String(v || "").trim();
  return shortUnit(s, { head: 14, tail: 6, min: 22 });
}

export function ProductTracePublicHeaderCard({
  title,
  sub,
  journeyComplete,
  trackingMessage,
  lotPassport,
  onLinkedTraceChange,
  areaMetaOverride,
  planMetaOverride,
}: {
  title: string;
  sub: string;
  journeyComplete: boolean;
  trackingMessage?: unknown;
  lotPassport?: Record<string, unknown> | null;
  onLinkedTraceChange?: (mode: "product" | "plan" | "area", trace: any | null) => void;
  areaMetaOverride?: any | null;
  planMetaOverride?: any | null;
}) {
  const passportAny = (lotPassport as any) || null;
  const owners = React.useMemo(() => parseOwners(passportAny?.owners), [passportAny]);
  const capacities = React.useMemo(() => parseCapacities(passportAny?.capacities), [passportAny]);
  const planRef = React.useMemo(() => tryParseJsonObject(passportAny?.plan_ref), [passportAny]);
  const growingAreaRef = React.useMemo(
    () => tryParseJsonObject(passportAny?.growing_area),
    [passportAny],
  );

  const [view, setView] = React.useState<"product" | "plan" | "area">("product");
  const [loadingKey, setLoadingKey] = React.useState<"plan" | "area" | null>(null);
  const [planMeta, setPlanMeta] = React.useState<any>(null);
  const [areaMeta, setAreaMeta] = React.useState<any>(null);
  const [metaError, setMetaError] = React.useState<string>("");

  const fetchTraceByUnit = React.useCallback(async (unit: string) => {
    const u = String(unit || "").trim();
    if (!u) throw new Error("Missing unit.");
    const res = await fetch(`${BACKEND_URL}/trace/${encodeURIComponent(u)}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, []);

  return (
    <Card className="gap-2 rounded-t-md rounded-b-none py-2.5 sm:gap-3 sm:py-3">
      <CardHeader className="px-4 text-center sm:px-6">
        <p className="text-primary text-xs font-semibold tracking-widest uppercase">
          Public origin and logistics trace
        </p>
        <CardTitle className="text-2xl leading-tight sm:text-3xl">{title}</CardTitle>
        <CardDescription className="text-pretty text-sm sm:text-base">
          {sub} — consignment status, distribution checkpoints, and registered lot
          particulars for public review.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 px-4 sm:px-6">
        {journeyComplete ? (
          <Alert className="rounded-none border-emerald-500/25 bg-emerald-500/10">
            <CircleDot className="text-emerald-600" />
            <AlertDescription>
              This consignment is closed for further movement. All records below remain
              available for inspection.
            </AlertDescription>
          </Alert>
        ) : null}
        {trackingMessage ? (
          <Alert variant="destructive" className="rounded-none">
            <AlertCircle />
            <AlertDescription>{String(trackingMessage)}</AlertDescription>
          </Alert>
        ) : null}

        {metaError ? (
          <Alert variant="destructive" className="rounded-none">
            <AlertCircle />
            <AlertTitle>Unable to load linked metadata</AlertTitle>
            <AlertDescription>{metaError}</AlertDescription>
          </Alert>
        ) : null}

        {view === "product" ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-primary/80">
                Container passport
              </p>
              <ScrollArea className="w-full">
                <div className="p-3">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="w-40 text-muted-foreground">Unit</TableCell>
                        <TableCell className="break-words font-mono text-xs">
                          {passportAny?.inventoryKey
                            ? shortUnit(String(passportAny.inventoryKey).trim())
                            : "—"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="w-40 text-muted-foreground">Description</TableCell>
                        <TableCell className="whitespace-pre-wrap break-words">
                          {String(passportAny?.description || "").trim() || "—"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="w-40 text-muted-foreground">Owners</TableCell>
                        <TableCell className="whitespace-pre-wrap break-words">
                          {owners.length ? (
                            <div className="space-y-1">
                              {owners.slice(0, 6).map((a, i) => (
                                <button
                                  key={`${i}-${a}`}
                                  type="button"
                                  className="block w-full text-left font-mono text-xs break-words text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                                  title="Click to copy"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(String(a));
                                    } catch {
                                      // ignore
                                    }
                                  }}
                                >
                                  {i + 1}. {shortAddr(String(a))}
                                </button>
                              ))}
                              {owners.length > 6 ? (
                                <div className="text-xs text-muted-foreground">
                                  +{owners.length - 6} more
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="w-40 text-muted-foreground">Container type</TableCell>
                        <TableCell className="whitespace-pre-wrap break-words">
                          {String(passportAny?.containerType || "").trim() || "—"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="w-40 text-muted-foreground">Max weight</TableCell>
                        <TableCell className="break-words">
                          {capLine(capacities?.maxWeightValue, capacities?.maxWeightUnit)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="w-40 text-muted-foreground">Max volume</TableCell>
                        <TableCell className="break-words">
                          {capLine(capacities?.maxVolumeValue, capacities?.maxVolumeUnit)}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="w-40 text-muted-foreground">Plan</TableCell>
                        <TableCell className="whitespace-pre-wrap break-words">
                          {planRef?.inventoryKey ? (
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-mono text-xs">
                                <span title={String(planRef.inventoryKey || "").trim()}>
                                  {shortUnit(String(planRef.inventoryKey || "").trim())}
                                </span>
                              </span>
                              <button
                                type="button"
                                className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground"
                                disabled={loadingKey === "plan"}
                                onClick={async () => {
                                  try {
                                    setMetaError("");
                                    setPlanMeta(null);
                                    setView("plan");
                                    setLoadingKey("plan");
                                    const data = await fetchTraceByUnit(String(planRef.inventoryKey));
                                    onLinkedTraceChange?.("plan", data);
                                    setPlanMeta((data as any)?.lotPassport ?? data);
                                  } catch (e: any) {
                                    setMetaError(String(e?.message || e || "Failed."));
                                    setView("product");
                                  } finally {
                                    setLoadingKey(null);
                                  }
                                }}
                              >
                                {loadingKey === "plan" ? "Loading…" : "Details"}
                              </button>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="w-40 text-muted-foreground">Growing area</TableCell>
                        <TableCell className="whitespace-pre-wrap break-words">
                          {growingAreaRef?.inventoryKey ? (
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-mono text-xs">
                                <span title={String(growingAreaRef.inventoryKey || "").trim()}>
                                  {shortUnit(String(growingAreaRef.inventoryKey || "").trim())}
                                </span>
                              </span>
                              <button
                                type="button"
                                className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground"
                                disabled={loadingKey === "area"}
                                onClick={async () => {
                                  try {
                                    setMetaError("");
                                    setAreaMeta(null);
                                    setView("area");
                                    setLoadingKey("area");
                                    const data = await fetchTraceByUnit(String(growingAreaRef.inventoryKey));
                                    onLinkedTraceChange?.("area", data);
                                    setAreaMeta((data as any)?.lotPassport ?? data);
                                  } catch (e: any) {
                                    setMetaError(String(e?.message || e || "Failed."));
                                    setView("product");
                                  } finally {
                                    setLoadingKey(null);
                                  }
                                }}
                              >
                                {loadingKey === "area" ? "Loading…" : "Details"}
                              </button>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : view === "plan" ? (
          <div className="space-y-2">
            <Button
              variant="link"
              className="w-fit p-0 h-auto"
              onClick={() => {
                setMetaError("");
                setPlanMeta(null);
                setView("product");
                onLinkedTraceChange?.("product", null);
              }}
            >
              Back
            </Button>
            <p className="text-xs font-semibold tracking-wider uppercase text-primary/80">Plan metadata</p>
            <ScrollArea className="w-full">
              <div className="p-3">
                {(() => {
                  const m = (planMetaOverride as any) || (planMeta as any) || {};
                  const createJson = tryParseJsonObject(m.create_json);
                  const harvestJson = tryParseJsonObject(m.harvest_json);
                  const packagingJson = tryParseJsonObject(m.packaging_json);
                  const plannedTimeline = tryParseJsonObject(m.planned_timeline);
                  const quantities = tryParseJsonObject(m.quantities);

                  const cropType = String(m.crop_type || m.cropType || "").trim() || "—";
                  const verified =
                    m.verified === true || m.hasPending === false || String(m.verifyStatus || "").trim() === "Yes";
                  const createdAt = String(m.createdAt || m.created_at || "").trim();
                  const updatedAt = String(m.updatedAt || m.updated_at || "").trim();

                  const inputQty = capLine(quantities?.seedQuantityValue, quantities?.seedQuantityUnit);
                  const plantQty = capLine(quantities?.plantQuantityValue, quantities?.plantQuantityUnit);

                  const harvestYield = String(quantities?.expectedHarvestYield ?? harvestJson?.expectedHarvestYield ?? "").trim() || "—";
                  const processingYield = String(quantities?.expectedProcessingYield ?? harvestJson?.expectedProcessingYield ?? "").trim() || "—";
                  const packagingQty = String(quantities?.expectedPackagingQuantity ?? packagingJson?.expectedPackagingQuantity ?? "").trim() || "—";
                  const packagingSpec = String(plannedTimeline?.packagingSpec ?? packagingJson?.packagingSpec ?? "").trim() || "—";

                  const nurseryArea = String(createJson?.nurseryArea ?? "").trim() || "—";
                  const nurseryBatch = String(createJson?.nurseryBatch ?? "").trim() || "—";
                  const plantingArea = String(createJson?.plantingArea ?? "").trim() || "—";
                  const plantingBatch = String(createJson?.plantingBatch ?? "").trim() || "—";

                  const sowingDate = String(plannedTimeline?.plannedSeedingDate ?? createJson?.plannedSeedingDate ?? "").trim();
                  const plantingDate = String(plannedTimeline?.plannedPlantingDate ?? createJson?.plannedPlantingDate ?? "").trim();
                  const harvestDate = String(plannedTimeline?.plannedHarvestDate ?? harvestJson?.plannedHarvestDate ?? "").trim();
                  const processingDate = String(plannedTimeline?.plannedProcessingDate ?? harvestJson?.plannedProcessingDate ?? "").trim();
                  const packagingDate = String(plannedTimeline?.plannedPackagingDate ?? packagingJson?.plannedPackagingDate ?? "").trim();
                  const expiryDate = String(plannedTimeline?.expiryDate ?? packagingJson?.expiryDate ?? "").trim();

                  return (
                    <div className="space-y-3">
                      <div className="space-y-2 rounded-md border p-3">
                        <div className="text-sm font-medium">Core</div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Crop</span>
                          <span className="min-w-0 text-right break-words">{cropType}</span>
                        </div>
                      </div>

                      <div className="space-y-2 rounded-md border p-3">
                        <div className="text-sm font-medium">Input quantities</div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Input quantity</span>
                          <span className="min-w-0 text-right break-words">{inputQty}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Plant quantity</span>
                          <span className="min-w-0 text-right break-words">{plantQty}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Nursery area</span>
                          <span className="min-w-0 text-right break-words">{nurseryArea}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Nursery batch</span>
                          <span className="min-w-0 text-right break-words">{nurseryBatch}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Planting area</span>
                          <span className="min-w-0 text-right break-words">{plantingArea}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Planting batch</span>
                          <span className="min-w-0 text-right break-words">{plantingBatch}</span>
                        </div>
                      </div>

                      <div className="space-y-2 rounded-md border p-3">
                        <div className="text-sm font-medium">Planned timeline</div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Planned sowing date</span>
                          <span className="min-w-0 text-right break-words">{renderScalar(sowingDate)}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Planting date</span>
                          <span className="min-w-0 text-right break-words">{renderScalar(plantingDate)}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Harvest date</span>
                          <span className="min-w-0 text-right break-words">{renderScalar(harvestDate)}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Processing date</span>
                          <span className="min-w-0 text-right break-words">{renderScalar(processingDate)}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Packaging date</span>
                          <span className="min-w-0 text-right break-words">{renderScalar(packagingDate)}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Expiry date</span>
                          <span className="min-w-0 text-right break-words">{renderScalar(expiryDate)}</span>
                        </div>
                      </div>

                      <div className="space-y-2 rounded-md border p-3">
                        <div className="text-sm font-medium">Expected results</div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Harvest yield</span>
                          <span className="min-w-0 text-right break-words">{harvestYield}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Processing yield</span>
                          <span className="min-w-0 text-right break-words">{processingYield}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Packaging quantity</span>
                          <span className="min-w-0 text-right break-words">{packagingQty}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Packaging spec</span>
                          <span className="min-w-0 text-right break-words">{packagingSpec}</span>
                        </div>
                      </div>

                      <div className="space-y-2 rounded-md border p-3">
                        <div className="text-sm font-medium">Attachments</div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Certificate file</span>
                          <span className="min-w-0 text-right"><LinkValue value={m.certificate} /></span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Invoice file</span>
                          <span className="min-w-0 text-right"><LinkValue value={m.invoice} /></span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Image file</span>
                          <span className="min-w-0 text-right"><LinkValue value={m.image} /></span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Harvest image</span>
                          <span className="min-w-0 text-right"><LinkValue value={m.harvest_image || harvestJson?.harvestImageIpfs} /></span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Packaging image</span>
                          <span className="min-w-0 text-right"><LinkValue value={m.packaging_image || packagingJson?.packagingImageIpfs} /></span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              variant="link"
              className="w-fit p-0 h-auto"
              onClick={() => {
                setMetaError("");
                setAreaMeta(null);
                setView("product");
                onLinkedTraceChange?.("product", null);
              }}
            >
              Back
            </Button>
            <p className="text-xs font-semibold tracking-wider uppercase text-primary/80">Growing area metadata</p>
            <ScrollArea className="w-full">
              <div className="p-3">
                {(() => {
                  const m = (areaMetaOverride as any) || (areaMeta as any) || {};
                  const ownersArea = parseOwners(m.owners);
                  const name = String(m.name || "").trim() || "—";
                  const location = String(m.location || "").trim() || "—";
                  const areaSize = String(m.areaSize || m.area_size || "").trim() || "—";
                  const soilType = String(m.soilType || m.soil_type || "").trim() || "—";
                  const image = m.image;

                  return (
                    <div className="space-y-3">

                      <div className="space-y-2 rounded-md border p-3">
                        <div className="text-sm font-medium">Core</div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Name</span>
                          <span className="min-w-0 text-right break-words">{name}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Location</span>
                          <span className="min-w-0 text-right break-words">{location}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Area size</span>
                          <span className="min-w-0 text-right break-words">{areaSize}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Soil type</span>
                          <span className="min-w-0 text-right break-words">{soilType}</span>
                        </div>
                        <div className="text-sm flex min-w-0 items-start justify-between gap-2">
                          <span className="shrink-0 text-muted-foreground">Image</span>
                          <span className="min-w-0 text-right">
                            <LinkValue value={image} />
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 rounded-md border p-3">
                        <div className="text-sm font-medium">Owners</div>
                        {ownersArea.length ? (
                          <div className="space-y-1">
                            {ownersArea.slice(0, 10).map((a: string, i: number) => (
                              <button
                                key={`${i}-${a}`}
                                type="button"
                                className="block w-full text-left font-mono text-xs break-words text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                                title="Click to copy"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(String(a));
                                  } catch {
                                    // ignore
                                  }
                                }}
                              >
                                {i + 1}. {shortAddr(String(a))}
                              </button>
                            ))}
                            {ownersArea.length > 10 ? (
                              <div className="text-xs text-muted-foreground">
                                +{ownersArea.length - 10} more
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">—</div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

