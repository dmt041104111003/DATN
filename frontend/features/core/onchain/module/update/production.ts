import { saveContractUnsignedTx } from "@/features/core/onchain/contract/saveContractUnsignedTx";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";

export async function updateProductionOnchain(params: any, deps: any) {
  const { owner } = await deps.getSessionOwner();
  const inventoryKey = String(
    params.data?.inventoryKey || params.previousData?.inventoryKey || params.id || "",
  ).trim();
  if (!inventoryKey) throw new Error("inventoryKey is required.");
  const base = params.previousData || {};
  const mergedForMetadata = { ...base, ...(params.data || {}) };

  const certFiles = deps.pickRawFiles((params.data as any)?.certFiles);
  const evidenceFiles = deps.pickRawFiles((params.data as any)?.evidenceFiles);
  const existingCertFilesIpfs = deps.normalizeIpfsUriList(base?.certFiles);
  const existingEvidenceFilesIpfs = deps.normalizeIpfsUriList(base?.evidenceFiles);
  const newCertFilesIpfs = await deps.uploadMany(certFiles);
  const newEvidenceFilesIpfs = await deps.uploadMany(evidenceFiles);
  const certFilesIpfs = Array.from(new Set([...existingCertFilesIpfs, ...newCertFilesIpfs]));
  const evidenceFilesIpfs = Array.from(new Set([...existingEvidenceFilesIpfs, ...newEvidenceFilesIpfs]));
  const owners = deps.buildOwnerList(owner);
  const metadata = deps.buildProductionMetadataPatch(
    mergedForMetadata,
    base,
    newCertFilesIpfs,
    newEvidenceFilesIpfs,
    owners,
  );
  const unsigned = await saveContractUnsignedTx(
    deps.httpClient,
    deps.BACKEND_URL,
    { owners, inventoryKey, metadata },
    "Failed to prepare production save transaction.",
  );
  const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
  const patchRes = await deps.httpClient(`${deps.BACKEND_URL}/production/${encodeURIComponent(inventoryKey)}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...params.data,
      txHash,
      certFiles: certFilesIpfs,
      evidenceFiles: evidenceFilesIpfs,
    }),
  });
  const row = patchRes.json as any;
  return { data: { ...row, id: deps.normalizeId(row, params.id) } };
}
