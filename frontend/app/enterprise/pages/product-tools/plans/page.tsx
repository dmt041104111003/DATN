"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  getCustodianSettlementAddress,
  publishAttestedRecord,
  signOutgoingAttestation,
} from "@/lib/wallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanForm, type PlanFormValues } from "./PlanForm";
import { PlanTable } from "./PlanTable";
import { PlanDetailsDialog } from "./PlanDetailsDialog";
import type { PlanRow } from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

function toDateInput(v: string | null | undefined): string {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function dayMs(v: unknown): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const ms = Date.parse(`${s}T00:00:00.000Z`);
  if (Number.isNaN(ms)) return null;
  return ms;
}

function applyTimelineOrderErrors(
  next: Partial<Record<keyof PlanFormValues, string>>,
  v: PlanFormValues,
) {
  const seeding = dayMs(v.plannedSeedingDate);
  const planting = dayMs(v.plannedPlantingDate);
  const harvest = dayMs(v.plannedHarvestDate);
  const processing = dayMs(v.plannedProcessingDate);
  const packaging = dayMs(v.plannedPackagingDate);
  const expiry = dayMs(v.expiryDate);

  if (seeding !== null && planting !== null && planting < seeding) {
    next.plannedPlantingDate = "Planting date must be on or after seeding date.";
  }
  if (planting !== null && harvest !== null && harvest < planting) {
    next.plannedHarvestDate = "Harvest date must be on or after planting date.";
  }
  if (harvest !== null && processing !== null && processing < harvest) {
    next.plannedProcessingDate = "Processing date must be on or after harvest date.";
  }
  if (processing !== null && packaging !== null && packaging < processing) {
    next.plannedPackagingDate = "Packaging date must be on or after processing date.";
  }
  if (packaging !== null && expiry !== null && expiry < packaging) {
    next.expiryDate = "Expiry date must be on or after packaging date.";
  }
}

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

