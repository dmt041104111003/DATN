import { saveContractUnsignedTx } from "@/features/core/onchain/contract/saveContractUnsignedTx";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";

export async function updateContainerOnchain(params: any, deps: any) {
  if (Boolean((params.previousData as any)?.storageLocked)) {
    throw new Error("Container đã có lịch sử nhập/xuất kho nên không được phép cập nhật hoặc xóa.");
  }
  const { owner } = await deps.getSessionOwner();
  const inventoryKey = String(
    params.data?.inventoryKey || params.previousData?.inventoryKey || params.id || "",
  ).trim();
  if (!inventoryKey) throw new Error("inventoryKey is required.");
  const base = params.previousData || {};
  const merged = { ...base, ...(params.data || {}) };
  const owners = deps.buildOwnerList(merged, owner);
  const metadata = deps.buildContainerMetadata(merged, base);
  const unsigned = await saveContractUnsignedTx(
    deps.httpClient,
    deps.BACKEND_URL,
    { owners, inventoryKey, metadata },
    "Failed to prepare container save transaction.",
  );
  const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
  const patchRes = await deps.httpClient(`${deps.BACKEND_URL}/container/${encodeURIComponent(inventoryKey)}`, {
    method: "PATCH",
    body: JSON.stringify({ ...params.data, txHash }),
  });
  const row = patchRes.json as any;
  return { data: { ...row, id: deps.normalizeId(row, params.id) } };
}
