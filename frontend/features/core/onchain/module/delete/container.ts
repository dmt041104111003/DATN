import { burnContractUnsignedTx } from "@/features/core/onchain/contract/burnContractUnsignedTx";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";

export async function deleteContainerOnchain(params: any, deps: any) {
  if (Boolean((params.previousData as any)?.storageLocked)) {
    throw new Error("Thùng hàng đã có lịch sử nhập/xuất kho nên không được phép cập nhật hoặc xóa.");
  }
  const { owner } = await deps.getSessionOwner();
  const base = params.previousData || {};
  const inventoryKey = String((base as any)?.inventoryKey ?? params.id ?? "").trim();
  if (!inventoryKey) throw new Error("inventoryKey is required.");
  const owners = deps.buildOwnerList(base, owner);
  const unsigned = await burnContractUnsignedTx(
    deps.httpClient,
    deps.BACKEND_URL,
    { owners, productionInventoryKeys: [inventoryKey] },
    "Failed to prepare container burn transaction.",
  );
  const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
  const { json } = await deps.httpClient(`${deps.BACKEND_URL}/container/${encodeURIComponent(inventoryKey)}`, {
    method: "DELETE",
    body: JSON.stringify({ txHash }),
  });
  const row = json as any;
  return { data: { ...row, id: deps.normalizeId(params.previousData, params.id) } };
}
