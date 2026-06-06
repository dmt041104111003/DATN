"use client";

import * as React from "react";
import { useRecordContext } from "react-admin";
import { useFormContext } from "react-hook-form";
import { cleanString } from "@/features/core/metadata/share/cleanString";
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

export function ProductionFacilityAutofill() {
  const record = useRecordContext();
  const { setValue } = useFormContext();
  const isCreate = !cleanString(record?.inventoryKey);

  React.useEffect(() => {
    if (!isCreate) return undefined;

    let cancelled = false;
    void fetchMyProfile()
      .then(async (profile) => {
        if (cancelled || !profile) return;

        const name = cleanString(profile?.displayName);
        if (name) {
          setValue("facilityId", name, { shouldDirty: false, shouldValidate: true });
        }

        const locationKey = cleanString(profile?.location);
        if (!locationKey) return;

        const ids = await resolveWarehouseLocationIds(locationKey);
        if (cancelled) return;

        if (ids.warehouseProvinceId) {
          setValue("productionProvinceId", ids.warehouseProvinceId, {
            shouldDirty: false,
            shouldValidate: true,
          });
        }
        if (ids.warehouseDistrictId) {
          setValue("productionDistrictId", ids.warehouseDistrictId, {
            shouldDirty: false,
            shouldValidate: true,
          });
        }
        if (ids.warehouseWardId) {
          setValue("productionWardId", ids.warehouseWardId, {
            shouldDirty: false,
            shouldValidate: true,
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isCreate, setValue]);

  return null;
}
