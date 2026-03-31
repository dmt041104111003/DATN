"use client";

import * as React from "react";
import { toast } from "sonner";
import { getCustodianSettlementAddress, publishAttestedRecord, signOutgoingAttestation } from "@/lib/wallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GrowingAreaForm } from "./GrowingAreaForm";
import { GrowingAreaTable } from "./GrowingAreaTable";
import { GrowingAreaDetailsDialog } from "./GrowingAreaDetailsDialog";
import type { GrowingAreaRow } from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

const DEFAULT_AREA_NAME = "Growing Area 01";
const DEFAULT_AREA_LOCATION = "Lam Dong, Viet Nam";
const DEFAULT_AREA_SIZE = "12 ha";
const DEFAULT_SOIL_TYPE = "Alluvial";

function splitAmountUnit(raw: unknown): { value: string; unit: string } {
  const s = String(raw ?? "").trim();
  if (!s) return { value: "", unit: "" };
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { value: s, unit: "" };
  return { value: parts[0], unit: parts.slice(1).join(" ") };
}

function joinAmountUnit(value: unknown, unit: unknown): string {
  const v = String(value ?? "").trim();
  const u = String(unit ?? "").trim();
  return `${v} ${u}`.trim();
}

const DEFAULT_AREA_SIZE_SPLIT = splitAmountUnit(DEFAULT_AREA_SIZE);

