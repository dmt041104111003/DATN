"use client";

import * as React from "react";
import { useRefresh } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { entityKeyFieldFor, type EntityVerifyType } from "./entityVerification";

const POLL_MS = 800;

export function useEntityVerificationPoll(entityType: EntityVerifyType) {
  const keyField = entityKeyFieldFor(entityType);
  const verified = Boolean(useWatch({ name: "verified" }));
  const entityKey = cleanString(useWatch({ name: keyField }));
  const txHash = cleanString(useWatch({ name: "txHash" }));
  const { setValue } = useFormContext();
  const refresh = useRefresh();

  React.useEffect(() => {
    if (verified || !entityKey) return undefined;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
    let cancelled = false;

    const tick = async () => {
      try {
        await fetch(`${backendUrl}/record-operations/verify-pending`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(txHash ? { txHashes: [txHash] } : {}),
        });
        const statusRes = await fetch(
          `${backendUrl}/record-operations/verification-status?entityType=${encodeURIComponent(entityType)}&entityKeys=${encodeURIComponent(entityKey)}`,
          { credentials: "include", cache: "no-store" },
        );
        if (!statusRes.ok) return;
        const status = (await statusRes.json()) as Record<string, boolean>;
        if (cancelled || !status[entityKey]) return;
        setValue("verified", true, { shouldDirty: false, shouldValidate: false });
        refresh();
      } catch {}
    };

    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [entityKey, entityType, keyField, refresh, setValue, txHash, verified]);
}
