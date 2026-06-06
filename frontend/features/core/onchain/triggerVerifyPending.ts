export async function triggerVerifyPending(
  httpClient: (url: string, options?: any) => Promise<unknown>,
  backendUrl: string,
  txHashes?: string | string[],
) {
  const hashes = Array.from(
    new Set(
      (Array.isArray(txHashes) ? txHashes : [txHashes])
        .map((x) => String(x || "").trim())
        .filter(Boolean),
    ),
  );
  try {
    await httpClient(`${backendUrl}/record-operations/verify-pending`, {
      method: "POST",
      body: JSON.stringify(hashes.length ? { txHashes: hashes } : {}),
    });
  } catch {}
}
