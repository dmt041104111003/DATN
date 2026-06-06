import { saveContractUnsignedTx } from "@/features/core/onchain/contract/saveContractUnsignedTx";
import { triggerVerifyPending } from "@/features/core/onchain/triggerVerifyPending";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";
import { signerContextToApiBody, signerContextToMetadata } from "@/features/core/onchain/signerContext";
import { formatProductionRefInline } from "@/features/core/metadata/share/formatProductionRefInline";

export async function createWarehouseStorageOnchain(params: any, deps: any) {
  const { owner } = await deps.getSessionOwner();
  let containerInventoryKey = deps.cleanString(
    params.data?.containerInventoryKey ||
      params.data?.productId ||
      params.previousData?.containerInventoryKey ||
      params.previousData?.productId,
  );
  if (!containerInventoryKey) {
    const storageId = deps.cleanString(params.id);
    if (storageId) {
      const storageRes = await deps.httpClient(`${deps.BACKEND_URL}/warehouse-storage`, { method: "GET" });
      const storageRows = Array.isArray(storageRes?.json) ? storageRes.json : [];
      const storageRow = storageRows.find((x: any) => deps.cleanString(x?.id) === storageId) || null;
      containerInventoryKey = deps.cleanString(storageRow?.containerInventoryKey || storageRow?.productId);
    }
  }
  if (!containerInventoryKey) throw new Error("containerInventoryKey is required.");
  const containerRes = await deps.httpClient(`${deps.BACKEND_URL}/container`, { method: "GET" });
  const containerRows = Array.isArray(containerRes?.json) ? containerRes.json : [];
  const containerRow =
    containerRows.find((x: any) => deps.cleanString(x?.inventoryKey) === containerInventoryKey) || null;
  const currentStorageId = deps.cleanString(params.id || params.previousData?.id);
  if (Boolean(containerRow?.inStorage) && !currentStorageId) {
    throw new Error("Thùng hàng đang ở trong kho lưu trữ, cần xuất kho trước khi nhập kho mới.");
  }
  const containerStatus = deps.cleanString(containerRow?.status).toUpperCase();
  if (containerStatus === "CONSUMED") throw new Error("Thùng hàng đã tiêu thụ, không thể nhập kho lại.");
  const createPayload: any = { ...(params.data as any) };
  const owners = deps.buildOwnerList(containerRow || createPayload, owner);
  const inventoryKey = containerInventoryKey;
  const warehouseId = createPayload?.warehouseId || params.previousData?.warehouseId;
  const signer = await deps.resolveSignerContext(deps, { warehouseId });
  const storageOp = currentStorageId ? "UPDATE" : "IN";
  const metadata = {
    ...deps.buildMappedMetadata({
      status: "UPDATE",
      storage_op: storageOp,
      warehouse_id: warehouseId,
      container_ref_inline: formatProductionRefInline(containerInventoryKey),
      storage_created_at: deps.cleanString(createPayload?.createdAt) || new Date().toISOString(),
      storage_updated_at: new Date().toISOString(),
      storage_conditions: createPayload?.conditions,
      ...signerContextToMetadata(signer),
    }),
  };
  const signerBody = { ...signerContextToApiBody(signer), storageOp };
  const unsigned = await saveContractUnsignedTx(
    deps.httpClient,
    deps.BACKEND_URL,
    { owners, inventoryKey, metadata },
    "Failed to prepare warehouse storage on-chain update.",
  );
  const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
  if (currentStorageId) {
    const patchRes = await deps.httpClient(
      `${deps.BACKEND_URL}/warehouse-storage/${encodeURIComponent(currentStorageId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ ...createPayload, txHash, containerInventoryKey, ...signerBody }),
      },
    );
    await triggerVerifyPending(deps.httpClient, deps.BACKEND_URL, txHash);
    const row = patchRes.json as any;
    return { data: { ...row, id: deps.normalizeId(row, params.id) } };
  }
  const created = await deps.baseProvider.create("warehouse-storage", {
    ...params,
    data: { ...createPayload, txHash, containerInventoryKey, ...signerBody },
  });
  await triggerVerifyPending(deps.httpClient, deps.BACKEND_URL, txHash);
  return created;
}