export default function PlansPage() {
  const [tab, setTab] = React.useState<"form" | "table">("form");
  const [rows, setRows] = React.useState<PlanRow[]>([]);
  const [areas, setAreas] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [txHash, setTxHash] = React.useState("");
  const [editingCode, setEditingCode] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"create" | "edit" | "harvest" | "packaging">("create");
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof PlanFormValues, string>>>(
    {},
  );

  const [seedCertFile, setSeedCertFile] = React.useState<File | null>(null);
  const [seedInvoiceFile, setSeedInvoiceFile] = React.useState<File | null>(null);
  const [harvestImageFile, setHarvestImageFile] = React.useState<File | null>(null);
  const [packagingImageFile, setPackagingImageFile] = React.useState<File | null>(null);

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

  const [values, setValues] = React.useState<PlanFormValues>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      growingAreaInventoryKey: "",
      cropType: "Coffee",
      nurseryBatch: "Nursery batch 01",
      plantingBatch: "Planting batch 01",
      nurseryArea: "Nursery A",
      plantingArea: "Field A",
      seedQuantityValue: "100",
      seedQuantityUnit: "kg",
      plantQuantityValue: "10000",
      plantQuantityUnit: "plants",
      plannedSeedingDate: today,
      plannedPlantingDate: today,
      plannedHarvestDate: "",
      expectedHarvestYieldValue: "",
      expectedHarvestYieldUnit: "",
      plannedProcessingDate: "",
      expectedProcessingYieldValue: "",
      expectedProcessingYieldUnit: "",
      plannedPackagingDate: "",
      expectedPackagingQuantityValue: "",
      expectedPackagingQuantityUnit: "",
      expiryDate: "",
      packagingSpecValue: "",
      packagingSpecUnit: "",
    };
  });

  const disabled = saving || loading;

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

  function requirePositiveNumber(v: unknown, label: string) {
    const s = mustTrim(v);
    const n = Number(s);
    if (!s || Number.isNaN(n) || n <= 0) throw new Error(`${label} must be a positive number.`);
  }

  function requireText(v: unknown, label: string) {
    const s = mustTrim(v);
    if (!s) throw new Error(`${label} is required.`);
    const onlyNumber = /^[0-9]+(\.[0-9]+)?$/.test(s);
    if (onlyNumber) throw new Error(`${label} must be text.`);
  }

  function requireUnitText(v: unknown, label: string) {
    const s = mustTrim(v);
    if (!s) throw new Error(`${label} is required.`);
    const hasLetter = /[A-Za-z]/.test(s);
    if (!hasLetter) throw new Error(`${label} must include letters (e.g., kg, tons, boxes).`);
    const onlyNumber = /^[0-9]+(\.[0-9]+)?$/.test(s);
    if (onlyNumber) throw new Error(`${label} must be text.`);
  }

  const loadAreas = React.useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/growing-areas`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setAreas(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  }, []);

  const loadRows = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/plans`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as PlanRow[];
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Unable to load plans.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOps = React.useCallback(async (inventoryKey: string) => {
    setLoadingDetailsOps(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/record-operations?entityType=PLAN&entityKey=${encodeURIComponent(inventoryKey)}`,
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
    void loadAreas();
    void loadRows();
  }, [loadAreas, loadRows]);

  React.useEffect(() => {
    if (disabled) return;
    if (tab === "form") return;
    const id = setInterval(() => void loadRows(), 15000);
    return () => clearInterval(id);
  }, [disabled, loadRows, tab]);


  React.useEffect(() => {
    if (!editingCode) return;
    const row = rows.find((r) => r.inventoryKey === editingCode);
    if (!row) return;
    const harvest = splitAmountUnit(row.expectedHarvestYield);
    const packaging = splitAmountUnit(row.expectedPackagingQuantity);
    const packagingSpec = splitAmountUnit(row.packagingSpec);
    setValues({
      growingAreaInventoryKey: row.growingAreaInventoryKey,
      cropType: row.cropType || "",
      nurseryBatch: row.nurseryBatch || "",
      plantingBatch: row.plantingBatch || "",
      nurseryArea: row.nurseryArea || "",
      plantingArea: row.plantingArea || "",
      seedQuantityValue: row.seedQuantityValue || "",
      seedQuantityUnit: row.seedQuantityUnit || "",
      plantQuantityValue: row.plantQuantityValue || "",
      plantQuantityUnit: row.plantQuantityUnit || "",
      plannedSeedingDate: toDateInput(row.plannedSeedingDate),
      plannedPlantingDate: toDateInput(row.plannedPlantingDate),
      plannedHarvestDate: toDateInput(row.plannedHarvestDate),
      expectedHarvestYieldValue: harvest.value,
      expectedHarvestYieldUnit: harvest.unit,
      plannedProcessingDate: toDateInput(row.plannedProcessingDate),
      expectedProcessingYieldValue: splitAmountUnit(row.expectedProcessingYield).value,
      expectedProcessingYieldUnit: splitAmountUnit(row.expectedProcessingYield).unit,
      plannedPackagingDate: toDateInput(row.plannedPackagingDate),
      expectedPackagingQuantityValue: packaging.value,
      expectedPackagingQuantityUnit: packaging.unit,
      expiryDate: toDateInput(row.expiryDate),
      packagingSpecValue: packagingSpec.value,
      packagingSpecUnit: packagingSpec.unit,
    });
    setSeedCertFile(null);
    setSeedInvoiceFile(null);
    setHarvestImageFile(null);
    setPackagingImageFile(null);
  }, [editingCode, rows]);

  const currentEditingRow = React.useMemo(() => {
    if (!editingCode) return null;
    return rows.find((r) => r.inventoryKey === editingCode) || null;
  }, [editingCode, rows]);

  const resetForm = React.useCallback(() => {
    setEditingCode(null);
    setMode("create");
    setTxHash("");
    setError("");
    setSeedCertFile(null);
    setSeedInvoiceFile(null);
    setHarvestImageFile(null);
    setPackagingImageFile(null);
    const today = new Date().toISOString().slice(0, 10);
    setValues((v) => ({
      ...v,
      growingAreaInventoryKey: "",
      plannedSeedingDate: today,
      plannedPlantingDate: today,
      plannedHarvestDate: "",
      expectedHarvestYieldValue: "",
      expectedHarvestYieldUnit: "",
      plannedProcessingDate: "",
      expectedProcessingYieldValue: "",
      expectedProcessingYieldUnit: "",
      plannedPackagingDate: "",
      expectedPackagingQuantityValue: "",
      expectedPackagingQuantityUnit: "",
      expiryDate: "",
      packagingSpecValue: "",
      packagingSpecUnit: "",
    }));
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
      const growingAreaInventoryKey = (values.growingAreaInventoryKey || "").trim();
      const next: Partial<Record<keyof PlanFormValues, string>> = {};
      if (!mustTrim(growingAreaInventoryKey)) next.growingAreaInventoryKey = "Growing area is required.";
      if (!mustTrim(values.cropType)) next.cropType = "Crop type is required.";
      if (!mustTrim(values.nurseryBatch)) next.nurseryBatch = "Nursery batch is required.";
      if (!mustTrim(values.plantingBatch)) next.plantingBatch = "Planting batch is required.";
      if (!mustTrim(values.nurseryArea)) next.nurseryArea = "Nursery area is required.";
      if (!mustTrim(values.plantingArea)) next.plantingArea = "Planting area is required.";
      if (!mustTrim(values.seedQuantityValue)) next.seedQuantityValue = "Input quantity is required.";
      if (!mustTrim(values.seedQuantityUnit)) next.seedQuantityUnit = "Input quantity unit is required.";
      if (!mustTrim(values.plantQuantityValue)) next.plantQuantityValue = "Plant quantity is required.";
      if (!mustTrim(values.plantQuantityUnit)) next.plantQuantityUnit = "Plant quantity unit is required.";
      if (!mustTrim(values.plannedSeedingDate)) next.plannedSeedingDate = "Planned seeding date is required.";
      if (!mustTrim(values.plannedPlantingDate)) next.plannedPlantingDate = "Planned planting date is required.";
      applyTimelineOrderErrors(next, values);
      if (Object.keys(next).length) {
        setFieldErrors(next);
        return;
      }

      requirePositiveNumber(values.seedQuantityValue, "Input quantity");
      requireUnitText(values.seedQuantityUnit, "Input quantity unit");
      requirePositiveNumber(values.plantQuantityValue, "Plant quantity");
      requireUnitText(values.plantQuantityUnit, "Plant quantity unit");
      requireText(values.nurseryArea, "Nursery area");
      requireText(values.plantingArea, "Planting area");
      requireText(values.nurseryBatch, "Nursery batch");
      requireText(values.plantingBatch, "Planting batch");
      requireText(values.cropType, "Crop type");

      if (!seedCertFile) throw new Error("Certificate file is required.");
      if (!seedInvoiceFile) throw new Error("Invoice file is required.");
      const seedCertificateIpfs = seedCertFile ? await uploadEvidence(seedCertFile) : "";
      const seedInvoiceIpfs = seedInvoiceFile ? await uploadEvidence(seedInvoiceFile) : "";

      const custodianAddress = await getCustodianSettlementAddress();
      if (!mustTrim(custodianAddress)) throw new Error("Unable to read your wallet account. Please reconnect and try again.");
      const ownersList = [custodianAddress];

      const plannedTimeline = {
        plannedSeedingDate: values.plannedSeedingDate,
        plannedPlantingDate: values.plannedPlantingDate,
        nurseryBatch: values.nurseryBatch,
        plantingBatch: values.plantingBatch,
        nurseryArea: values.nurseryArea,
        plantingArea: values.plantingArea,
      };
      const quantities = {
        seedQuantityValue: values.seedQuantityValue,
        seedQuantityUnit: values.seedQuantityUnit,
        plantQuantityValue: values.plantQuantityValue,
        plantQuantityUnit: values.plantQuantityUnit,
      };

      const txRes = await fetch(`${BACKEND_URL}/plans/contract/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          custodianAddress,
          owners: ownersList,
          cropType: (values.cropType || "").trim(),
          growingAreaInventoryKey,
          seedCertificateIpfs: seedCertificateIpfs || null,
          seedInvoiceIpfs: seedInvoiceIpfs || null,
          plannedTimeline,
          quantities,
        }),
      });
      const txData = await txRes.json();
      if (!txData.result || !txData.data) {
        throw new Error(txData.message || "Unable to prepare your request.");
      }

      const signed = await signOutgoingAttestation(txData.data);
      const hash = await publishAttestedRecord(signed);
      if (!hash || !String(hash).trim()) throw new Error("Unable to confirm your request.");
      setTxHash(hash);

      const schemeRef = String(txData.traceSchemeRef || txData.schemeReference || "").trim();
      const inventoryKey = String(txData.inventoryKey || "").trim();
      if (!schemeRef || !inventoryKey) throw new Error("Missing reference unit from contract response.");

      const dbRes = await fetch(`${BACKEND_URL}/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          traceSchemeRef: schemeRef,
          inventoryKey,
          growingAreaInventoryKey,
          seedCertificateIpfs: seedCertificateIpfs || null,
          seedInvoiceIpfs: seedInvoiceIpfs || null,
          nurseryBatch: values.nurseryBatch,
          plantingBatch: values.plantingBatch,
          cropType: values.cropType,
          nurseryArea: values.nurseryArea,
          plantingArea: values.plantingArea,
          seedQuantityValue: values.seedQuantityValue,
          seedQuantityUnit: values.seedQuantityUnit,
          plantQuantityValue: values.plantQuantityValue,
          plantQuantityUnit: values.plantQuantityUnit,
          plannedSeedingDate: values.plannedSeedingDate,
          plannedPlantingDate: values.plannedPlantingDate,
          plannedHarvestDate: null,
          expectedHarvestYield: null,
          plannedProcessingDate: null,
          expectedProcessingYield: null,
          plannedPackagingDate: null,
          expectedPackagingQuantity: null,
          expiryDate: null,
          packagingSpec: null,
          txHash: hash,
        }),
      });
      if (!dbRes.ok) throw new Error(await dbRes.text());

      await loadRows();
      setTab("table");
    } catch (e: any) {
      setError(e?.message || "Unable to create the plan.");
    } finally {
      setSaving(false);
    }
  }, [values, seedCertFile, seedInvoiceFile, loadRows]);

  const lastAutoCreateRef = React.useRef<string>("");
  React.useEffect(() => {
    if (saving || loading) return;
    if (mode !== "create") return;
    if (!seedInvoiceFile || !seedCertFile) return;
    const key = `${seedInvoiceFile.name}|${seedInvoiceFile.size}|${seedInvoiceFile.lastModified}::${seedCertFile.name}|${seedCertFile.size}|${seedCertFile.lastModified}`;
    if (lastAutoCreateRef.current === key) return;
    lastAutoCreateRef.current = key;
    toast("Preparing signature", { description: "Building transaction…" });
    void runCreate();
  }, [seedInvoiceFile, seedCertFile, saving, loading, mode, runCreate]);


  const runSaveDraft = React.useCallback(async () => {
    setFieldErrors({});
    setSaving(true);
    setError("");
    setTxHash("");
    try {
      const planKey = String(editingCode || "").trim();
      if (!planKey) throw new Error("Select a plan to save.");
      const current = rows.find((r) => r.inventoryKey === planKey);
      if (!current) throw new Error("Plan not found.");
      if (current.verified === false) throw new Error("This plan is still being verified. Please try again soon.");

      const currentCropType = mustTrim(current.cropType);
      const nextCropType = mustTrim(values.cropType);

      const currentNurseryBatch = mustTrim(current.nurseryBatch);
      const nextNurseryBatch = mustTrim(values.nurseryBatch);

      const currentPlantingBatch = mustTrim(current.plantingBatch);
      const nextPlantingBatch = mustTrim(values.plantingBatch);

      const currentNurseryArea = mustTrim(current.nurseryArea);
      const nextNurseryArea = mustTrim(values.nurseryArea);

      const currentPlantingArea = mustTrim(current.plantingArea);
      const nextPlantingArea = mustTrim(values.plantingArea);

      const currentSeedQValue = mustTrim(current.seedQuantityValue);
      const nextSeedQValue = mustTrim(values.seedQuantityValue);

      const currentSeedQUnit = mustTrim(current.seedQuantityUnit);
      const nextSeedQUnit = mustTrim(values.seedQuantityUnit);

      const currentPlantQValue = mustTrim(current.plantQuantityValue);
      const nextPlantQValue = mustTrim(values.plantQuantityValue);

      const currentPlantQUnit = mustTrim(current.plantQuantityUnit);
      const nextPlantQUnit = mustTrim(values.plantQuantityUnit);

      const currentSeedingDate = toDateInput(current.plannedSeedingDate);
      const nextSeedingDate = mustTrim(values.plannedSeedingDate);

      const currentPlantingDate = toDateInput(current.plannedPlantingDate);
      const nextPlantingDate = mustTrim(values.plannedPlantingDate);

      const changed =
        currentCropType !== nextCropType ||
        currentNurseryBatch !== nextNurseryBatch ||
        currentPlantingBatch !== nextPlantingBatch ||
        currentNurseryArea !== nextNurseryArea ||
        currentPlantingArea !== nextPlantingArea ||
        currentSeedQValue !== nextSeedQValue ||
        currentSeedQUnit !== nextSeedQUnit ||
        currentPlantQValue !== nextPlantQValue ||
        currentPlantQUnit !== nextPlantQUnit ||
        currentSeedingDate !== nextSeedingDate ||
        currentPlantingDate !== nextPlantingDate;

      if (!changed) {
        setFieldErrors({ cropType: "Nothing changed. Please edit at least one field before saving." });
        return;
      }

      const next: Partial<Record<keyof PlanFormValues, string>> = {};
      if (!mustTrim(values.cropType)) next.cropType = "Crop type is required.";
      if (!mustTrim(values.nurseryBatch)) next.nurseryBatch = "Nursery batch is required.";
      if (!mustTrim(values.plantingBatch)) next.plantingBatch = "Planting batch is required.";
      if (!mustTrim(values.nurseryArea)) next.nurseryArea = "Nursery area is required.";
      if (!mustTrim(values.plantingArea)) next.plantingArea = "Planting area is required.";
      if (!mustTrim(values.seedQuantityValue)) next.seedQuantityValue = "Input quantity is required.";
      if (!mustTrim(values.seedQuantityUnit)) next.seedQuantityUnit = "Input quantity unit is required.";
      if (!mustTrim(values.plantQuantityValue)) next.plantQuantityValue = "Plant quantity is required.";
      if (!mustTrim(values.plantQuantityUnit)) next.plantQuantityUnit = "Plant quantity unit is required.";
      if (!mustTrim(values.plannedSeedingDate)) next.plannedSeedingDate = "Planned seeding date is required.";
      if (!mustTrim(values.plannedPlantingDate)) next.plannedPlantingDate = "Planned planting date is required.";
      applyTimelineOrderErrors(next, values);
      if (Object.keys(next).length) {
        setFieldErrors(next);
        return;
      }

      requirePositiveNumber(values.seedQuantityValue, "Input quantity");
      requireUnitText(values.seedQuantityUnit, "Input quantity unit");
      requirePositiveNumber(values.plantQuantityValue, "Plant quantity");
      requireUnitText(values.plantQuantityUnit, "Plant quantity unit");
      requireText(values.nurseryArea, "Nursery area");
      requireText(values.plantingArea, "Planting area");
      requireText(values.nurseryBatch, "Nursery batch");
      requireText(values.plantingBatch, "Planting batch");
      requireText(values.cropType, "Crop type");

      const seedCertificateIpfs = seedCertFile
        ? await uploadEvidence(seedCertFile)
        : String(current.seedCertificateIpfs || "").trim();
      const seedInvoiceIpfs = seedInvoiceFile
        ? await uploadEvidence(seedInvoiceFile)
        : String(current.seedInvoiceIpfs || "").trim();

      const custodianAddress = await getCustodianSettlementAddress();
      if (!mustTrim(custodianAddress)) throw new Error("Unable to read your wallet account. Please reconnect and try again.");
      const ownersList = [custodianAddress];

      const plannedTimeline = {
        plannedSeedingDate: values.plannedSeedingDate,
        plannedPlantingDate: values.plannedPlantingDate,
        nurseryBatch: values.nurseryBatch,
        plantingBatch: values.plantingBatch,
        nurseryArea: values.nurseryArea,
        plantingArea: values.plantingArea,
      };
      const quantities = {
        seedQuantityValue: values.seedQuantityValue,
        seedQuantityUnit: values.seedQuantityUnit,
        plantQuantityValue: values.plantQuantityValue,
        plantQuantityUnit: values.plantQuantityUnit,
      };

      const txRes = await fetch(`${BACKEND_URL}/plans/contract/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          custodianAddress,
          owners: ownersList,
          inventoryKey: planKey,
          cropType: (values.cropType || "").trim(),
          seedCertificateIpfs: seedCertificateIpfs || null,
          seedInvoiceIpfs: seedInvoiceIpfs || null,
          plannedTimeline,
          quantities,
        }),
      });
      const txData = await txRes.json();
      if (!txData.result || !txData.data) {
        throw new Error(txData.message || "Unable to prepare your request.");
      }

      const signed = await signOutgoingAttestation(txData.data);
      const hash = await publishAttestedRecord(signed);
      if (!hash || !String(hash).trim()) throw new Error("Unable to confirm your request.");
      setTxHash(hash);

      const patchRes = await fetch(`${BACKEND_URL}/plans/${encodeURIComponent(planKey)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          txHash: hash,
          seedCertificateIpfs: seedCertificateIpfs || null,
          seedInvoiceIpfs: seedInvoiceIpfs || null,
          cropType: values.cropType,
          nurseryBatch: values.nurseryBatch,
          plantingBatch: values.plantingBatch,
          nurseryArea: values.nurseryArea,
          plantingArea: values.plantingArea,
          seedQuantityValue: values.seedQuantityValue,
          seedQuantityUnit: values.seedQuantityUnit,
          plantQuantityValue: values.plantQuantityValue,
          plantQuantityUnit: values.plantQuantityUnit,
          plannedSeedingDate: values.plannedSeedingDate,
          plannedPlantingDate: values.plannedPlantingDate,
        }),
      });
      if (!patchRes.ok) throw new Error(await patchRes.text());

      await loadRows();
      setTab("table");
    } catch (e: any) {
      setError(e?.message || "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }, [values, editingCode, rows, loadRows, seedCertFile, seedInvoiceFile]);

  const runHarvest = React.useCallback(async (fileOverride?: File | null) => {
    setFieldErrors({});
    setSaving(true);
    setError("");
    setTxHash("");
    try {
      const planKey = String(editingCode || "").trim();
      if (!planKey) throw new Error("Select a plan to harvest.");
      const current = rows.find((r) => r.inventoryKey === planKey);
      if (!current) throw new Error("Plan not found.");
      const stage = String(current.stage || "").toUpperCase();
      if (stage === "HARVESTED" || stage === "PACKAGED") throw new Error("This plan is already harvested.");
      if (current.verified === false) {
        throw new Error("This plan is still being verified. Please try again soon.");
      }
      if (current.retirePending || current.harvestPending) {
        throw new Error("This plan is still being verified. Please try again soon.");
      }

      const next: Partial<Record<keyof PlanFormValues, string>> = {};
      if (!mustTrim(values.plannedHarvestDate)) next.plannedHarvestDate = "Planned harvest date is required.";
      if (!mustTrim(values.expectedHarvestYieldValue))
        next.expectedHarvestYieldValue = "Expected harvest yield value is required.";
      if (!mustTrim(values.expectedHarvestYieldUnit))
        next.expectedHarvestYieldUnit = "Expected harvest yield unit is required.";
      if (!mustTrim(values.plannedProcessingDate)) next.plannedProcessingDate = "Planned processing date is required.";
      if (!mustTrim(values.expectedProcessingYieldValue))
        next.expectedProcessingYieldValue = "Expected processing yield value is required.";
      if (!mustTrim(values.expectedProcessingYieldUnit))
        next.expectedProcessingYieldUnit = "Expected processing yield unit is required.";
      applyTimelineOrderErrors(next, values);
      if (Object.keys(next).length) {
        setFieldErrors(next);
        return;
      }

      requirePositiveNumber(values.expectedHarvestYieldValue, "Expected harvest yield value");
      requireUnitText(values.expectedHarvestYieldUnit, "Expected harvest yield unit");
      requirePositiveNumber(values.expectedProcessingYieldValue, "Expected processing yield value");
      requireUnitText(values.expectedProcessingYieldUnit, "Expected processing yield unit");

      const currentHarvestDate = toDateInput(current.plannedHarvestDate);
      const nextHarvestDate = mustTrim(values.plannedHarvestDate);

      const currentExpectedHarvestYield = mustTrim(current.expectedHarvestYield);
      const nextExpectedHarvestYield = joinAmountUnit(values.expectedHarvestYieldValue, values.expectedHarvestYieldUnit);

      const currentProcessingDate = toDateInput(current.plannedProcessingDate);
      const nextProcessingDate = toDateInput(values.plannedProcessingDate);

      const currentExpectedProcessingYield = mustTrim(current.expectedProcessingYield);
      const nextExpectedProcessingYield = joinAmountUnit(values.expectedProcessingYieldValue, values.expectedProcessingYieldUnit);

      const currentHarvestImageIpfs = String(current.harvestImageIpfs || "").trim();
      const selectedHarvestFile = fileOverride ?? harvestImageFile;
      const nextHarvestImageSelected = Boolean(selectedHarvestFile);
      if (!mustTrim(currentHarvestImageIpfs) && !selectedHarvestFile) {
        throw new Error("Harvest image is required.");
      }

      const changed =
        currentHarvestDate !== nextHarvestDate ||
        currentExpectedHarvestYield !== nextExpectedHarvestYield ||
        currentProcessingDate !== nextProcessingDate ||
        currentExpectedProcessingYield !== nextExpectedProcessingYield ||
        nextHarvestImageSelected;

      if (!changed) {
        setFieldErrors({
          expectedHarvestYieldValue: "Nothing changed. Please edit harvest details before harvesting.",
        });
        return;
      }

      const custodianAddress = await getCustodianSettlementAddress();
      const ownersList = [custodianAddress];

      let harvestImageIpfs = currentHarvestImageIpfs;
      if (selectedHarvestFile) {
        harvestImageIpfs = await uploadEvidence(selectedHarvestFile);
      }
      if (!mustTrim(harvestImageIpfs)) throw new Error("Harvest image is required.");

      const plannedTimeline = {
        plannedHarvestDate: values.plannedHarvestDate || null,
        plannedProcessingDate: values.plannedProcessingDate || null,
      };
      const quantities = {
        expectedHarvestYield: nextExpectedHarvestYield || null,
        expectedProcessingYield: nextExpectedProcessingYield || null,
      };

      // Use the same contract flow as "Save" (refresh), but only send harvest-stage fields.
      const txRes = await fetch(`${BACKEND_URL}/plans/contract/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          custodianAddress,
          owners: ownersList,
          inventoryKey: planKey,
          cropType: String(current.cropType || "").trim(),
          harvestImageIpfs: harvestImageIpfs || null,
          plannedTimeline,
          quantities,
        }),
      });
      if (!txRes.ok) throw new Error(await txRes.text());
      const txData = await txRes.json();
      if (!txData.result || !txData.data) {
        throw new Error(txData.message || "Unable to prepare your request.");
      }

      const signed = await signOutgoingAttestation(txData.data);
      const hash = await publishAttestedRecord(signed);
      if (!hash || !String(hash).trim()) throw new Error("Unable to confirm your request.");
      setTxHash(hash);

      const harvestRes = await fetch(
        `${BACKEND_URL}/plans/${encodeURIComponent(planKey)}/harvest`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            txHash: hash,
            plannedHarvestDate: values.plannedHarvestDate || null,
            expectedHarvestYield: nextExpectedHarvestYield || null,
            plannedProcessingDate: values.plannedProcessingDate || null,
            expectedProcessingYield: nextExpectedProcessingYield || null,
            harvestImageIpfs: harvestImageIpfs || null,
          }),
        },
      );
      if (!harvestRes.ok) throw new Error(await harvestRes.text());

      await loadRows();
      setTab("table");
    } catch (e: any) {
      setError(e?.message || "Unable to harvest the plan.");
    } finally {
      setSaving(false);
    }
  }, [values, editingCode, rows, loadRows, harvestImageFile]);

  

  const runPackaging = React.useCallback(async (fileOverride?: File | null) => {
    setFieldErrors({});
    setSaving(true);
    setError("");
    setTxHash("");
    try {
      const planKey = String(editingCode || "").trim();
      if (!planKey) throw new Error("Select a plan to package.");
      const current = rows.find((r) => r.inventoryKey === planKey);
      if (!current) throw new Error("Plan not found.");

      const stage = String(current.stage || "").toUpperCase();
      if (stage !== "HARVESTED") throw new Error("Harvest this plan before packaging.");
      if (current.verified === false || current.retirePending || current.harvestPending || (current as any).packagingPending) {
        throw new Error("This plan is still being verified. Please try again soon.");
      }

      const next: Partial<Record<keyof PlanFormValues, string>> = {};
      if (!mustTrim(values.plannedPackagingDate)) next.plannedPackagingDate = "Planned packaging date is required.";
      if (!mustTrim(values.expectedPackagingQuantityValue))
        next.expectedPackagingQuantityValue = "Expected packaging quantity value is required.";
      if (!mustTrim(values.expectedPackagingQuantityUnit))
        next.expectedPackagingQuantityUnit = "Expected packaging quantity unit is required.";
      if (!mustTrim(values.expiryDate)) next.expiryDate = "Expiry date is required.";
      if (!mustTrim(values.packagingSpecValue)) next.packagingSpecValue = "Packaging spec value is required.";
      if (!mustTrim(values.packagingSpecUnit)) next.packagingSpecUnit = "Packaging spec unit is required.";
      applyTimelineOrderErrors(next, values);
      if (Object.keys(next).length) {
        setFieldErrors(next);
        return;
      }
      const selectedPackagingFile = fileOverride ?? packagingImageFile;
      if (!selectedPackagingFile && !String((current as any).packagingImageIpfs || "").trim()) {
        throw new Error("Packaging image is required.");
      }

      requirePositiveNumber(values.expectedPackagingQuantityValue, "Expected packaging quantity value");
      requireUnitText(values.expectedPackagingQuantityUnit, "Expected packaging quantity unit");
      requirePositiveNumber(values.packagingSpecValue, "Packaging spec value");
      requireUnitText(values.packagingSpecUnit, "Packaging spec unit");

      const currentPackagingDate = toDateInput(current.plannedPackagingDate);
      const nextPackagingDate = toDateInput(values.plannedPackagingDate);
      const currentExpectedPackagingQuantity = mustTrim(current.expectedPackagingQuantity);
      const nextExpectedPackagingQuantity = joinAmountUnit(
        values.expectedPackagingQuantityValue,
        values.expectedPackagingQuantityUnit,
      );
      const currentExpiryDate = toDateInput(current.expiryDate);
      const nextExpiryDate = toDateInput(values.expiryDate);
      const currentPackagingSpec = mustTrim(current.packagingSpec);
      const nextPackagingSpec = joinAmountUnit(values.packagingSpecValue, values.packagingSpecUnit);

      const changed =
        currentPackagingDate !== nextPackagingDate ||
        currentExpectedPackagingQuantity !== nextExpectedPackagingQuantity ||
        currentExpiryDate !== nextExpiryDate ||
        currentPackagingSpec !== nextPackagingSpec ||
        Boolean(selectedPackagingFile);
      if (!changed) {
        setFieldErrors({
          expectedPackagingQuantityValue: "Nothing changed. Please edit packaging details before packaging.",
        });
        return;
      }

      const custodianAddress = await getCustodianSettlementAddress();
      const ownersList = [custodianAddress];

      let packagingImageIpfs = String((current as any).packagingImageIpfs || "").trim();
      if (selectedPackagingFile) {
        packagingImageIpfs = await uploadEvidence(selectedPackagingFile);
      }
      if (!mustTrim(packagingImageIpfs)) throw new Error("Packaging image is required.");

      const plannedTimeline = {
        plannedPackagingDate: values.plannedPackagingDate || null,
        expiryDate: values.expiryDate || null,
        packagingSpec: nextPackagingSpec || null,
      };
      const quantities = {
        expectedPackagingQuantity: nextExpectedPackagingQuantity || null,
      };

      const txRes = await fetch(`${BACKEND_URL}/plans/contract/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          custodianAddress,
          owners: ownersList,
          inventoryKey: planKey,
          cropType: String(current.cropType || "").trim(),
          packagingImageIpfs: packagingImageIpfs || null,
          plannedTimeline,
          quantities,
        }),
      });
      if (!txRes.ok) throw new Error(await txRes.text());
      const txData = await txRes.json();
      if (!txData.result || !txData.data) {
        throw new Error(txData.message || "Unable to prepare your request.");
      }

      const signed = await signOutgoingAttestation(txData.data);
      const hash = await publishAttestedRecord(signed);
      if (!hash || !String(hash).trim()) throw new Error("Unable to confirm your request.");
      setTxHash(hash);

      const res = await fetch(`${BACKEND_URL}/plans/${encodeURIComponent(planKey)}/packaging`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          txHash: hash,
          plannedPackagingDate: values.plannedPackagingDate || null,
          expectedPackagingQuantity: nextExpectedPackagingQuantity || null,
          expiryDate: values.expiryDate || null,
          packagingSpec: nextPackagingSpec || null,
          packagingImageIpfs: packagingImageIpfs || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      await loadRows();
      setTab("table");
    } catch (e: any) {
      setError(e?.message || "Unable to confirm packaging.");
    } finally {
      setSaving(false);
    }
  }, [values, editingCode, rows, loadRows, packagingImageFile]);

  

  const runDelete = React.useCallback(async (_inventoryKey: string) => {
    setSaving(true);
    setError("");
    setTxHash("");
    try {
      const planKey = (_inventoryKey || "").trim();
      const plan = rows.find((r) => r.inventoryKey === planKey);
      if (!plan) throw new Error("Plan not found.");
      if (!plan.verified) throw new Error("This plan is still being verified. Please try again soon.");
      if (plan.retirePending) throw new Error("This plan is being closed.");
      if (plan.harvestPending) throw new Error("This plan is still being verified. Please try again soon.");
      if (String(plan.stage || "").toUpperCase() !== "PLANNED") throw new Error("This plan is locked.");

      const custodianAddress = await getCustodianSettlementAddress();
      const ownersList = [custodianAddress];

      const txRes = await fetch(`${BACKEND_URL}/plans/contract/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          custodianAddress,
          owners: ownersList,
          inventoryKey: planKey,
        }),
      });
      const txData = await txRes.json();
      if (!txData.result || !txData.data) {
        throw new Error(txData.message || "Unable to prepare your request.");
      }

      const signed = await signOutgoingAttestation(txData.data);
      const hash = await publishAttestedRecord(signed);
      if (!hash || !String(hash).trim()) throw new Error("Unable to confirm your request.");
      setTxHash(hash);

      const markRes = await fetch(
        `${BACKEND_URL}/plans/${encodeURIComponent(planKey)}/retire`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ txHash: hash }),
        },
      );
      if (!markRes.ok) throw new Error(await markRes.text());

      await loadRows();
      setTab("table");
    } catch (e: any) {
      setError(e?.message || "Unable to delete the plan.");
    } finally {
      setSaving(false);
    }
  }, [rows, loadRows]);

  return (
    <div className="flex w-full flex-col gap-4">
      <PlanDetailsDialog
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
          <PlanForm
            disabled={disabled}
            mode={mode}
            error={error}
            fieldErrors={fieldErrors}
            txHash={txHash}
            values={values}
            growingAreas={areas}
            seedCertificateName={
              seedCertFile?.name ||
              String(currentEditingRow?.seedCertificateIpfs || "").trim() ||
              ""
            }
            seedInvoiceName={
              seedInvoiceFile?.name ||
              String(currentEditingRow?.seedInvoiceIpfs || "").trim() ||
              ""
            }
            harvestImageName={
              harvestImageFile?.name ||
              String(currentEditingRow?.harvestImageIpfs || "").trim() ||
              ""
            }
            packagingImageName={
              packagingImageFile?.name ||
              String((currentEditingRow as any)?.packagingImageIpfs || "").trim() ||
              ""
            }
            onPickSeedInvoice={(file) => {
              setSeedInvoiceFile(file);
            }}
            onPickSeedCertificate={(file) => {
              setSeedCertFile(file);
            }}
            onPickHarvestImage={(file) => {
              setHarvestImageFile(file);
              if (!file) return;
              if (disabled) return;
              if (mode !== "harvest") return;
              void runHarvest(file);
            }}
            onPickPackagingImage={(file) => {
              setPackagingImageFile(file);
              if (!file) return;
              if (disabled) return;
              if (mode !== "packaging") return;
              void runPackaging(file);
            }}
            onChange={(patch) => {
              if (disabled) return;
              setValues((v) => ({ ...v, ...patch }));
            }}
            onCreate={() => void runCreate()}
            onSaveDraft={() => void runSaveDraft()}
            onHarvest={() => void runHarvest()}
            onPackaging={() => void runPackaging()}
            onCancel={resetForm}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <PlanTable
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
            onEdit={(code) => {
              if (disabled) return;
              setEditingCode(code);
              setHarvestImageFile(null);
              setMode("edit");
              setTab("form");
            }}
            onHarvest={(code) => {
              if (disabled) return;
              setEditingCode(code);
              setHarvestImageFile(null);
              setPackagingImageFile(null);
              setMode("harvest");
              setTab("form");
            }}
            onPackaging={(code) => {
              if (disabled) return;
              setEditingCode(code);
              setHarvestImageFile(null);
              setPackagingImageFile(null);
              setMode("packaging");
              setTab("form");
            }}
            onDelete={(code) => void runDelete(code)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

