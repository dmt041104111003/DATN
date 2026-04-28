import { burnContractUnsignedTx } from "@/features/core/onchain/contract/burnContractUnsignedTx";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";

export async function deleteProductionOnchain(params: any, deps: any) {
  const { owner } = await deps.getSessionOwner();
  const owners = deps.buildOwnerList(owner);
  const inventoryKey = String((params.previousData as any)?.inventoryKey ?? params.id ?? "").trim();
  if (!inventoryKey) throw new Error("inventoryKey is required.");
  const unsigned = await burnContractUnsignedTx(
    deps.httpClient,
    deps.BACKEND_URL,
    { owners, productionInventoryKeys: [inventoryKey] },
    "Failed to prepare production burn transaction.",
  );
  const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
  const { json } = await deps.httpClient(`${deps.BACKEND_URL}/production/${encodeURIComponent(inventoryKey)}`, {
    method: "DELETE",
    body: JSON.stringify({ txHash }),
  });
  const row = json as any;
  return { data: { ...row, id: deps.normalizeId(params.previousData, params.id) } };
}
