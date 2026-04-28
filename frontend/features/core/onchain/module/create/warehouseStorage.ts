import { saveContractUnsignedTx } from "@/features/core/onchain/contract/saveContractUnsignedTx";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";

export async function createWarehouseStorageOnchain(params: any, deps: any) {
  const { owner } = await deps.getSessionOwner();
  const containerInventoryKey = deps.cleanString(params.data?.containerInventoryKey || params.data?.productId);
  if (!containerInventoryKey) throw new Error("containerInventoryKey is required.");
  const gps = await deps.captureCurrentGpsLocation();
  const location = [gps.provinceId, gps.districtId, gps.wardId].filter(Boolean).join(", ");
  const createPayload: any = { ...(params.data as any), location };
  const owners = deps.buildOwnerList(createPayload, owner);
  const inventoryKey = deps.cleanString(createPayload?.productionInventoryKey || containerInventoryKey);
  const metadata = {
    ...deps.buildMappedMetadata({
      storage_op: "IN",
      warehouse_id: createPayload?.warehouseId,
      container_inventory_key: createPayload?.containerInventoryKey || createPayload?.productId,
      current_location: createPayload?.location,
      storage_created_at: deps.cleanString(createPayload?.createdAt) || new Date().toISOString(),
      storage_updated_at: new Date().toISOString(),
      storage_conditions: createPayload?.conditions,
    }),
  };
  const unsigned = await saveContractUnsignedTx(
    deps.httpClient,
    deps.BACKEND_URL,
    { owners, inventoryKey, metadata },
    "Failed to prepare warehouse storage on-chain update.",
  );
  const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
  return deps.baseProvider.create("warehouse-storage", {
    ...params,
    data: { ...createPayload, txHash, containerInventoryKey },
  });
}
