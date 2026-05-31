"use client";

import * as React from "react";
import { useRecordContext } from "react-admin";
import { useFormContext } from "react-hook-form";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { resolveWarehouseLocationIds } from "./warehouseLocation";
import { WarehouseFormFields } from "./WarehouseFormFields";

export function WarehouseLocationHydrate() {
  const record = useRecordContext();
  const { reset } = useFormContext();
  const recordId = cleanString(record?.id);

  React.useEffect(() => {
    const locationKey = cleanString(record?.location);
    if (!recordId || !locationKey) return;

    let cancelled = false;
    resolveWarehouseLocationIds(locationKey).then((ids) => {
      if (cancelled) return;
      reset({ ...(record as Record<string, unknown>), ...ids });
    });

    return () => {
      cancelled = true;
    };
  }, [recordId, record, reset]);

  return <WarehouseFormFields showWarehouseId />;
}
