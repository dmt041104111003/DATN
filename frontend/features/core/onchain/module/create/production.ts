import { createContractUnsignedTx } from "@/features/core/onchain/contract/createContractUnsignedTx";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";

export async function createProductionOnchain(params: any, deps: any) {
  const { owner } = await deps.getSessionOwner();
  const certFiles = deps.pickRawFiles((params.data as any)?.certFiles);
  const evidenceFiles = deps.pickRawFiles((params.data as any)?.evidenceFiles);
  const certFilesIpfs = await deps.uploadMany(certFiles);
  const evidenceFilesIpfs = await deps.uploadMany(evidenceFiles);
  const owners = deps.buildOwnerList(owner);
  const metadata = deps.buildProductionMetadata(params.data, null, certFilesIpfs, evidenceFilesIpfs, owners);

  const unsigned = await createContractUnsignedTx(
    deps.httpClient,
    deps.BACKEND_URL,
    {
      owners,
      assetName: String(params.data?.assetName || params.data?.code || "").trim(),
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
      certFiles: certFilesIpfs,
      evidenceFiles: evidenceFilesIpfs,
    }),
  });
  const row = dbRes.json as any;
  return { data: { ...row, id: deps.normalizeId(row, String(unsigned.inventoryKey || txHash)) } };
}
