const VERIFY_POLL_MS = 2000;
const VERIFY_TIMEOUT_MS = 600_000;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function waitForContainersVerified(
  httpClient: (url: string, options?: any) => Promise<{ json: any }>,
  backendUrl: string,
  inventoryKeys: string[],
) {
  const keys = inventoryKeys.map((x) => String(x || "").trim()).filter(Boolean);
  if (!keys.length) return;

  const deadline = Date.now() + VERIFY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      await httpClient(`${backendUrl}/record-operations/verify-pending`, { method: "POST" });
    } catch {}
    const res = await httpClient(`${backendUrl}/container`, { method: "GET" });
    const rows = Array.isArray(res.json) ? res.json : [];
    const allVerified = keys.every((key) => {
      const row = rows.find((item: any) => String(item?.inventoryKey || "").trim() === key);
      return Boolean(row?.verified);
    });
    if (allVerified) return;
    await sleep(VERIFY_POLL_MS);
  }

  throw new Error("Hết thời gian chờ xác thực on-chain. Vui lòng thử lại sau.");
}
