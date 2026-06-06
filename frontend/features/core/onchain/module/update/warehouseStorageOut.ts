import { saveContractUnsignedTx } from "@/features/core/onchain/contract/saveContractUnsignedTx";
import { triggerVerifyPending } from "@/features/core/onchain/triggerVerifyPending";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";
import { signerContextToApiBody, signerContextToMetadata } from "@/features/core/onchain/signerContext";
import { formatProductionRefInline } from "@/features/core/metadata/share/formatProductionRefInline";

export async function deleteWarehouseStorageViaOutOnchain(params: any, deps: any) {
  const { me, owner } = await deps.getSessionOwner();
  const role = deps.cleanString((me as any)?.user?.role || (me as any)?.user?.roleCode).toUpperCase();
  const isAgent = role === "AGENT";
  const containerInventoryKey = deps.cleanString(
    (params.previousData as any)?.containerInventoryKey || (params.previousData as any)?.productId,
  );
  if (!containerInventoryKey) throw new Error("containerInventoryKey is required.");
  const containerRes = await deps.httpClient(`${deps.BACKEND_URL}/container`, { method: "GET" });
  const containerRows = Array.isArray(containerRes?.json) ? containerRes.json : [];
  const containerRow =
    containerRows.find((x: any) => deps.cleanString(x?.inventoryKey) === containerInventoryKey) || null;
  const containerStatus = deps.cleanString(containerRow?.status).toUpperCase();
  if (containerStatus === "CONSUMED") throw new Error("Thùng hàng đã tiêu thụ trước đó.");
  const base = params.previousData || {};
  const owners = deps.buildOwnerList(containerRow || base, owner);
  const inventoryKey = containerInventoryKey;
  const storageOp = isAgent ? "CONSUMED" : "OUT";
  const signer = await deps.resolveSignerContext(deps, { warehouseId: (base as any)?.warehouseId });
  const metadata = {
    ...deps.buildMappedMetadata({
      status: isAgent ? "CONSUMED" : "UPDATE",
      storage_op: storageOp,
      warehouse_id: (base as any)?.warehouseId,
      container_ref_inline: formatProductionRefInline(
        (base as any)?.containerInventoryKey || (base as any)?.productId,
      ),
      storage_created_at: deps.cleanString((base as any)?.createdAt) || new Date().toISOString(),
      storage_updated_at: new Date().toISOString(),
      storage_conditions: (base as any)?.conditions,
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
  const { json } = await deps.httpClient(
    `${deps.BACKEND_URL}/warehouse-storage/${encodeURIComponent(String(params.id))}`,
    {
      method: "DELETE",
      body: JSON.stringify({ txHash, ...signerBody }),
    },
  );
  await triggerVerifyPending(deps.httpClient, deps.BACKEND_URL, txHash);
  const row = json as any;
  return { data: { ...row, id: deps.normalizeId(params.previousData, params.id) } };
}
