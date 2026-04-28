import { saveContractUnsignedTx } from "@/features/core/onchain/contract/saveContractUnsignedTx";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";

export async function updateWarehouseStorageInOnchain(params: any, deps: any) {
  const { owner } = await deps.getSessionOwner();
  const containerInventoryKey = deps.cleanString(
    params.data?.containerInventoryKey ||
      params.data?.productId ||
      params.previousData?.containerInventoryKey ||
      params.previousData?.productId,
  );
  if (!containerInventoryKey) throw new Error("containerInventoryKey is required.");
  const containerRes = await deps.httpClient(`${deps.BACKEND_URL}/container`, { method: "GET" });
  const containerRows = Array.isArray(containerRes?.json) ? containerRes.json : [];
  const containerRow =
    containerRows.find((x: any) => deps.cleanString(x?.inventoryKey) === containerInventoryKey) || null;
  const gps = await deps.captureCurrentGpsLocation();
  const gpsTriple = [gps.provinceId, gps.districtId, gps.wardId].filter(Boolean).join(", ");
  const updatePayload = { ...(params.previousData || {}), ...(params.data || {}), location: gpsTriple };
  const owners = deps.buildOwnerList(containerRow || updatePayload, owner);
  const inventoryKey = deps.cleanString(
    updatePayload?.productionInventoryKey || containerRow?.productionInventoryKey || containerInventoryKey,
  );
  const metadata = {
    ...deps.buildMappedMetadata({
      storage_op: "UPDATE",
      warehouse_id: updatePayload?.warehouseId || params.previousData?.warehouseId,
      container_inventory_key:
        updatePayload?.containerInventoryKey || updatePayload?.productId || params.previousData?.containerInventoryKey,
      current_location: updatePayload?.location || params.previousData?.location,
      storage_created_at:
        deps.cleanString(params.previousData?.createdAt || updatePayload?.createdAt) || new Date().toISOString(),
      storage_updated_at: new Date().toISOString(),
      storage_conditions: updatePayload?.conditions || params.previousData?.conditions,
    }),
  };
  const unsigned = await saveContractUnsignedTx(
    deps.httpClient,
    deps.BACKEND_URL,
    { owners, inventoryKey, metadata },
    "Failed to prepare warehouse storage on-chain update.",
  );
  const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
  const storageId = deps.cleanString(params.id);
  if (!storageId) throw new Error("warehouse-storage id is required.");
  const patchRes = await deps.httpClient(`${deps.BACKEND_URL}/warehouse-storage/${encodeURIComponent(storageId)}`, {
    method: "PATCH",
    body: JSON.stringify({ ...params.data, txHash, containerInventoryKey }),
  });
  const row = patchRes.json as any;
  return { data: { ...row, id: deps.normalizeId(row, params.id) } };
}
