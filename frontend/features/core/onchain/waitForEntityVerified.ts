const VERIFY_POLL_MS = 600;
const VERIFY_TIMEOUT_MS = 180_000;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

import type { EntityVerifyType } from "@/features/resources/shared/entityVerification";

type WaitOptions = {
  entityType: EntityVerifyType;
  entityKeys: string[];
  txHashes?: string[];
};

async function fetchVerificationStatus(
  httpClient: (url: string, options?: any) => Promise<{ json: any }>,
  backendUrl: string,
  entityType: string,
  entityKeys: string[],
) {
  const keys = entityKeys.map((x) => encodeURIComponent(x)).join(",");
  const res = await httpClient(
    `${backendUrl}/record-operations/verification-status?entityType=${encodeURIComponent(entityType)}&entityKeys=${keys}`,
    { method: "GET" },
  );
  return (res.json || {}) as Record<string, boolean>;
}

export async function waitForEntityVerified(
  httpClient: (url: string, options?: any) => Promise<{ json: any }>,
  backendUrl: string,
  options: WaitOptions,
) {
  const entityKeys = options.entityKeys.map((x) => String(x || "").trim()).filter(Boolean);
  if (!entityKeys.length) return;

  const txHashes = Array.from(
    new Set((options.txHashes || []).map((x) => String(x || "").trim()).filter(Boolean)),
  );

  const deadline = Date.now() + VERIFY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      await httpClient(`${backendUrl}/record-operations/verify-pending`, {
        method: "POST",
        body: JSON.stringify(txHashes.length ? { txHashes } : {}),
      });
    } catch {}

    const status = await fetchVerificationStatus(
      httpClient,
      backendUrl,
      options.entityType,
      entityKeys,
    );
    const allVerified = entityKeys.every((key) => Boolean(status[key]));
    if (allVerified) return;

    await sleep(VERIFY_POLL_MS);
  }

  throw new Error("Hết thời gian chờ xác thực on-chain. Vui lòng thử lại sau.");
}
