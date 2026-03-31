"use client";
import * as React from "react";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CameraCaptureInput } from "@/components/CameraCaptureInput";
import { shortUnit } from "@/lib/short-unit";

export type GrowingAreaFormValues = {
  name: string;
  location: string;
  areaSizeValue: string;
  areaSizeUnit: string;
  soilType: string;
};

export type GrowingAreaFormProps = {
  ownersText: string;
  values: GrowingAreaFormValues;
  disabled: boolean;
  error: string;
  fieldErrors?: Partial<Record<keyof GrowingAreaFormValues | "ownersText" | "nftImage", string>>;
  txHash: string;
  nftImageName: string;
  onPickNftImage: (file: File | null) => void;
  onChange: (patch: Partial<GrowingAreaFormValues>) => void;
  onCreate: () => void;
  onCancel: () => void;
};

export function GrowingAreaForm({
  ownersText,
  values,
  disabled,
  error,
  fieldErrors,
  txHash,
  nftImageName,
  onPickNftImage,
  onChange,
  onCreate,
  onCancel,
}: GrowingAreaFormProps) {
  const requiredMark = <span className="text-red-500">*</span>;
  const shortText = (s: string) => {
    const t = String(s ?? "").trim();
    return t ? shortUnit(t, { head: 18, tail: 4, min: 22 }) : "";
  };
  const errText = (key: keyof GrowingAreaFormValues | "ownersText") =>
    String((fieldErrors as any)?.[key] || "").trim();
  const errNft = String((fieldErrors as any)?.nftImage || "").trim();

  const canOpenCamera = React.useMemo(() => {
    if (disabled) return false;
    const ownersOk = String(ownersText || "").trim();
    const nameOk = String(values.name || "").trim();
    const locOk = String(values.location || "").trim();
    const sizeValueOk = String(values.areaSizeValue || "").trim();
    const sizeUnitOk = String(values.areaSizeUnit || "").trim();
    const soilOk = String(values.soilType || "").trim();
    return Boolean(ownersOk && nameOk && locOk && sizeValueOk && sizeUnitOk && soilOk);
  }, [
    disabled,
    ownersText,
    values.location,
    values.name,
    values.areaSizeValue,
    values.areaSizeUnit,
    values.soilType,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growing area</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Owners {requiredMark}
            </Label>
            <Input value={ownersText} disabled />
            {errText("ownersText") ? (
              <p className="text-xs text-destructive">{errText("ownersText")}</p>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>
              Name {requiredMark}
            </Label>
            <Input
              value={values.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Growing area name"
              disabled={disabled}
            />
            {errText("name") ? (
              <p className="text-xs text-destructive">{errText("name")}</p>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>
              Location {requiredMark}
            </Label>
            <Input
              value={values.location}
              placeholder="Province, district, site"
              disabled
            />
            {errText("location") ? (
              <p className="text-xs text-destructive">{errText("location")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>
              Area size {requiredMark}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={values.areaSizeValue}
                onChange={(e) => onChange({ areaSizeValue: e.target.value })}
                placeholder="e.g. 12"
                disabled={disabled}
                inputMode="decimal"
              />
              <Input
                value={values.areaSizeUnit}
                onChange={(e) => onChange({ areaSizeUnit: e.target.value })}
                placeholder="e.g. ha"
                disabled={disabled}
              />
            </div>
            {errText("areaSizeValue") ? (
              <p className="text-xs text-destructive">{errText("areaSizeValue")}</p>
            ) : null}
            {errText("areaSizeUnit") ? (
              <p className="text-xs text-destructive">{errText("areaSizeUnit")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>
              Soil type {requiredMark}
            </Label>
            <Input
              value={values.soilType}
              onChange={(e) => onChange({ soilType: e.target.value })}
              placeholder="e.g. alluvial"
              disabled={disabled}
            />
            {errText("soilType") ? (
              <p className="text-xs text-destructive">{errText("soilType")}</p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>
              Image {requiredMark}
            </Label>
            <CameraCaptureInput
              disabled={!canOpenCamera}
              previewName={shortText(nftImageName) || "No file"}
              onCaptured={(file) => onPickNftImage(file)}
              openLabel="Open camera"
              captureLabel="Capture"
            />
            {errNft ? <p className="text-xs text-destructive">{errNft}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onCancel} disabled={disabled}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

