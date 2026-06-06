import { saveContractUnsignedTx } from "@/features/core/onchain/contract/saveContractUnsignedTx";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";
import { triggerVerifyPending } from "@/features/core/onchain/triggerVerifyPending";
import { signerContextToApiBody } from "@/features/core/onchain/signerContext";
import { codesToLocationText } from "@/features/resources/shared/locationHelpers";
import { normalizeEvidenceFilesForForm } from "@/features/resources/shared/evidenceFiles";

export async function updateProductionOnchain(params: any, deps: any) {
  const { owner } = await deps.getSessionOwner();
  const inventoryKey = String(
    params.data?.inventoryKey || params.previousData?.inventoryKey || params.id || "",
  ).trim();
  if (!inventoryKey) throw new Error("inventoryKey is required.");
  const base = params.previousData || {};
  const mergedForMetadata = { ...base, ...(params.data || {}) };
  const locationText = await codesToLocationText(mergedForMetadata?.location);
  const mergedWithTextLocation = { ...mergedForMetadata, location: locationText };
  const signer = await deps.resolveSignerContext(deps, { location: locationText });

  const evidenceFiles = deps.pickRawFiles((params.data as any)?.newEvidenceFiles);
  const existingEvidenceFilesIpfs = deps.normalizeIpfsUriList(
    base?.evidenceFiles ?? base?.images,
  );
  const newEvidenceFilesIpfs = await deps.uploadMany(evidenceFiles);
  const evidenceFilesIpfs = Array.from(new Set([...existingEvidenceFilesIpfs, ...newEvidenceFilesIpfs]));
  const owners = deps.buildOwnerList(owner);
  const metadata = deps.buildProductionMetadataPatch(
    mergedWithTextLocation,
    base,
    newEvidenceFilesIpfs,
    owners,
    signer,
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
      evidenceFiles: evidenceFilesIpfs,
      ...signerContextToApiBody(signer),
    }),
  });
  await triggerVerifyPending(deps.httpClient, deps.BACKEND_URL, txHash);
  const row = patchRes.json as any;
  const evidenceFileRecords = normalizeEvidenceFilesForForm(row?.evidenceFiles ?? row?.images);
  return {
    data: {
      ...row,
      evidenceFiles: evidenceFileRecords,
      images: evidenceFileRecords.map((f: { src: string }) => f.src),
      id: deps.normalizeId(row, params.id),
    },
  };
}
