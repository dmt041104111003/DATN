"use client";

import * as React from "react";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { entityKeyFieldFor, type EntityVerifyType } from "./entityVerification";

const POLL_MS = 800;

async function fetchVerificationStatus(
  backendUrl: string,
  entityType: EntityVerifyType,
  entityKeys: string[],
) {
  const keys = entityKeys.map((x) => encodeURIComponent(x)).join(",");
  const res = await fetch(
    `${backendUrl}/record-operations/verification-status?entityType=${encodeURIComponent(entityType)}&entityKeys=${keys}`,
    { credentials: "include", cache: "no-store" },
  );
  if (!res.ok) return null;
  return (await res.json()) as Record<string, boolean>;
}

export function useListVerificationPoll(
  entityType: EntityVerifyType,
  rows: any[] | undefined,
  refetch: () => void | Promise<unknown>,
) {
  const keyField = entityKeyFieldFor(entityType);

  React.useEffect(() => {
    const pendingRows = (rows || []).filter((row) => !Boolean(row?.verified));
    if (!pendingRows.length) return undefined;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
    let cancelled = false;

    const tick = async () => {
      const entityKeys = pendingRows
        .map((row) => cleanString(row?.[keyField]))
        .filter(Boolean);
      if (!entityKeys.length) return;

      const txHashes = Array.from(
        new Set(pendingRows.map((row) => cleanString(row?.txHash)).filter(Boolean)),
      );

      try {
        await fetch(`${backendUrl}/record-operations/verify-pending`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(txHashes.length ? { txHashes } : {}),
        });
        const status = await fetchVerificationStatus(backendUrl, entityType, entityKeys);
        if (cancelled || !status) return;
        const anyVerified = entityKeys.some((key) => Boolean(status[key]));
        if (anyVerified) await refetch();
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
  }, [entityType, keyField, refetch, rows]);
}
