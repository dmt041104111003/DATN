"use client";

import * as React from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CameraCaptureInput } from "@/components/CameraCaptureInput";
import { shortUnit } from "@/lib/short-unit";

export type ProductFormValues = {
  planInventoryKey: string;
  warehouseId: string;
  tradeTitle: string;
  lotStory: string;
  roadmap: string;
  containerType: string;
  maxWeightValue: string;
  maxWeightUnit: string;
  maxVolumeValue: string;
  maxVolumeUnit: string;
  imageName: string;
};

export type ProductFormProps = {
  disabled: boolean;
  isEditing: boolean;
  error: string;
  fieldErrors: Record<string, string>;
  txHash: string;
  inventoryKey: string;
  verifyStatus: "" | "Pending" | "Yes" | "No";
  profileLocation: string;
  identityAddress: string;
  owners: string[];
  ownerInput: string;
  onChangeOwnerInput: (v: string) => void;
  onAddOwner: () => void;
  onRemoveOwner: (addr: string) => void;
  ownersLocked: boolean;
  values: ProductFormValues;
  warehouses: Array<{ id: string; code: string; name: string; productCount?: number; maxProducts?: number | null }>;
  plans: Array<{ inventoryKey: string }>;
  onChange: (patch: Partial<ProductFormValues>) => void;
  onPickImage: (file: File | null) => void;
  onSave: () => void;
  onCancel: () => void;
  existingImageIpfs?: string;
};

function shortRef(s: string) {
  const t = String(s || "").trim();
  return shortUnit(t, { head: 18, tail: 4, min: 22 });
}

const TX_EXPLORER_BASE = (
  process.env.NEXT_PUBLIC_CARDANO_EXPLORER_TX_PREFIX ?? "https://preprod.cexplorer.io/tx/"
).replace(/\/?$/, "/");

