"use client";

import * as React from "react";
import { useGetList, useRecordContext } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { EMPTY_PARTICIPANT_ROW } from "@/features/resources/shared/locationHelpers";
import { fetchCapacitySummary } from "@/features/resources/containers/fetchCapacitySummary";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export function useContainerFormSections() {
  const record = useRecordContext<any>();
  const { getValues, setValue } = useFormContext();
  const storageLocked = Boolean(record?.storageLocked);
  const productionInventoryKey = String(useWatch({ name: "productionInventoryKey" }) ?? "");
  const capacityKg = String(useWatch({ name: "capacityKg" }) ?? "");
  const [capacitySummary, setCapacitySummary] = React.useState<{ totalCapacityKg: number; usedCapacityKg: number; remainingCapacityKg: number } | null>(null);
  const { data: productionRows = [] } = useGetList("production", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "createdAt", order: "DESC" },
  });

  const actualCapacityValidator = (value: unknown) => {
    const rawValue = String(value ?? "").trim();
    const actual = Number(rawValue);
    const max = Number(capacityKg.trim());
    if (!rawValue) return undefined;
    if (!Number.isFinite(actual)) return undefined;
    if (!Number.isFinite(max)) return undefined;
    if (actual <= max) return undefined;
    return "Dung lượng thực tế phải nhỏ hơn hoặc bằng dung lượng chứa tối đa.";
  };

  React.useEffect(() => {
    const key = productionInventoryKey.trim();
    if (!key) {
      setCapacitySummary(null);
      return;
    }

    fetchCapacitySummary(key)
      .then((summary) => {
        setCapacitySummary(summary);
      })
      .catch(() => {
        setCapacitySummary(null);
      });
  }, [productionInventoryKey]);

  const productionChoices = [];

  for (let i = 0; i < productionRows.length; i += 1) {
    const row = productionRows[i];
    const status = String(row?.status || "").toUpperCase();
    if (status !== "CLOSED") {
      continue;
    }

    const inventoryKey = String(row?.inventoryKey || row?.id || "");
    const code = String(row?.code || "");

    productionChoices.push({
      id: inventoryKey,
      name: `${code} - ${inventoryKey.slice(0, 16)}...`,
    });
  }

  React.useEffect(() => {
    fetch(`${BACKEND_URL}/auth/me`, { method: "GET", credentials: "include" })
      .then((response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((meJson) => {
        if (!meJson) return;

        let creatorWallet = "";
        const user = meJson.user;
        if (user) {
          creatorWallet = cleanString(user.paymentAddress);
          if (!creatorWallet) creatorWallet = cleanString(user.walletAddress);
          if (!creatorWallet) creatorWallet = cleanString(user.sub);
        }
        if (!creatorWallet) return;

        const rows = Array.isArray(getValues("participantRows")) ? getValues("participantRows") : [];
        if (!rows.length) {
          setValue("participantRows", [{ ...EMPTY_PARTICIPANT_ROW, walletAddress: creatorWallet }], { shouldDirty: false, shouldValidate: false });
          return;
        }

        const firstRow = rows[0];
        if (firstRow && cleanString(firstRow.walletAddress)) return;

        rows[0] = { ...(firstRow || EMPTY_PARTICIPANT_ROW), walletAddress: creatorWallet };
        setValue("participantRows", rows, { shouldDirty: false, shouldValidate: false });
      })
      .catch(() => undefined);
  }, [getValues, setValue]);

  return { storageLocked, actualCapacityValidator, capacitySummary, productionChoices };
}
