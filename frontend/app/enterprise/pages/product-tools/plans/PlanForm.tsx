"use client";
import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CameraCaptureInput } from "@/components/CameraCaptureInput";
import { shortUnit } from "@/lib/short-unit";

export type PlanFormValues = {
  growingAreaInventoryKey: string;

  cropType: string;
  nurseryBatch: string;
  plantingBatch: string;
  nurseryArea: string;
  plantingArea: string;
  seedQuantityValue: string;
  seedQuantityUnit: string;
  plantQuantityValue: string;
  plantQuantityUnit: string;

  plannedSeedingDate: string;
  plannedPlantingDate: string;
  plannedHarvestDate: string;
  expectedHarvestYieldValue: string;
  expectedHarvestYieldUnit: string;
  plannedProcessingDate: string;
  expectedProcessingYieldValue: string;
  expectedProcessingYieldUnit: string;
  plannedPackagingDate: string;
  expectedPackagingQuantityValue: string;
  expectedPackagingQuantityUnit: string;
  expiryDate: string;
  packagingSpecValue: string;
  packagingSpecUnit: string;
};

export type PlanFormProps = {
  disabled: boolean;
  mode: "create" | "edit" | "harvest" | "packaging";
  error: string;
  fieldErrors?: Partial<Record<keyof PlanFormValues, string>>;
  txHash: string;
  values: PlanFormValues;
  growingAreas: Array<{ inventoryKey: string; name?: string; location?: string }>;
  seedCertificateName: string;
  seedInvoiceName: string;
  harvestImageName: string;
  packagingImageName: string;
  onPickSeedCertificate: (file: File | null) => void;
  onPickSeedInvoice: (file: File | null) => void;
  onPickHarvestImage: (file: File | null) => void;
  onPickPackagingImage: (file: File | null) => void;
  onChange: (patch: Partial<PlanFormValues>) => void;
  onCreate: () => void;
  onSaveDraft: () => void;
  onHarvest: () => void;
  onPackaging: () => void;
  onCancel: () => void;
};

