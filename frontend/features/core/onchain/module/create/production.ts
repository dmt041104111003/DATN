import { createContractUnsignedTx } from "@/features/core/onchain/contract/createContractUnsignedTx";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";
import { triggerVerifyPending } from "@/features/core/onchain/triggerVerifyPending";
import { signerContextToApiBody } from "@/features/core/onchain/signerContext";
import { codesToLocationText } from "@/features/resources/shared/locationHelpers";
import { normalizeEvidenceFilesForForm } from "@/features/resources/shared/evidenceFiles";

export async function createProductionOnchain(params: any, deps: any) {
  const { owner } = await deps.getSessionOwner();
  const locationText = await codesToLocationText(params.data?.location);
  const signer = await deps.resolveSignerContext(deps, { location: locationText });
  const evidenceFiles = deps.pickRawFiles(
    (params.data as any)?.newEvidenceFiles ?? (params.data as any)?.evidenceFiles,
  );
  const evidenceFilesIpfs = await deps.uploadMany(evidenceFiles);
  const owners = deps.buildOwnerList(owner);
  const metadata = deps.buildProductionMetadata(
    { ...params.data, location: locationText },
    null,
    evidenceFilesIpfs,
    owners,
    signer,
  );

  const unsigned = await createContractUnsignedTx(
    deps.httpClient,
    deps.BACKEND_URL,
    {
      owners,
      assetName: String(params.data?.code || "").trim(),
      metadata,
    },
    "Failed to prepare production on-chain transaction.",
  );
  const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
  const dbRes = await deps.httpClient(`${deps.BACKEND_URL}/production`, {
    method: "POST",
    body: JSON.stringify({
      ...params.data,
      traceSchemeRef: String(unsigned.traceSchemeRef || "").trim(),
      inventoryKey: String(unsigned.inventoryKey || "").trim(),
      txHash,
      evidenceFiles: evidenceFilesIpfs,
      ...signerContextToApiBody(signer),
    }),
  });
  const inventoryKey = String(unsigned.inventoryKey || "").trim();
  await triggerVerifyPending(deps.httpClient, deps.BACKEND_URL, txHash);

  const row = dbRes.json as any;
  const evidenceFileRecords = normalizeEvidenceFilesForForm(row?.evidenceFiles ?? row?.images);
  return {
    data: {
      ...row,
      evidenceFiles: evidenceFileRecords,
      images: evidenceFileRecords.map((f: { src: string }) => f.src),
      id: deps.normalizeId(row, String(inventoryKey || txHash)),
    },
  };
}
