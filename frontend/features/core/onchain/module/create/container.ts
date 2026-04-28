import { createContractUnsignedTx } from "@/features/core/onchain/contract/createContractUnsignedTx";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";

export async function createContainerOnchain(params: any, deps: any) {
  const { owner } = await deps.getSessionOwner();
  const owners = deps.buildOwnerList(params.data, owner);
  const metadata = deps.buildContainerMetadata(params.data, null);
  const unsigned = await createContractUnsignedTx(
    deps.httpClient,
    deps.BACKEND_URL,
    {
      owners,
      assetName: String(params.data?.code || "").trim(),
      metadata,
    },
    "Failed to prepare container on-chain transaction.",
  );
  const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
  const dbRes = await deps.httpClient(`${deps.BACKEND_URL}/container`, {
    method: "POST",
    body: JSON.stringify({
      ...params.data,
      traceSchemeRef: String(unsigned.traceSchemeRef || "").trim(),
      inventoryKey: String(unsigned.inventoryKey || "").trim(),
      txHash,
    }),
  });
  const row = dbRes.json as any;
  return { data: { ...row, id: deps.normalizeId(row, String(unsigned.inventoryKey || txHash)) } };
}
