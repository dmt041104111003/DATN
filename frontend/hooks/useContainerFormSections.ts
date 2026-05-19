"use client";

import * as React from "react";
import { useGetList, useRecordContext } from "react-admin";
import { useFormContext } from "react-hook-form";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { EMPTY_PARTICIPANT_ROW } from "@/features/resources/shared/locationHelpers";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export function useContainerFormSections() {
  const record = useRecordContext<any>();
  const { getValues, setValue } = useFormContext();
  const storageLocked = Boolean(record?.storageLocked);
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

  return { storageLocked, productionChoices };
}
