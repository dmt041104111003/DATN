"use client";

import * as React from "react";
import { toast } from "sonner";
import QRCode from "qrcode";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductForm, type ProductFormValues } from "./ProductForm";
import { ProductTable } from "./ProductTable";
import { ProductDetailsDialog } from "./ProductDetailsDialog";
import type { ProductRow } from "./types";

import {
  getCustodianSettlementAddress,
  publishAttestedRecord,
  signOutgoingAttestation,
} from "@/lib/wallet";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

const DEFAULT_TRADE_TITLE = "Fresh produce";
const DEFAULT_LOT_STORY = "Packed and sealed for traceability.";
const DEFAULT_CONTAINER_TYPE = "Carton";
const DEFAULT_MAX_WEIGHT_VALUE = "25";
const DEFAULT_MAX_WEIGHT_UNIT = "kg";
const DEFAULT_MAX_VOLUME_VALUE = "60";
const DEFAULT_MAX_VOLUME_UNIT = "L";

type RecordOpRow = {
  id: string;
  entityType: string;
  entityKey: string;
  opType: string;
  txHash: string;
  verified: boolean;
  createdAt: string;
  verifiedAt?: string | null;
  payload?: any;
};

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

function must(v: string, msg: string) {
  if (!String(v || "").trim()) throw new Error(msg);
}

