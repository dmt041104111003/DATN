import { createContractUnsignedTx } from "@/features/core/onchain/contract/createContractUnsignedTx";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";

export async function createProductionOnchain(params: any, deps: any) {
  const { owner } = await deps.getSessionOwner();
  const evidenceFiles = deps.pickRawFiles((params.data as any)?.evidenceFiles);
  const evidenceFilesIpfs = await deps.uploadMany(evidenceFiles);
  const owners = deps.buildOwnerList(owner);
  const metadata = deps.buildProductionMetadata(params.data, null, evidenceFilesIpfs, owners);

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
    }),
  });
  const row = dbRes.json as any;
  return { data: { ...row, id: deps.normalizeId(row, String(unsigned.inventoryKey || txHash)) } };
}
