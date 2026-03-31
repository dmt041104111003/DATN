"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type WarehouseFormProps = {
  code: string;
  name: string;
  saving: boolean;
  error: string;
  fieldErrors?: Partial<Record<"code" | "name" | "maxProducts", string>>;
  isEditing?: boolean;
  onCodeChange: (value: string) => void;
  onNameChange: (value: string) => void;
  maxProducts: string;
  onMaxProductsChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
};

export function WarehouseForm({
  code,
  name,
  saving,
  error,
  fieldErrors,
  isEditing = false,
  onCodeChange,
  onNameChange,
  maxProducts,
  onMaxProductsChange,
  onSubmit,
  onCancel,
}: WarehouseFormProps) {
  const requiredMark = <span className="text-red-500">*</span>;
  const errText = (k: "code" | "name" | "maxProducts") =>
    String((fieldErrors as any)?.[k] || "").trim();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Warehouse</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="wh-code">
                Facility reference {requiredMark}
              </Label>
              <Input
                id="wh-code"
                type="text"
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                disabled
                readOnly
                placeholder="WH-001"
              />
              {errText("code") ? (
                <p className="text-xs text-destructive">{errText("code")}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-name">
                Name {requiredMark}
              </Label>
              <Input
                id="wh-name"
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                disabled={saving}
                placeholder="Main warehouse"
              />
              {errText("name") ? (
                <p className="text-xs text-destructive">{errText("name")}</p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="wh-max">
                Maximum staged lots {requiredMark}
              </Label>
              <Input
                id="wh-max"
                type="number"
                min={1}
                value={maxProducts}
                onChange={(e) => onMaxProductsChange(e.target.value)}
                disabled={saving}
                placeholder="e.g. 100"
              />
              {errText("maxProducts") ? (
                <p className="text-xs text-destructive">
                  {errText("maxProducts")}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-2 flex flex-wrap items-center gap-2 border-t pt-4">
          <Button
            type="submit"
            className="inline-flex items-center gap-2"
            disabled={saving || !code.trim() || !name.trim()}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? "Saving…" : isEditing ? "Save" : "Add"}
          </Button>
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onCancel()}
            >
              {isEditing ? "Cancel" : "Clear"}
            </Button>
          ) : null}
        </CardFooter>
      </form>
    </Card>
  );
}