export function ProductForm({
  disabled,
  isEditing,
  error,
  fieldErrors,
  txHash,
  inventoryKey,
  verifyStatus,
  profileLocation,
  identityAddress,
  owners,
  ownerInput,
  onChangeOwnerInput,
  onAddOwner,
  onRemoveOwner,
  ownersLocked,
  values,
  warehouses,
  plans,
  onChange,
  onPickImage,
  onSave,
  onCancel,
  existingImageIpfs,
}: ProductFormProps) {
  const requiredMark = <span className="text-red-500">*</span>;
  const errText = (k: string) => String(fieldErrors?.[k] || "").trim();

  function sanitizeDecimalInput(raw: string): string {
    const cleaned = String(raw || "").replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 2) return cleaned;
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }

  const roadmapSteps = React.useMemo(() => {
    return String(values.roadmap || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [values.roadmap]);

  const canOpenCamera = React.useMemo(() => {
    if (disabled) return false;
    if (isEditing) return false;
    return Boolean(
      String(values.planInventoryKey || "").trim() &&
        String(values.warehouseId || "").trim() &&
        String(values.tradeTitle || "").trim() &&
        String(values.lotStory || "").trim() &&
        String(values.roadmap || "").trim() &&
        String(values.containerType || "").trim() &&
        String(profileLocation || "").trim() &&
        owners.length > 0,
    );
  }, [disabled, isEditing, values, profileLocation, owners.length]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Container</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Plan {requiredMark}
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={values.planInventoryKey}
              disabled={disabled || isEditing}
              onChange={(e) => {
                const planInventoryKey = e.target.value;
                onChange({ planInventoryKey });
              }}
            >
              <option value="">Select a plan...</option>
                  {plans.map((p) => (
                    <option key={p.inventoryKey} value={p.inventoryKey}>
                      {shortUnit(p.inventoryKey)}
                    </option>
                  ))}
            </select>
            {errText("planInventoryKey") ? (
              <p className="text-xs text-destructive">{errText("planInventoryKey")}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>
              Inbound warehouse {requiredMark}
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={values.warehouseId}
              disabled={disabled}
              onChange={(e) => onChange({ warehouseId: e.target.value })}
            >
              <option value="">Select a warehouse...</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} — {w.name}
                </option>
              ))}
            </select>
            {errText("warehouseId") ? <p className="text-xs text-destructive">{errText("warehouseId")}</p> : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>
              Location {requiredMark}
            </Label>
            <Input value={profileLocation} disabled readOnly placeholder="Set your profile location to continue" />
            {errText("location") ? <p className="text-xs text-destructive">{errText("location")}</p> : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>
              Commercial title {requiredMark}
            </Label>
            <Input
              value={values.tradeTitle}
              disabled={disabled || isEditing}
              onChange={(e) => onChange({ tradeTitle: e.target.value })}
              placeholder="e.g. Fresh produce"
            />
            {errText("tradeTitle") ? <p className="text-xs text-destructive">{errText("tradeTitle")}</p> : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>
              Lot story {requiredMark}
            </Label>
            <Textarea
              value={values.lotStory}
              disabled={disabled}
              onChange={(e) => onChange({ lotStory: e.target.value })}
              className="min-h-[90px]"
              placeholder="e.g. Packed and sealed for traceability."
            />
            {errText("lotStory") ? <p className="text-xs text-destructive">{errText("lotStory")}</p> : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>
              Owners {requiredMark}
            </Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                value={ownerInput}
                disabled={disabled || ownersLocked}
                onChange={(e) => onChangeOwnerInput(e.target.value)}
                placeholder="Enter address"
                className="sm:col-span-2 font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                disabled={disabled || ownersLocked || !ownerInput.trim()}
                onClick={onAddOwner}
                size="icon"
                aria-label="Add owner"
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <div className="space-y-1 rounded-md border p-2">
              {owners.length === 0 ? (
                <div className="text-xs text-muted-foreground">No owners yet.</div>
              ) : (
                owners.map((a, idx) => {
                  const isCreator =
                    Boolean(String(identityAddress || "").trim()) &&
                    String(a || "").trim() === String(identityAddress || "").trim();
                  return (
                    <div key={a} className="flex items-center justify-between gap-2">
                      <div className="min-w-0 font-mono text-xs break-all" title={a}>
                        {idx + 1}. {shortUnit(a, { head: 14, tail: 6, min: 22 })}
                        {isCreator ? " (creator)" : ""}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={disabled || ownersLocked || isCreator}
                        onClick={() => onRemoveOwner(a)}
                        aria-label="Remove owner"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
            {errText("owners") ? <p className="text-xs text-destructive">{errText("owners")}</p> : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>
              Roadmap {requiredMark}
            </Label>
            {roadmapSteps.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                Auto-built from owner locations
              </div>
            ) : (
              <div className="w-full overflow-x-auto custom-scrollbar">
                <div className="flex min-w-max items-center gap-2 text-xs">
                  {roadmapSteps.map((step, idx) => (
                    <React.Fragment key={`${idx}-${step}`}>
                      <span className="whitespace-nowrap">{step}</span>
                      {idx < roadmapSteps.length - 1 ? (
                        <span className="text-muted-foreground">→</span>
                      ) : null}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
            {errText("roadmap") ? <p className="text-xs text-destructive">{errText("roadmap")}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>
              Container type {requiredMark}
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={disabled}
              value={values.containerType}
              onChange={(e) => onChange({ containerType: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="Carton">Carton</option>
              <option value="Pallet box">Pallet box</option>
              <option value="Plastic container">Plastic container</option>
            </select>
            {errText("containerType") ? <p className="text-xs text-destructive">{errText("containerType")}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>
              Max capacity (weight) {requiredMark}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={values.maxWeightValue}
                disabled={disabled}
                onChange={(e) =>
                  onChange({ maxWeightValue: sanitizeDecimalInput(e.target.value) })
                }
                placeholder="e.g. 25"
                min="0"
                step="any"
                inputMode="decimal"
              />
              <Input
                value={values.maxWeightUnit}
                disabled={disabled}
                onChange={(e) => onChange({ maxWeightUnit: e.target.value })}
                placeholder="e.g. kg"
              />
            </div>
            {errText("maxWeightValue") ? <p className="text-xs text-destructive">{errText("maxWeightValue")}</p> : null}
            {errText("maxWeightUnit") ? <p className="text-xs text-destructive">{errText("maxWeightUnit")}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>
              Max capacity (volume) {requiredMark}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={values.maxVolumeValue}
                disabled={disabled}
                onChange={(e) =>
                  onChange({ maxVolumeValue: sanitizeDecimalInput(e.target.value) })
                }
                placeholder="e.g. 60"
                min="0"
                step="any"
                inputMode="decimal"
              />
              <Input
                value={values.maxVolumeUnit}
                disabled={disabled}
                onChange={(e) => onChange({ maxVolumeUnit: e.target.value })}
                placeholder="e.g. L"
              />
            </div>
            {errText("maxVolumeValue") ? <p className="text-xs text-destructive">{errText("maxVolumeValue")}</p> : null}
            {errText("maxVolumeUnit") ? <p className="text-xs text-destructive">{errText("maxVolumeUnit")}</p> : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>
              Image {requiredMark}
            </Label>
            <CameraCaptureInput
              disabled={!canOpenCamera}
              previewName={
                values.imageName ||
                (existingImageIpfs ? shortRef(existingImageIpfs) : "No file")
              }
              onCaptured={(file) => onPickImage(file)}
              openLabel="Open camera"
              captureLabel="Capture"
            />
            {errText("image") ? <p className="text-xs text-destructive">{errText("image")}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={onSave} disabled={disabled}>
                {disabled ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Save
              </Button>
              <Button variant="outline" onClick={onCancel} disabled={disabled}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onCancel} disabled={disabled}>
              {disabled ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

