"use client";

import * as React from "react";
import { useGetList, useRecordContext } from "react-admin";
import { useFormContext } from "react-hook-form";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { EMPTY_PARTICIPANT_ROW } from "@/features/resources/shared/locationHelpers";
import { resolveWarehouseLocationIds } from "@/features/resources/warehouses/warehouseLocation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

async function fetchMyProfile() {
  const res = await fetch(`${BACKEND_URL}/profile`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

export function useContainerFormSections() {
  const record = useRecordContext<any>();
  const { getValues, setValue } = useFormContext();
  const storageLocked = Boolean(record?.storageLocked);
  const creatorRowLocked = !cleanString(record?.inventoryKey);
  const { data: productionRows = [] } = useGetList("production", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "createdAt", order: "DESC" },
  });

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
    if (!creatorRowLocked) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        const meRes = await fetch(`${BACKEND_URL}/auth/me`, { method: "GET", credentials: "include" });
        if (!meRes.ok) return;
        const meJson = await meRes.json();
        const user = meJson?.user;
        let creatorWallet = cleanString(user?.paymentAddress);
        if (!creatorWallet) creatorWallet = cleanString(user?.walletAddress);
        if (!creatorWallet) creatorWallet = cleanString(user?.sub);
        if (!creatorWallet) return;

        const profile = await fetchMyProfile();
        const locationKey = cleanString(profile?.location);
        const ids = locationKey ? await resolveWarehouseLocationIds(locationKey) : null;

        if (cancelled) return;

        const rows = Array.isArray(getValues("participantRows")) ? getValues("participantRows") : [];
        const firstRow = { ...(rows[0] || EMPTY_PARTICIPANT_ROW) };
        const hasWallet = Boolean(cleanString(firstRow.walletAddress));
        const hasLocation =
          Boolean(cleanString(firstRow.provinceId)) &&
          Boolean(cleanString(firstRow.districtId)) &&
          Boolean(cleanString(firstRow.wardId));
        if (hasWallet && hasLocation) return;

        const creatorRow = {
          ...firstRow,
          walletAddress: creatorWallet,
          provinceId: cleanString(ids?.warehouseProvinceId) || cleanString(firstRow.provinceId),
          districtId: cleanString(ids?.warehouseDistrictId) || cleanString(firstRow.districtId),
          wardId: cleanString(ids?.warehouseWardId) || cleanString(firstRow.wardId),
        };

        const nextRows = rows.length ? [...rows] : [creatorRow];
        nextRows[0] = creatorRow;
        setValue("participantRows", nextRows, { shouldDirty: false, shouldValidate: false });
      } catch {}
    })();

    return () => {
      cancelled = true;
    };
  }, [creatorRowLocked, getValues, setValue]);

  return { storageLocked, productionChoices, creatorRowLocked };
}
