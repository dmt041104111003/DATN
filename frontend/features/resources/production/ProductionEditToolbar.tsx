"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import {
  DeleteButton,
  SaveButton,
  Toolbar,
  useSaveContext,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { type ProductionStatus } from "./constants";

export function ProductionEditToolbar() {
  const {
    setValue,
    getValues,
    formState: { dirtyFields },
  } = useFormContext();
  const { save } = useSaveContext();
  const status =
    (useWatch({ name: "status" }) as ProductionStatus | undefined) ?? "CREATED";
  const verified = Boolean(useWatch({ name: "verified" }));
  const seedingDate = String(useWatch({ name: "seedingDate" }) ?? "");
  const [harvestModalOpen, setHarvestModalOpen] = React.useState(false);
  const [harvestInput, setHarvestInput] = React.useState("");
  const [actualYieldInput, setActualYieldInput] = React.useState("");
  const [harvestError, setHarvestError] = React.useState("");

  const dirtyMap = (dirtyFields || {}) as Record<string, unknown>;
  const dirtyKeys = Object.keys(dirtyMap);
  const excludedDirtyKeys = new Set([
    "harvestDate",
    "actualYieldKg",
    "status",
    "verified",
    "verifiedAt",
    "id",
    "inventoryKey",
    "traceSchemeRef",
    "code",
    "createdAt",
    "updatedAt",
  ]);
  const isClosed = status === "CLOSED";
  const hasNonHarvestChanges = dirtyKeys.some((key) => !excludedDirtyKeys.has(key));
  const canUpdate = !isClosed && verified && hasNonHarvestChanges;
  const canHarvest = !isClosed && verified && !canUpdate;

  return (
    <>
      <Toolbar>
        {!isClosed ? (
          <SaveButton
            label="Cập nhật thông tin"
            disabled={!canUpdate}
            onClick={() => setValue("status", "UPDATED")}
          />
        ) : null}
        {!isClosed ? (
          <Button
            variant="contained"
            disableElevation
            type="button"
            disabled={!canHarvest}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setHarvestInput("");
              setActualYieldInput("");
              setHarvestError("");
              setHarvestModalOpen(true);
            }}
          >
            Xác nhận thu hoạch
          </Button>
        ) : null}
        {!isClosed ? <DeleteButton mutationMode="pessimistic" redirect="list" color="error" /> : null}
      </Toolbar>
      {!isClosed && harvestModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded bg-white p-4">
            <h4 className="mb-3 text-base font-semibold">Xác nhận thu hoạch</h4>
            <label className="mb-2 block text-sm">Ngày thu hoạch *</label>
            <input
              type="date"
              className="w-full rounded border px-3 py-2"
              value={harvestInput}
              onChange={(e) => setHarvestInput(e.target.value)}
            />
            <label className="mb-2 mt-3 block text-sm">Sản lượng thực tế (kg) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded border px-3 py-2"
              value={actualYieldInput}
              onChange={(e) => setActualYieldInput(e.target.value)}
            />
            {harvestError ? (
              <p className="mt-2 text-sm text-red-600">{harvestError}</p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded border px-3 py-1.5"
                onClick={() => setHarvestModalOpen(false)}
              >
                Hủy
              </button>
              <Button
                variant="contained"
                disableElevation
                type="button"
                onClick={(e) => {
                  const harvest = harvestInput ? new Date(harvestInput) : null;
                  const seed = seedingDate ? new Date(seedingDate) : null;
                  if (!harvest || Number.isNaN(harvest.getTime())) {
                    e.preventDefault();
                    setHarvestError("Vui lòng nhập ngày thu hoạch.");
                    return;
                  }
                  if (!seed || Number.isNaN(seed.getTime())) {
                    e.preventDefault();
                    setHarvestError("Không tìm thấy ngày gieo trồng.");
                    return;
                  }
                  if (harvest.getTime() <= seed.getTime()) {
                    e.preventDefault();
                    setHarvestError("Ngày thu hoạch phải lớn hơn ngày gieo trồng.");
                    return;
                  }
                  const actualYield = Number(String(actualYieldInput ?? "").trim());
                  if (
                    String(actualYieldInput ?? "").trim() === "" ||
                    !Number.isFinite(actualYield) ||
                    actualYield <= 0
                  ) {
                    e.preventDefault();
                    setHarvestError("Sản lượng thực tế phải lớn hơn 0.");
                    return;
                  }
                  const nextValues = {
                    ...getValues(),
                    harvestDate: harvestInput,
                    actualYieldKg: String(actualYieldInput).trim(),
                    status: "CLOSED",
                  };
                  setValue("harvestDate", harvestInput, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("actualYieldKg", String(actualYieldInput).trim(), {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("status", "CLOSED", { shouldDirty: true, shouldValidate: true });
                  setHarvestModalOpen(false);
                  save?.(nextValues);
                }}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