export default function GrowingAreasPage() {
  const [tab, setTab] = React.useState<"form" | "table">("form");
  const [rows, setRows] = React.useState<GrowingAreaRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [txHash, setTxHash] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<
      Record<
        | "ownersText"
        | "name"
        | "location"
        | "areaSizeValue"
        | "areaSizeUnit"
        | "soilType"
        | "nftImage",
        string
      >
    >
  >({});

  const [name, setName] = React.useState(DEFAULT_AREA_NAME);
  const [areaSizeValue, setAreaSizeValue] = React.useState(DEFAULT_AREA_SIZE_SPLIT.value);
  const [areaSizeUnit, setAreaSizeUnit] = React.useState(DEFAULT_AREA_SIZE_SPLIT.unit);
  const [soilType, setSoilType] = React.useState(DEFAULT_SOIL_TYPE);

  const [nftImageFile, setNftImageFile] = React.useState<File | null>(null);

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [detailsCode, setDetailsCode] = React.useState<string | null>(null);
  const [detailsOps, setDetailsOps] = React.useState<any[]>([]);
  const [loadingDetailsOps, setLoadingDetailsOps] = React.useState(false);

  type PublicCheck = {
    latestRecordedAt?: string;
    latestMilestone?: string;
    statusText?: string;
  };
  const publicCheckCacheRef = React.useRef<Record<string, PublicCheck>>({});
  const [publicCheck, setPublicCheck] = React.useState<PublicCheck | null>(null);
  const [loadingPublicCheck, setLoadingPublicCheck] = React.useState(false);

  const [identityAddress, setIdentityAddress] = React.useState<string>("");
  const [profileLocation, setProfileLocation] = React.useState<string>("");

  const owners = React.useMemo(() => {
    const a = (identityAddress || "").trim();
    return a ? [a] : [];
  }, [identityAddress]);

  const lastToastHash = React.useRef<string>("");
  React.useEffect(() => {
    const hash = String(txHash || "").trim();
    if (!hash) return;
    if (lastToastHash.current === hash) return;
    lastToastHash.current = hash;
    toast("Reference ID", { description: hash });
  }, [txHash]);

  function mustTrim(v: unknown): string {
    return String(v ?? "").trim();
  }

  function requireNonEmpty(v: unknown, label: string) {
    if (!mustTrim(v)) throw new Error(`${label} is required.`);
  }

  function validatePositiveNumber(v: unknown, label: string): string | undefined {
    const s = mustTrim(v);
    if (!s) return `${label} is required.`;
    const n = Number(s);
    if (Number.isNaN(n) || n <= 0) return `${label} must be a positive number.`;
    return undefined;
  }

  function validateUnitText(v: unknown, label: string): string | undefined {
    const s = mustTrim(v);
    if (!s) return `${label} is required.`;
    const onlyNumber = /^[0-9]+(\.[0-9]+)?$/.test(s);
    if (onlyNumber) return `${label} must be text.`;
    const hasLetter = /[A-Za-z]/.test(s);
    if (!hasLetter) return `${label} must include letters (e.g., ha).`;
    return undefined;
  }

  function validateCreateOrSave(): boolean {
    const next: typeof fieldErrors = {};
    if (owners.length === 0) next.ownersText = "Owner account is required.";
    if (!mustTrim(name)) next.name = "Growing area name is required.";
    if (!mustTrim(effectiveLocation)) next.location = "Location is required.";
    const areaSizeValueErr = validatePositiveNumber(areaSizeValue, "Area size value");
    if (areaSizeValueErr) next.areaSizeValue = areaSizeValueErr;
    const areaSizeUnitErr = validateUnitText(areaSizeUnit, "Area size unit");
    if (areaSizeUnitErr) next.areaSizeUnit = areaSizeUnitErr;
    if (!mustTrim(soilType)) next.soilType = "Soil type is required.";
    const hasImage = Boolean(nftImageFile);
    if (!hasImage) next.nftImage = "Image is required.";
    const normalizedName = mustTrim(name).toLowerCase();
    if (normalizedName) {
      const conflict = rows.find((r) => {
        if (!r) return false;
        return mustTrim(r.name).toLowerCase() === normalizedName;
      });
      if (conflict) next.name = "This name is already used. Please choose another one.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  React.useEffect(() => {
    const loadIdentity = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          user?: { paymentAddress?: string | null; walletAddress?: string | null; sub?: string | null } | null;
        };
        const addr =
          (data.user?.paymentAddress ?? "").trim() ||
          (data.user?.walletAddress ?? "").trim() ||
          (data.user?.sub ?? "").trim();
        if (addr) setIdentityAddress(addr);
      } catch {
        // ignore
      }
    };
    loadIdentity();
  }, []);

  React.useEffect(() => {
    const addr = (identityAddress || "").trim();
    if (!addr) return;
    let cancelled = false;
    const loadProfileLocation = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/profile/public/${encodeURIComponent(addr)}`,
          { cache: "no-store", credentials: "include" },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { profile?: { location?: string | null } | null };
        const loc = (data?.profile?.location || "").trim();
        if (cancelled) return;
        setProfileLocation(loc);
      } catch {
        // ignore
      }
    };
    loadProfileLocation();
    return () => {
      cancelled = true;
    };
  }, [identityAddress]);

  const effectiveLocation = React.useMemo(() => {
    const loc = (profileLocation || "").trim();
    return loc || DEFAULT_AREA_LOCATION;
  }, [profileLocation]);

  const loadRows = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/growing-areas`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as GrowingAreaRow[];
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Unable to load growing areas.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOps = React.useCallback(async (inventoryKey: string) => {
    setLoadingDetailsOps(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/record-operations?entityType=GROWING_AREA&entityKey=${encodeURIComponent(inventoryKey)}`,
        { credentials: "include", cache: "no-store" },
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setDetailsOps(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast("Unable to load details", { description: e?.message || "Please try again." });
      setDetailsOps([]);
    } finally {
      setLoadingDetailsOps(false);
    }
  }, []);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  React.useEffect(() => {
    if (loading || saving) return;
    if (tab === "form") return;
    const id = setInterval(() => {
      void loadRows();
    }, 15000);
    return () => clearInterval(id);
  }, [loadRows, loading, saving, tab]);

  const resetForm = React.useCallback(() => {
    setTxHash("");
    setError("");
    setName(DEFAULT_AREA_NAME);
    setAreaSizeValue(DEFAULT_AREA_SIZE_SPLIT.value);
    setAreaSizeUnit(DEFAULT_AREA_SIZE_SPLIT.unit);
    setSoilType(DEFAULT_SOIL_TYPE);
    setNftImageFile(null);
  }, []);

  async function uploadEvidence(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BACKEND_URL}/media/upload`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    const data = (await res.json()) as { ipfsUri?: string };
    const uri = String(data?.ipfsUri || "").trim();
    if (!uri) throw new Error("Unable to store your file.");
    return uri;
  }

  const runCreate = React.useCallback(async () => {
    setFieldErrors({});
    setSaving(true);
    setError("");
    setTxHash("");
    try {
      if (!validateCreateOrSave()) return;

      const custodianAddress = await getCustodianSettlementAddress();
      const nftImageIpfs = nftImageFile ? await uploadEvidence(nftImageFile) : "";

      const txRes = await fetch(`${BACKEND_URL}/growing-areas/contract/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          custodianAddress,
          owners,
          name: (name || "").trim(),
          location: effectiveLocation,
          areaSize: joinAmountUnit(areaSizeValue, areaSizeUnit),
          soilType: (soilType || "").trim(),
          nftImageIpfs: nftImageIpfs || null,
        }),
      });
      const txData = await txRes.json();
      if (!txData.result || !txData.data) {
        throw new Error(txData.message || "Unable to prepare your request.");
      }

      const signed = await signOutgoingAttestation(txData.data);
      const hash = await publishAttestedRecord(signed);
      if (!hash || !String(hash).trim()) {
        throw new Error("Unable to confirm your request.");
      }
      setTxHash(hash);

      const schemeRef = String(txData.traceSchemeRef || txData.schemeReference || "").trim();
      const inventoryKey = String(txData.inventoryKey || "").trim();
      if (!schemeRef || !inventoryKey) throw new Error("Missing reference unit from contract response.");

      const dbRes = await fetch(`${BACKEND_URL}/growing-areas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          traceSchemeRef: schemeRef,
          inventoryKey,
          txHash: hash,
          custodyParties: owners,
          name: (name || "").trim(),
          location: effectiveLocation,
          areaSize: joinAmountUnit(areaSizeValue, areaSizeUnit) || null,
          soilType: (soilType || "").trim() || null,
          nftImageIpfs: nftImageIpfs || null,
        }),
      });
      if (!dbRes.ok) throw new Error(await dbRes.text());

      await loadRows();
      setTab("table");
    } catch (e: any) {
      setError(e?.message || "Unable to create the growing area.");
    } finally {
      setSaving(false);
    }
  }, [name, owners, areaSizeValue, areaSizeUnit, soilType, effectiveLocation, loadRows, nftImageFile]);

  const lastAutoCreateRef = React.useRef<string>("");
  React.useEffect(() => {
    if (saving || loading) return;
    if (!nftImageFile) return;
    const key = `${nftImageFile.name}|${nftImageFile.size}|${nftImageFile.lastModified}`;
    if (lastAutoCreateRef.current === key) return;
    // Only auto-create when required fields are ready.
    if (!validateCreateOrSave()) return;
    lastAutoCreateRef.current = key;
    void runCreate();
  }, [nftImageFile, saving, loading, runCreate]);

  const runDelete = React.useCallback(async (inventoryKey: string) => {
    setSaving(true);
    setError("");
    setTxHash("");
    try {
      const area = rows.find((r) => r.inventoryKey === inventoryKey);
      if (!area) throw new Error("Growing area not found.");
      if (Number((area as any).planCount || 0) > 0) {
        throw new Error("Cannot delete: this growing area still has plans attached.");
      }
      if (!area.verified) {
        throw new Error("This growing area is still being verified. Please try again soon.");
      }
      const custodyParties = String(area.custodyRoster || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      if (custodyParties.length === 0) throw new Error("Owners list is missing.");

      const custodianAddress = await getCustodianSettlementAddress();

      const txRes = await fetch(`${BACKEND_URL}/growing-areas/contract/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          custodianAddress,
          owners: custodyParties,
          inventoryKey,
        }),
      });
      const txData = await txRes.json();
      if (!txData.result || !txData.data) {
        throw new Error(txData.message || "Unable to prepare your request.");
      }

      const signed = await signOutgoingAttestation(txData.data);
      const hash = await publishAttestedRecord(signed);
      setTxHash(hash);

      const markRes = await fetch(
        `${BACKEND_URL}/growing-areas/${encodeURIComponent(inventoryKey)}/retire`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ txHash: hash }),
        },
      );
      if (!markRes.ok) throw new Error(await markRes.text());

      await loadRows();
    } catch (e: any) {
      setError(e?.message || "Unable to delete the growing area.");
    } finally {
      setSaving(false);
    }
  }, [rows, loadRows]);

  const disabled = saving || loading;

  return (
    <div className="flex w-full flex-col gap-4">
      <GrowingAreaDetailsDialog
        open={detailsOpen}
        onOpenChange={(o) => {
          setDetailsOpen(o);
          if (!o) {
            setDetailsCode(null);
            setPublicCheck(null);
            setLoadingPublicCheck(false);
          }
        }}
        row={detailsCode ? rows.find((r) => r.inventoryKey === detailsCode) || null : null}
        ops={detailsOps as any}
        loadingOps={loadingDetailsOps}
        publicCheck={publicCheck}
        loadingPublicCheck={loadingPublicCheck}
      />
      <Tabs
        value={tab}
        onValueChange={(v) => {
          if (disabled) return;
          setTab(v as "form" | "table");
        }}
        className="w-full gap-4"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="form" disabled={disabled}>
            Form
          </TabsTrigger>
          <TabsTrigger value="table" disabled={disabled}>
            Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-0">
          <GrowingAreaForm
            ownersText={owners.join(", ")}
            values={{
              name,
              location: effectiveLocation,
              areaSizeValue,
              areaSizeUnit,
              soilType,
            }}
            disabled={disabled}
            error={error}
            fieldErrors={fieldErrors}
            txHash={txHash}
            nftImageName={
              nftImageFile?.name || ""
            }
            onPickNftImage={setNftImageFile}
            onChange={(patch) => {
              if (patch.name !== undefined) setName(patch.name);
              if (patch.areaSizeValue !== undefined) setAreaSizeValue(patch.areaSizeValue);
              if (patch.areaSizeUnit !== undefined) setAreaSizeUnit(patch.areaSizeUnit);
              if (patch.soilType !== undefined) setSoilType(patch.soilType);
            }}
            onCreate={() => void runCreate()}
            onCancel={resetForm}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <GrowingAreaTable
            rows={rows}
            loading={loading}
            saving={saving}
            onView={(inventoryKey) => {
              if (disabled) return;
              setDetailsCode(inventoryKey);
              setDetailsOpen(true);
              void loadOps(inventoryKey);
              setPublicCheck(null);
              setLoadingPublicCheck(false);

              const key = String(inventoryKey || "").trim();
              if (!key) return;

              const cached = publicCheckCacheRef.current[key];
              if (cached) {
                setPublicCheck(cached);
                return;
              }

              setLoadingPublicCheck(true);
              (async () => {
                try {
                  const res = await fetch(`${BACKEND_URL}/trace/${encodeURIComponent(key)}`, {
                    cache: "no-store",
                  });
                  if (!res.ok) {
                    const next: PublicCheck = { statusText: "Public record not available" };
                    publicCheckCacheRef.current[key] = next;
                    setPublicCheck(next);
                    return;
                  }
                  const data = await res.json();
                  const latest = Array.isArray(data?.handlingLog) ? data.handlingLog[0] : null;
                  const latestRecordedAt =
                    latest && typeof latest.recordedAt !== "undefined"
                      ? new Intl.DateTimeFormat("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }).format(new Date(Number(latest.recordedAt) * 1000))
                      : undefined;
                  const latestMilestone = latest?.milestone ? String(latest.milestone) : undefined;
                  const statusText = latest
                    ? "Confirmed in public record"
                    : "No public record update found";

                  const next: PublicCheck = { latestRecordedAt, latestMilestone, statusText };
                  publicCheckCacheRef.current[key] = next;
                  setPublicCheck(next);
                } catch {
                  const next: PublicCheck = { statusText: "Public record not available" };
                  publicCheckCacheRef.current[key] = next;
                  setPublicCheck(next);
                } finally {
                  setLoadingPublicCheck(false);
                }
              })();
            }}
            onDelete={(inventoryKey) => void runDelete(inventoryKey)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