function roadmapForMetadata(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const steps = s
    .split(/\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
  return steps.length ? JSON.stringify(steps) : "";
}

async function uploadEvidence(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BACKEND_URL}/media/upload`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { ipfsUri?: string; ipfsUrl?: string };
  const uri = String(data?.ipfsUri || data?.ipfsUrl || "").trim();
  if (!uri) throw new Error("Unable to store your file.");
  return uri;
}

export default function ProductsPage() {
  const [tab, setTab] = React.useState<"form" | "table">("form");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {},
  );

  const [rows, setRows] = React.useState<ProductRow[]>([]);
  const [warehouses, setWarehouses] = React.useState<
    Array<{ id: string; code: string; name: string }>
  >([]);
  const [plans, setPlans] = React.useState<Array<{ inventoryKey: string }>>([]);

  const [profileLocation, setProfileLocation] = React.useState("");
  const [identityAddress, setIdentityAddress] = React.useState("");
  const [owners, setOwners] = React.useState<string[]>([]);
  const [ownerInput, setOwnerInput] = React.useState("");
  const [ownerLocations, setOwnerLocations] = React.useState<Record<string, string>>({});

  const [values, setValues] = React.useState<ProductFormValues>({
    planInventoryKey: "",
    warehouseId: "",
    tradeTitle: DEFAULT_TRADE_TITLE,
    lotStory: DEFAULT_LOT_STORY,
    roadmap: "",
    containerType: DEFAULT_CONTAINER_TYPE,
    maxWeightValue: DEFAULT_MAX_WEIGHT_VALUE,
    maxWeightUnit: DEFAULT_MAX_WEIGHT_UNIT,
    maxVolumeValue: DEFAULT_MAX_VOLUME_VALUE,
    maxVolumeUnit: DEFAULT_MAX_VOLUME_UNIT,
    imageName: "",
  });

  const [txHash, setTxHash] = React.useState("");
  const [inventoryKey, setInventoryKey] = React.useState("");
  const [verifyStatus, setVerifyStatus] = React.useState<"" | "Pending" | "Yes" | "No">("");
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingInventoryKey, setEditingInventoryKey] = React.useState<string | null>(null);
  const [editingImageIpfs, setEditingImageIpfs] = React.useState<string>("");

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [detailsRow, setDetailsRow] = React.useState<ProductRow | null>(null);
  const [detailsOps, setDetailsOps] = React.useState<RecordOpRow[]>([]);
  const [loadingOps, setLoadingOps] = React.useState(false);
  const [publicCheck, setPublicCheck] = React.useState<any>(null);
  const [loadingPublicCheck, setLoadingPublicCheck] = React.useState(false);

  const disabled = loading || saving;

  const effectiveWarehouses = React.useMemo(() => {
    const list = Array.isArray(warehouses) ? warehouses : [];
    const currentId = String(values.warehouseId || "").trim();
    if (!currentId) return list;
    if (list.some((w) => String(w.id || "").trim() === currentId)) return list;
    return [{ id: currentId, code: "CURRENT", name: currentId }, ...list];
  }, [warehouses, values.warehouseId]);

  React.useEffect(() => {
    const loadIdentity = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          user?: { paymentAddress?: string | null; walletAddress?: string | null; sub?: string | null } | null;
          profile?: { location?: string | null } | null;
        };
        const addr =
          (data.user?.paymentAddress ?? "").trim() ||
          (data.user?.walletAddress ?? "").trim() ||
          (data.user?.sub ?? "").trim();
        if (addr) setIdentityAddress(addr);

        const loc = (data?.profile?.location ?? "").trim();
        if (loc) setProfileLocation(loc);
      } catch {
        // ignore
      }
    };
    loadIdentity();
  }, []);

  React.useEffect(() => {
    const addr = (identityAddress || "").trim();
    if (!addr) return;
    setOwners((prev) => {
      if (prev.some((x) => x.trim() === addr)) return prev;
      return [addr, ...prev];
    });
  }, [identityAddress]);

  React.useEffect(() => {
    const loc = (profileLocation || "").trim();
    if (!loc) return;
    setOwnerLocations((m) => {
      const a = (identityAddress || "").trim();
      if (!a) return m;
      if (String(m[a] || "").trim() === loc) return m;
      return { ...m, [a]: loc };
    });
  }, [profileLocation]);

  function currentOwners(): string[] {
    const signer = (identityAddress || "").trim();
    const cleaned = owners.map((o) => o.trim()).filter(Boolean);
    const unique = Array.from(new Set(cleaned));
    if (signer && unique.includes(signer)) {
      return [signer, ...unique.filter((x) => x !== signer)];
    }
    return signer ? [signer, ...unique] : unique;
  }

  React.useEffect(() => {
    const list = currentOwners();
    if (!list.length) return;
    let cancelled = false;
    (async () => {
      try {
        const missing = list.filter((a) => !String(ownerLocations[a] || "").trim());
        if (missing.length === 0) return;
        const results = await Promise.all(
          missing.map(async (addr) => {
            try {
              const res = await fetch(
                `${BACKEND_URL}/profile/public/${encodeURIComponent(addr)}`,
                { cache: "no-store", credentials: "include" },
              );
              if (!res.ok) return { addr, loc: "" };
              const data = (await res.json()) as { profile?: { location?: string | null } | null };
              return { addr, loc: String(data?.profile?.location || "").trim() };
            } catch {
              return { addr, loc: "" };
            }
          }),
        );
        if (cancelled) return;
        setOwnerLocations((m) => {
          const next = { ...m };
          for (const r of results) {
            if (r.addr && r.loc) next[r.addr] = r.loc;
          }
          return next;
        });
      } finally {
        // noop
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [identityAddress, owners, ownerLocations]);

  React.useEffect(() => {
    const list = currentOwners();
    if (!list.length) return;
    const roadmapLines = list
      .map((a) => String(ownerLocations[a] || "").trim())
      .filter(Boolean);
    const roadmap = roadmapLines.join("\n");
    setValues((v) => ({ ...v, roadmap }));
  }, [owners, ownerLocations, identityAddress]);

  const refreshAll = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [listRes, whRes, planRes] = await Promise.allSettled([
        apiJson<ProductRow[]>("/products", { method: "GET" }),
        apiJson<any[]>("/warehouses", { method: "GET" }),
        apiJson<any[]>("/plans", { method: "GET" }),
      ]);

      const list = listRes.status === "fulfilled" ? listRes.value : [];
      const wh = whRes.status === "fulfilled" ? whRes.value : [];
      const planList = planRes.status === "fulfilled" ? planRes.value : [];

      setRows(Array.isArray(list) ? list : []);
      setWarehouses(
        (Array.isArray(wh) ? wh : []).map((w) => ({
          id: w.id,
          code: w.code,
          name: w.name,
        })),
      );
      setPlans(
        (Array.isArray(planList) ? planList : [])
          .filter((p) => {
            const stage = String((p as any)?.stage || "").trim().toUpperCase();
            const verified = Boolean((p as any)?.verified);
            const retirePending = Boolean((p as any)?.retirePending);
            const harvestPending = Boolean((p as any)?.harvestPending);
            const packagingPending = Boolean((p as any)?.packagingPending);
            // Only allow importing plans that are fully packaged & confirmed.
            return (
              stage === "PACKAGED" &&
              verified === true &&
              !retirePending &&
              !harvestPending &&
              !packagingPending
            );
          })
          .map((p) => ({
            inventoryKey: String((p as any)?.inventoryKey || "").trim(),
          }))
          .filter((p) => p.inventoryKey),
      );

      if (listRes.status === "rejected") {
        setError(listRes.reason instanceof Error ? listRes.reason.message : String(listRes.reason || "Failed to load products."));
      } else if (whRes.status === "rejected") {
        setError(whRes.reason instanceof Error ? whRes.reason.message : String(whRes.reason || "Failed to load warehouses."));
      } else if (planRes.status === "rejected") {
        setError(planRes.reason instanceof Error ? planRes.reason.message : String(planRes.reason || "Failed to load plans."));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const validateForm = React.useCallback(
    (imageFile: File | null) => {
      const errs: Record<string, string> = {};

      if (!values.planInventoryKey.trim()) errs.planInventoryKey = "Required.";
      if (
        !isEditing &&
        values.planInventoryKey.trim() &&
        !plans.some((p) => String(p.inventoryKey || "").trim() === values.planInventoryKey.trim())
      ) {
        errs.planInventoryKey = "Plan must be PACKAGED before importing to product.";
      }
      if (!values.warehouseId.trim()) errs.warehouseId = "Required.";
      if (!profileLocation.trim()) errs.location = "Required. Set your profile location.";
      if (!values.tradeTitle.trim()) errs.tradeTitle = "Required.";
      if (!values.lotStory.trim()) errs.lotStory = "Required.";
      if (!values.roadmap.trim()) errs.roadmap = "Required.";
      if (!currentOwners().length) errs.owners = "Required.";
      if (!values.containerType.trim()) errs.containerType = "Required.";
      // capacity fields are optional and not written on-chain

      if (!isEditing && !imageFile) errs.image = "Required.";

      setFieldErrors(errs);
      if (Object.keys(errs).length) throw new Error("Please fill all required fields.");
    },
    [values, profileLocation, isEditing, identityAddress, owners, ownerLocations, plans],
  );

  const waitForVerification = React.useCallback(
    async (key: string) => {
    setVerifyStatus("Pending");
    const startedAt = Date.now();
    for (;;) {
      if (Date.now() - startedAt > 180_000) {
        setVerifyStatus("No");
        return;
      }
      await new Promise((r) => setTimeout(r, 3500));
      const list = await apiJson<RecordOpRow[]>(
        `/record-operations?entityType=PRODUCT&entityKey=${encodeURIComponent(key)}`,
        { method: "GET" },
      ).catch(() => []);
      const latest = Array.isArray(list) ? list[0] : null;
      if (latest && latest.verified) {
        setVerifyStatus("Yes");
        await refreshAll();
        return;
      }
    }
    },
    [refreshAll],
  );

  React.useEffect(() => {
    if (tab !== "table") return;
    const id = window.setInterval(() => {
      void refreshAll();
    }, 15_000);
    return () => window.clearInterval(id);
  }, [tab, refreshAll]);

  const runCreateFromImage = React.useCallback(
    async (imageFile: File) => {
      setSaving(true);
      setError("");
      try {
        validateForm(imageFile);
        const owners = currentOwners();

        const imageIpfs = await uploadEvidence(imageFile);

        const custodianAddress = await getCustodianSettlementAddress();
        must(custodianAddress, "Custodian address is empty.");
        if (!owners.includes(custodianAddress)) owners.unshift(custodianAddress);

        const unsigned = await apiJson<any>("/products/contract/create", {
          method: "POST",
          body: JSON.stringify({
            custodianAddress,
            owners,
            passport: {
              name: values.tradeTitle.trim(),
              description: values.lotStory.trim(),
              owners: `[${owners.join(", ")}]`,
              plan_inventory_key: values.planInventoryKey.trim(),
              roadmap: roadmapForMetadata(values.roadmap),
              location: profileLocation.trim(),
              containerType: values.containerType.trim(),
              capacities: JSON.stringify({
                maxWeightValue: values.maxWeightValue.trim(),
                maxWeightUnit: values.maxWeightUnit.trim(),
                maxVolumeValue: values.maxVolumeValue.trim(),
                maxVolumeUnit: values.maxVolumeUnit.trim(),
              }),
              image: imageIpfs,
            },
          }),
        });

        if (!unsigned?.result || !unsigned?.data) {
          throw new Error(unsigned?.message || "Failed to prepare issuance record.");
        }

        const signed = await signOutgoingAttestation(String(unsigned.data || ""));
        const outTxHash = await publishAttestedRecord(signed);
        const outInventoryKey = String(unsigned?.inventoryKey || "").trim();
        must(outTxHash, "Missing tx hash.");
        must(outInventoryKey, "Missing public record reference.");
        const outLotReference = String(unsigned?.lotReference || "").trim();
        must(outLotReference, "Missing internal container reference.");

        setTxHash(outTxHash);
        setInventoryKey(outInventoryKey);
        toast(`Reference ID: ${outTxHash}`);

        await apiJson<any>("/products", {
          method: "POST",
          body: JSON.stringify({
            traceSchemeRef: String(unsigned.traceSchemeRef || unsigned.schemeReference || "").trim(),
            lotReference: outLotReference,
            inventoryKey: outInventoryKey,
            confirmationRef: outTxHash,
            txHash: outTxHash,
            custodyParties: owners,
            warehouseId: values.warehouseId.trim(),
            planInventoryKey: values.planInventoryKey.trim(),
            passport: {
              name: values.tradeTitle.trim(),
              description: values.lotStory.trim(),
              owners: `[${owners.join(", ")}]`,
              roadmap: roadmapForMetadata(values.roadmap),
              location: profileLocation.trim(),
              image: imageIpfs,
              containerType: values.containerType.trim(),
              maxWeightValue: values.maxWeightValue.trim(),
              maxWeightUnit: values.maxWeightUnit.trim(),
              maxVolumeValue: values.maxVolumeValue.trim(),
              maxVolumeUnit: values.maxVolumeUnit.trim(),
            },
          }),
        });

        void waitForVerification(outInventoryKey);
        await refreshAll();
        setTab("table");
      } catch (e: any) {
        setError(String(e?.message || e || "Failed."));
      } finally {
        setSaving(false);
      }
    },
    [values, profileLocation, validateForm, refreshAll, waitForVerification, identityAddress],
  );

  const onPickImage = React.useCallback(
    (file: File | null) => {
      if (!file) return;
      setValues((v) => ({ ...v, imageName: file.name }));
      if (!isEditing) void runCreateFromImage(file);
    },
    [isEditing, runCreateFromImage],
  );

  const runSave = React.useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      if (!editingInventoryKey) throw new Error("No record selected.");
      validateForm(null);

      const row = rows.find((r) => r.inventoryKey === editingInventoryKey);
      if (!row) throw new Error("Record not found.");
      if (row.status === "OUTBOUND_DISPATCH" || row.status === "CONSUMED") {
        throw new Error("This product is locked after warehouse dispatch.");
      }

      const ownersList = currentOwners();
      const custodianAddress = await getCustodianSettlementAddress();
      must(custodianAddress, "Custodian address is empty.");
      if (!ownersList.includes(custodianAddress)) ownersList.unshift(custodianAddress);

      const txRes = await apiJson<any>("/products/contract/save", {
        method: "POST",
        body: JSON.stringify({
          custodianAddress,
          owners: row.custodyParties,
          lotReference: row.lotReference,
          passport: {
            name: values.tradeTitle.trim(),
            description: values.lotStory.trim(),
            owners: `[${row.custodyParties.join(", ")}]`,
            plan_inventory_key: values.planInventoryKey.trim(),
            roadmap: roadmapForMetadata(values.roadmap),
            location: profileLocation.trim(),
            containerType: values.containerType.trim(),
            capacities: JSON.stringify({
              maxWeightValue: values.maxWeightValue.trim(),
              maxWeightUnit: values.maxWeightUnit.trim(),
              maxVolumeValue: values.maxVolumeValue.trim(),
              maxVolumeUnit: values.maxVolumeUnit.trim(),
            }),
            productName: row.lotReference,
          },
        }),
      });
      if (!txRes?.result || !txRes?.data) {
        throw new Error(txRes?.message || "Failed to prepare update record.");
      }

      const signed = await signOutgoingAttestation(String(txRes.data || ""));
      const outTxHash = await publishAttestedRecord(signed);
      must(outTxHash, "Missing tx hash.");
      toast(`Reference ID: ${outTxHash}`);

      await apiJson<any>(`/products/${encodeURIComponent(editingInventoryKey)}`, {
        method: "PATCH",
        body: JSON.stringify({
          confirmationRef: outTxHash,
          custodyParties: row.custodyParties,
          warehouseId: values.warehouseId.trim(),
          passport: {
            name: values.tradeTitle.trim(),
            description: values.lotStory.trim(),
            plan_inventory_key: values.planInventoryKey.trim(),
            roadmap: roadmapForMetadata(values.roadmap),
            location: profileLocation.trim(),
            containerType: values.containerType.trim(),
            // Persist capacities to DB (backend expects these fields, not `capacities`)
            maxWeightValue: values.maxWeightValue.trim(),
            maxWeightUnit: values.maxWeightUnit.trim(),
            maxVolumeValue: values.maxVolumeValue.trim(),
            maxVolumeUnit: values.maxVolumeUnit.trim(),
            // Keep `capacities` for on-chain metadata compatibility (ignored by backend)
            capacities: JSON.stringify({
              maxWeightValue: values.maxWeightValue.trim(),
              maxWeightUnit: values.maxWeightUnit.trim(),
              maxVolumeValue: values.maxVolumeValue.trim(),
              maxVolumeUnit: values.maxVolumeUnit.trim(),
            }),
          },
        }),
      });

      await refreshAll();
      setIsEditing(false);
      setEditingInventoryKey(null);
      setTab("table");
    } catch (e: any) {
      setError(String(e?.message || e || "Failed."));
    } finally {
      setSaving(false);
    }
  }, [
    editingInventoryKey,
    rows,
    values,
    profileLocation,
    validateForm,
    refreshAll,
    identityAddress,
    owners,
    ownerLocations,
  ]);

  const clearForm = React.useCallback(() => {
    setError("");
    setFieldErrors({});
    setTxHash("");
    setInventoryKey("");
    setVerifyStatus("");
    setIsEditing(false);
    setEditingInventoryKey(null);
    setEditingImageIpfs("");
    setTab("form");
    setOwnerInput("");
    setOwners((prev) => {
      const signer = (identityAddress || "").trim();
      return signer ? [signer] : prev;
    });
    setValues({
      planInventoryKey: "",
      warehouseId: "",
      tradeTitle: DEFAULT_TRADE_TITLE,
      lotStory: DEFAULT_LOT_STORY,
      roadmap: (profileLocation || "").trim(),
      containerType: DEFAULT_CONTAINER_TYPE,
      maxWeightValue: DEFAULT_MAX_WEIGHT_VALUE,
      maxWeightUnit: DEFAULT_MAX_WEIGHT_UNIT,
      maxVolumeValue: DEFAULT_MAX_VOLUME_VALUE,
      maxVolumeUnit: DEFAULT_MAX_VOLUME_UNIT,
      imageName: "",
    });
  }, [identityAddress, profileLocation]);

  const onDownloadQr = React.useCallback(async (inventoryKey: string) => {
    if (typeof window === "undefined") return;
    try {
      const productUrl = `${window.location.origin}/product/${encodeURIComponent(inventoryKey)}`;
      const dataUrl = await QRCode.toDataURL(productUrl, {
        errorCorrectionLevel: "H",
        width: 512,
        margin: 4,
        color: { dark: "#1e293b", light: "#ffffff" },
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      const safeId = String(inventoryKey || "").replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `QR_${safeId || "product"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      setError(String(e?.message || e || "Failed to generate QR."));
    }
  }, []);

  const loadDetails = React.useCallback(async (key: string) => {
    setLoadingOps(true);
    setLoadingPublicCheck(true);
    setDetailsOps([]);
    setPublicCheck(null);
    try {
      const [ops, trace] = await Promise.all([
        apiJson<RecordOpRow[]>(
          `/record-operations?entityType=PRODUCT&entityKey=${encodeURIComponent(key)}`,
          { method: "GET" },
        ).catch(() => []),
        apiJson<any>(`/trace/${encodeURIComponent(key)}`, { method: "GET" }).catch(() => null),
      ]);

      const list = Array.isArray(ops) ? ops : [];
      setDetailsOps(list);

      const hasPending = list.some((o) => !o?.verified);
      const hasConfirmed = list.some((o) => o?.verified);
      const statusText = hasPending ? "Pending" : hasConfirmed ? "Yes" : "No";

      const latestConfirmed = list.find((o) => o?.verified) || null;
      const latestConfirmedAt = latestConfirmed?.verifiedAt
        ? new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(new Date(String(latestConfirmed.verifiedAt)))
        : "";

      const latest = Array.isArray(trace?.handlingLog) ? trace.handlingLog[0] : null;
      const traceLatestRecordedAt =
        latest && typeof latest.recordedAt !== "undefined"
          ? new Intl.DateTimeFormat("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }).format(new Date(Number(latest.recordedAt) * 1000))
          : "";
      const traceLatestMilestone = latest?.milestone ? String(latest.milestone) : "";

      const tracePassport =
        (latest && typeof latest.lotPassport === "object" && latest.lotPassport) ||
        (trace && typeof trace.lotPassport === "object" && trace.lotPassport) ||
        null;
      const traceImage = tracePassport ? String((tracePassport as any)?.image || "").trim() : "";
      if (traceImage) {
        setDetailsRow((prev) => (prev ? { ...prev, imageIpfs: traceImage } : prev));
      }

      setPublicCheck({
        statusText,
        latestRecordedAt: traceLatestRecordedAt || latestConfirmedAt || "",
        latestMilestone: traceLatestMilestone || (hasConfirmed ? "Created" : "") || "",
      });
    } finally {
      setLoadingOps(false);
      setLoadingPublicCheck(false);
    }
  }, []);

  const onView = React.useCallback(
    async (key: string) => {
      const hit = rows.find((r) => r.inventoryKey === key) || null;
      setDetailsRow(hit);
      setDetailsOpen(true);
      await loadDetails(key);
    },
    [rows, loadDetails],
  );

  const onRetire = React.useCallback(
    async (key: string) => {
      const row = rows.find((r) => r.inventoryKey === key);
      if (!row) return;
      if (row.hasPending || row.verified === false) {
        setError("Public record check must be confirmed before deletion.");
        return;
      }

      setSaving(true);
      setError("");
      try {
        const custodianAddress = await getCustodianSettlementAddress();
        must(custodianAddress, "Custodian address is empty.");

        const unsigned = await apiJson<any>("/products/contract/delete", {
          method: "POST",
          body: JSON.stringify({
            custodianAddress,
            owners: row.custodyParties,
            lotReference: row.lotReference,
          }),
        });
        if (!unsigned?.result || !unsigned?.data) {
          throw new Error(unsigned?.message || "Failed to prepare deletion record.");
        }
        const signed = await signOutgoingAttestation(String(unsigned.data || ""));
        const outTxHash = await publishAttestedRecord(signed);
        must(outTxHash, "Missing tx hash.");
        toast(`Reference ID: ${outTxHash}`);

        await apiJson<any>(`/products/${encodeURIComponent(key)}/retire`, {
          method: "POST",
          body: JSON.stringify({ txHash: outTxHash }),
        });

        await refreshAll();
      } catch (e: any) {
        setError(String(e?.message || e || "Failed."));
      } finally {
        setSaving(false);
      }
    },
    [rows, refreshAll],
  );

  return (
    <div className="space-y-6">
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
          <ProductForm
            disabled={disabled}
            isEditing={isEditing}
            error={error}
            fieldErrors={fieldErrors}
            txHash={txHash}
            inventoryKey={inventoryKey}
            verifyStatus={verifyStatus}
            profileLocation={profileLocation}
            identityAddress={identityAddress}
            owners={currentOwners()}
            ownerInput={ownerInput}
            onChangeOwnerInput={setOwnerInput}
            onAddOwner={() => {
              const next = ownerInput.trim();
              if (!next) return;
              setOwners((prev) => {
                const signer = (identityAddress || "").trim();
                const combined = [signer, ...prev, next]
                  .map((s) => String(s || "").trim())
                  .filter(Boolean);
                const unique = Array.from(new Set(combined));
                if (signer && unique.includes(signer)) {
                  return [signer, ...unique.filter((x) => x !== signer)];
                }
                return unique;
              });
              setOwnerInput("");
            }}
            onRemoveOwner={(addr) => {
              const signer = (identityAddress || "").trim();
              const a = String(addr || "").trim();
              if (!a) return;
              if (signer && a === signer) return;
              setOwners((prev) => prev.filter((x) => String(x || "").trim() !== a));
            }}
            ownersLocked={isEditing}
            values={values}
            warehouses={effectiveWarehouses}
            plans={plans}
            onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
            onPickImage={onPickImage}
            onSave={() => void runSave()}
            onCancel={clearForm}
            existingImageIpfs={
              editingImageIpfs ||
              (editingInventoryKey
                ? String(rows.find((r) => r.inventoryKey === editingInventoryKey)?.imageIpfs || "").trim()
                : "")
            }
          />
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <ProductTable
            rows={rows}
            loading={loading}
            saving={saving}
            onView={onView}
            onDownloadQr={onDownloadQr}
            onEdit={(key) => {
              if (disabled) return;
              const hit = rows.find((r) => r.inventoryKey === key);
              if (!hit) return;
              if (hit.status === "OUTBOUND_DISPATCH" || hit.status === "CONSUMED") return;
              setError("");
              setFieldErrors({});
              setIsEditing(true);
              setEditingInventoryKey(key);
              setEditingImageIpfs(String(hit.imageIpfs || "").trim());
              setTab("form");
              setValues((v) => ({
                ...v,
                lotReference: hit.lotReference,
                planInventoryKey: hit.planInventoryKey || "",
                warehouseId: hit.warehouseId || "",
                tradeTitle: hit.name || DEFAULT_TRADE_TITLE,
                lotStory: hit.description || DEFAULT_LOT_STORY,
                roadmap: String(hit.roadmap || "").trim(),
                containerType: String(hit.containerType || DEFAULT_CONTAINER_TYPE),
                maxWeightValue: String(hit.maxWeightValue || DEFAULT_MAX_WEIGHT_VALUE),
                maxWeightUnit: String(hit.maxWeightUnit || DEFAULT_MAX_WEIGHT_UNIT),
                maxVolumeValue: String(hit.maxVolumeValue || DEFAULT_MAX_VOLUME_VALUE),
                maxVolumeUnit: String(hit.maxVolumeUnit || DEFAULT_MAX_VOLUME_UNIT),
                imageName: "",
              }));
              setOwners(() => {
                const signer = (identityAddress || "").trim();
                const base = Array.isArray(hit.custodyParties) ? hit.custodyParties : [];
                const combined = [signer, ...base]
                  .map((s) => String(s || "").trim())
                  .filter(Boolean);
                const unique = Array.from(new Set(combined));
                if (signer && unique.includes(signer)) {
                  return [signer, ...unique.filter((x) => x !== signer)];
                }
                return unique;
              });

              const hasDbImage = Boolean(String(hit.imageIpfs || "").trim());
              if (hasDbImage) return;
              (async () => {
                try {
                  const trace = await apiJson<any>(`/trace/${encodeURIComponent(key)}`, { method: "GET" });
                  const latest = Array.isArray(trace?.handlingLog) ? trace.handlingLog[0] : null;
                  const passport =
                    (latest && typeof latest.lotPassport === "object" && latest.lotPassport) ||
                    (trace && typeof trace.lotPassport === "object" && trace.lotPassport) ||
                    null;
                  const img = passport ? String((passport as any)?.image || "").trim() : "";
                  if (img) setEditingImageIpfs(img);
                } catch {
                  // ignore
                }
              })();
            }}
            onRetire={onRetire}
          />
        </TabsContent>
      </Tabs>

      <ProductDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        row={detailsRow}
        ops={detailsOps as any}
        loadingOps={loadingOps}
        publicCheck={publicCheck}
        loadingPublicCheck={loadingPublicCheck}
      />
    </div>
  );
}