export function PlanForm({
  disabled,
  mode,
  error,
  fieldErrors,
  txHash,
  values,
  growingAreas,
  seedCertificateName,
  seedInvoiceName,
  harvestImageName,
  packagingImageName,
  onPickSeedCertificate,
  onPickSeedInvoice,
  onPickHarvestImage,
  onPickPackagingImage,
  onChange,
  onCreate,
  onSaveDraft,
  onHarvest,
  onPackaging,
  onCancel,
}: PlanFormProps) {
  const isEditing = mode === "edit";
  const isHarvest = mode === "harvest";
  const isPackaging = mode === "packaging";
  const lockPlanned = disabled || isHarvest || isPackaging || isEditing;
  const lockCreateFiles = disabled || isHarvest || isPackaging || isEditing;
  const allowEditBasics = disabled || isHarvest || isPackaging;
  const requiredMark = <span className="text-red-500">*</span>;
  const shortText = (s: string) => {
    const t = String(s ?? "").trim();
    return t ? shortUnit(t, { head: 18, tail: 4, min: 22 }) : "";
  };
  const errText = (key: keyof PlanFormValues) =>
    String((fieldErrors as any)?.[key] || "").trim();

  const canOpenHarvestCamera = React.useMemo(() => {
    if (disabled) return false;
    if (!isHarvest) return true;
    return Boolean(
      String(values.plannedHarvestDate || "").trim() &&
        String(values.expectedHarvestYieldValue || "").trim() &&
        String(values.expectedHarvestYieldUnit || "").trim() &&
        String(values.plannedProcessingDate || "").trim() &&
        String(values.expectedProcessingYieldValue || "").trim() &&
        String(values.expectedProcessingYieldUnit || "").trim(),
    );
  }, [
    disabled,
    isHarvest,
    values.expectedHarvestYieldUnit,
    values.expectedHarvestYieldValue,
    values.plannedHarvestDate,
    values.plannedProcessingDate,
    values.expectedProcessingYieldValue,
    values.expectedProcessingYieldUnit,
  ]);

  const canOpenPackagingCamera = React.useMemo(() => {
    if (disabled) return false;
    if (!isPackaging) return true;
    return Boolean(
      String(values.plannedPackagingDate || "").trim() &&
        String(values.expectedPackagingQuantityValue || "").trim() &&
        String(values.expectedPackagingQuantityUnit || "").trim() &&
        String(values.packagingSpecValue || "").trim() &&
        String(values.packagingSpecUnit || "").trim(),
    );
  }, [
    disabled,
    isPackaging,
    values.expectedPackagingQuantityUnit,
    values.expectedPackagingQuantityValue,
    values.plannedPackagingDate,
    values.packagingSpecValue,
    values.packagingSpecUnit,
  ]);

  const docsReadyToOpenCamera = React.useMemo(() => {
    if (disabled) return false;
    if (lockCreateFiles) return false;
    if (isEditing || isHarvest || isPackaging) return false;
    return Boolean(
        String(values.growingAreaInventoryKey || "").trim() &&
        String(values.cropType || "").trim() &&
        String(values.nurseryBatch || "").trim() &&
        String(values.plantingBatch || "").trim() &&
        String(values.nurseryArea || "").trim() &&
        String(values.plantingArea || "").trim() &&
        String(values.seedQuantityValue || "").trim() &&
        String(values.seedQuantityUnit || "").trim() &&
        String(values.plantQuantityValue || "").trim() &&
        String(values.plantQuantityUnit || "").trim() &&
        String(values.plannedSeedingDate || "").trim() &&
        String(values.plannedPlantingDate || "").trim(),
    );
  }, [
    disabled,
    lockCreateFiles,
    isEditing,
    isHarvest,
    isPackaging,
    values.growingAreaInventoryKey,
    values.cropType,
    values.nurseryBatch,
    values.plantingBatch,
    values.nurseryArea,
    values.plantingArea,
    values.seedQuantityValue,
    values.seedQuantityUnit,
    values.plantQuantityValue,
    values.plantQuantityUnit,
    values.plannedSeedingDate,
    values.plannedPlantingDate,
  ]);

  // Legacy from old flow (kept name to avoid larger refactors): can open docs camera.
  const canOpenNftCamera = docsReadyToOpenCamera;

  const [docStep, setDocStep] = React.useState<"invoice" | "certificate">("invoice");
  React.useEffect(() => {
    if (isEditing || isHarvest || isPackaging) return;
    if (String(seedInvoiceName || "").trim() && !String(seedCertificateName || "").trim()) {
      setDocStep("certificate");
      return;
    }
    setDocStep("invoice");
  }, [seedInvoiceName, seedCertificateName, isEditing, isHarvest, isPackaging]);

  const [docsCloseSignal, setDocsCloseSignal] = React.useState(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Growing area {requiredMark}
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={values.growingAreaInventoryKey}
              onChange={(e) => onChange({ growingAreaInventoryKey: e.target.value })}
              disabled={disabled || isEditing || isHarvest}
            >
              <option value="">Select...</option>
              {growingAreas.map((a) => (
                <option key={a.inventoryKey} value={a.inventoryKey}>
              {shortUnit(a.inventoryKey)}
                </option>
              ))}
            </select>
            {errText("growingAreaInventoryKey") ? (
              <p className="text-xs text-destructive">{errText("growingAreaInventoryKey")}</p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>
              Crop type {requiredMark}
            </Label>
            <Input
              value={values.cropType}
              onChange={(e) => onChange({ cropType: e.target.value })}
              disabled={lockPlanned}
            />
            {errText("cropType") ? (
              <p className="text-xs text-destructive">{errText("cropType")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>
              Nursery batch {requiredMark}
            </Label>
            <Input
              value={values.nurseryBatch}
              onChange={(e) => onChange({ nurseryBatch: e.target.value })}
              disabled={lockPlanned}
            />
            {errText("nurseryBatch") ? (
              <p className="text-xs text-destructive">{errText("nurseryBatch")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>
              Planting batch {requiredMark}
            </Label>
            <Input
              value={values.plantingBatch}
              onChange={(e) => onChange({ plantingBatch: e.target.value })}
              disabled={lockPlanned}
            />
            {errText("plantingBatch") ? (
              <p className="text-xs text-destructive">{errText("plantingBatch")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>
              Nursery area {requiredMark}
            </Label>
            <Input
              value={values.nurseryArea}
              onChange={(e) => onChange({ nurseryArea: e.target.value })}
              disabled={lockPlanned}
            />
            {errText("nurseryArea") ? (
              <p className="text-xs text-destructive">{errText("nurseryArea")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>
              Planting area {requiredMark}
            </Label>
            <Input
              value={values.plantingArea}
              onChange={(e) => onChange({ plantingArea: e.target.value })}
              disabled={lockPlanned}
            />
            {errText("plantingArea") ? (
              <p className="text-xs text-destructive">{errText("plantingArea")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>
              Input quantity {requiredMark}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={values.seedQuantityValue}
                onChange={(e) => onChange({ seedQuantityValue: e.target.value })}
                disabled={allowEditBasics}
                inputMode="decimal"
                placeholder="100"
              />
              <Input
                value={values.seedQuantityUnit}
                onChange={(e) => onChange({ seedQuantityUnit: e.target.value })}
                disabled={allowEditBasics}
                placeholder="kg"
              />
            </div>
            {errText("seedQuantityValue") ? (
              <p className="text-xs text-destructive">{errText("seedQuantityValue")}</p>
            ) : null}
            {errText("seedQuantityUnit") ? (
              <p className="text-xs text-destructive">{errText("seedQuantityUnit")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>
              Plant quantity {requiredMark}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={values.plantQuantityValue}
                onChange={(e) => onChange({ plantQuantityValue: e.target.value })}
                disabled={allowEditBasics}
                inputMode="decimal"
                placeholder="10000"
              />
              <Input
                value={values.plantQuantityUnit}
                onChange={(e) => onChange({ plantQuantityUnit: e.target.value })}
                disabled={allowEditBasics}
                placeholder="plants"
              />
            </div>
            {errText("plantQuantityValue") ? (
              <p className="text-xs text-destructive">{errText("plantQuantityValue")}</p>
            ) : null}
            {errText("plantQuantityUnit") ? (
              <p className="text-xs text-destructive">{errText("plantQuantityUnit")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>
              Planned seeding date {requiredMark}
            </Label>
            <Input
              type="date"
              value={values.plannedSeedingDate}
              onChange={(e) => onChange({ plannedSeedingDate: e.target.value })}
              disabled={allowEditBasics}
            />
            {errText("plannedSeedingDate") ? (
              <p className="text-xs text-destructive">{errText("plannedSeedingDate")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>
              Planned planting date {requiredMark}
            </Label>
            <Input
              type="date"
              value={values.plannedPlantingDate}
              onChange={(e) => onChange({ plannedPlantingDate: e.target.value })}
              disabled={allowEditBasics}
            />
            {errText("plannedPlantingDate") ? (
              <p className="text-xs text-destructive">{errText("plannedPlantingDate")}</p>
            ) : null}
          </div>

          {isHarvest ? (
            <>
              <div className="space-y-2">
                <Label>
                  Planned harvest date {requiredMark}
                </Label>
                <Input
                  type="date"
                  value={values.plannedHarvestDate}
                  onChange={(e) => onChange({ plannedHarvestDate: e.target.value })}
                  disabled={disabled}
                />
                {errText("plannedHarvestDate") ? (
                  <p className="text-xs text-destructive">{errText("plannedHarvestDate")}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>
                  Expected harvest yield {requiredMark}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={values.expectedHarvestYieldValue}
                    onChange={(e) => onChange({ expectedHarvestYieldValue: e.target.value })}
                    disabled={disabled}
                    inputMode="decimal"
                    placeholder="e.g., 2"
                  />
                  <Input
                    value={values.expectedHarvestYieldUnit}
                    onChange={(e) => onChange({ expectedHarvestYieldUnit: e.target.value })}
                    disabled={disabled}
                    placeholder="e.g., tons"
                  />
                </div>
                {errText("expectedHarvestYieldValue") ? (
                  <p className="text-xs text-destructive">{errText("expectedHarvestYieldValue")}</p>
                ) : null}
                {errText("expectedHarvestYieldUnit") ? (
                  <p className="text-xs text-destructive">{errText("expectedHarvestYieldUnit")}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>
                  Harvest image {requiredMark}
                </Label>
                <CameraCaptureInput
                  disabled={!canOpenHarvestCamera}
                  previewName={shortText(harvestImageName) || "No file"}
                  onCaptured={(file) => onPickHarvestImage(file)}
                  openLabel="Open camera"
                  captureLabel="Capture"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Planned processing date {requiredMark}
                </Label>
                <Input
                  type="date"
                  value={values.plannedProcessingDate}
                  onChange={(e) => onChange({ plannedProcessingDate: e.target.value })}
                  disabled={disabled}
                />
                {errText("plannedProcessingDate") ? (
                  <p className="text-xs text-destructive">{errText("plannedProcessingDate")}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>
                  Expected processing yield {requiredMark}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={values.expectedProcessingYieldValue}
                    onChange={(e) => onChange({ expectedProcessingYieldValue: e.target.value })}
                    disabled={disabled}
                    inputMode="decimal"
                    placeholder="e.g., 1.8"
                  />
                  <Input
                    value={values.expectedProcessingYieldUnit}
                    onChange={(e) => onChange({ expectedProcessingYieldUnit: e.target.value })}
                    disabled={disabled}
                    placeholder="e.g., tons"
                  />
                </div>
                {errText("expectedProcessingYieldValue") ? (
                  <p className="text-xs text-destructive">{errText("expectedProcessingYieldValue")}</p>
                ) : null}
                {errText("expectedProcessingYieldUnit") ? (
                  <p className="text-xs text-destructive">{errText("expectedProcessingYieldUnit")}</p>
                ) : null}
              </div>
            </>
          ) : isPackaging ? (
            <>
              <div className="space-y-2">
                <Label>
                  Planned packaging date {requiredMark}
                </Label>
                <Input
                  type="date"
                  value={values.plannedPackagingDate}
                  onChange={(e) => onChange({ plannedPackagingDate: e.target.value })}
                  disabled={disabled}
                />
                {errText("plannedPackagingDate") ? (
                  <p className="text-xs text-destructive">{errText("plannedPackagingDate")}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>
                  Expected packaging quantity {requiredMark}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={values.expectedPackagingQuantityValue}
                    onChange={(e) => onChange({ expectedPackagingQuantityValue: e.target.value })}
                    disabled={disabled}
                    inputMode="decimal"
                    placeholder="e.g., 1000"
                  />
                  <Input
                    value={values.expectedPackagingQuantityUnit}
                    onChange={(e) => onChange({ expectedPackagingQuantityUnit: e.target.value })}
                    disabled={disabled}
                    placeholder="e.g., boxes"
                  />
                </div>
                {errText("expectedPackagingQuantityValue") ? (
                  <p className="text-xs text-destructive">{errText("expectedPackagingQuantityValue")}</p>
                ) : null}
                {errText("expectedPackagingQuantityUnit") ? (
                  <p className="text-xs text-destructive">{errText("expectedPackagingQuantityUnit")}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>
                  Expiry date {requiredMark}
                </Label>
                <Input
                  type="date"
                  value={values.expiryDate}
                  onChange={(e) => onChange({ expiryDate: e.target.value })}
                  disabled={disabled}
                />
                {errText("expiryDate") ? (
                  <p className="text-xs text-destructive">{errText("expiryDate")}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>
                  Packaging spec {requiredMark}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={values.packagingSpecValue}
                    onChange={(e) => onChange({ packagingSpecValue: e.target.value })}
                    disabled={disabled}
                    inputMode="decimal"
                    placeholder="e.g., 10"
                  />
                  <Input
                    value={values.packagingSpecUnit}
                    onChange={(e) => onChange({ packagingSpecUnit: e.target.value })}
                    disabled={disabled}
                    placeholder="e.g., kg bag"
                  />
                </div>
                {errText("packagingSpecValue") ? (
                  <p className="text-xs text-destructive">{errText("packagingSpecValue")}</p>
                ) : null}
                {errText("packagingSpecUnit") ? (
                  <p className="text-xs text-destructive">{errText("packagingSpecUnit")}</p>
                ) : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>
                  Packaging image {requiredMark}
                </Label>
                <CameraCaptureInput
                  disabled={!canOpenPackagingCamera}
                  previewName={shortText(packagingImageName) || "No file"}
                  onCaptured={(file) => onPickPackagingImage(file)}
                  openLabel="Open camera"
                  captureLabel="Capture"
                />
              </div>
            </>
          ) : null}

          <div className="space-y-2 sm:col-span-2">
            <Label>
              Documents {requiredMark}
            </Label>
            <CameraCaptureInput
              disabled={!docsReadyToOpenCamera}
              title={docStep === "invoice" ? "Invoice" : "Certificate"}
              previewName={
                [
                  `Invoice: ${shortText(seedInvoiceName) || "No file"}`,
                  `Certificate: ${shortText(seedCertificateName) || "No file"}`,
                ].join(" • ")
              }
              onCaptured={(file) => {
                if (!file) return;
                if (docStep === "invoice") {
                  onPickSeedInvoice(file);
                  setDocStep("certificate");
                  return;
                }
                onPickSeedCertificate(file);
                // Close camera after second capture.
                setDocsCloseSignal((s) => s + 1);
              }}
              openLabel="Open camera"
              captureLabel={docStep === "invoice" ? "Capture invoice" : "Capture certificate"}
              keepOpenAfterCapture={docStep === "invoice"}
              closeSignal={docsCloseSignal}
            />
            {!docsReadyToOpenCamera ? (
              <p className="text-xs text-muted-foreground">
                Fill all required fields above to unlock camera.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Step {docStep === "invoice" ? "1/2" : "2/2"}: Please capture{" "}
                {docStep === "invoice" ? "invoice" : "certificate"}.
              </p>
            )}
          </div>

        </div>

        <div className="flex flex-wrap gap-2">
          {mode === "harvest" ? (
            <>
              <Button variant="outline" onClick={onCancel} disabled={disabled}>
                Cancel
              </Button>
            </>
          ) : mode === "packaging" ? (
            <>
              <Button variant="outline" onClick={onCancel} disabled={disabled}>
                Cancel
              </Button>
            </>
          ) : isEditing ? (
            <>
              <Button variant="secondary" onClick={onSaveDraft} disabled={disabled}>
                {disabled ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Save
              </Button>
              <Button variant="outline" onClick={onCancel} disabled={disabled}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onCancel} disabled={disabled}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

