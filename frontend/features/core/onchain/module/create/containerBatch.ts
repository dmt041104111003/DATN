import { createContractBatchUnsignedTx } from "@/features/core/onchain/contract/createContractBatchUnsignedTx";
import { signAndPublishUnsignedTx } from "@/features/core/onchain/tx/signAndPublishUnsignedTx";
import { waitForContainersVerified } from "@/features/core/onchain/container/waitForContainersVerified";
import { makeContainerCode } from "@/features/resources/shared/code";

const BATCH_SIZE = 5;

function parseBoxQuantity(value: unknown) {
  const n = Math.floor(Number(String(value ?? "").trim()));
  if (!Number.isFinite(n) || n < 1) return 1;
  if (n > 100) return 100;
  return n;
}

export async function createContainerBatchOnchain(
  params: any,
  deps: any,
  onProgress?: (message: string) => void,
) {
  const { owner } = await deps.getSessionOwner();
  const owners = deps.buildOwnerList(params.data, owner);
  const boxQuantity = parseBoxQuantity(params.data?.boxQuantity);
  const shared = { ...(params.data as any) };
  delete shared.boxQuantity;

  const batchRes = await deps.httpClient(`${deps.BACKEND_URL}/container/batches`, {
    method: "POST",
    body: JSON.stringify({ totalBoxes: boxQuantity }),
  });
  const batchId = String((batchRes.json as any)?.id || "").trim();
  if (!batchId) throw new Error("Không tạo được batch thùng hàng.");

  let created = 0;
  let firstRow: any = null;

  while (created < boxQuantity) {
    const chunkSize = Math.min(BATCH_SIZE, boxQuantity - created);
    onProgress?.(`Đang chuẩn bị giao dịch ${Math.floor(created / BATCH_SIZE) + 1} (${created}/${boxQuantity})...`);

    const items = Array.from({ length: chunkSize }, (_, index) => {
      const code = makeContainerCode(created + index + 1);
      const itemData = { ...shared, code, status: "CREATE" };
      return {
        assetName: code,
        metadata: deps.buildContainerMetadata(itemData, null),
      };
    });

    const unsigned = await createContractBatchUnsignedTx(
      deps.httpClient,
      deps.BACKEND_URL,
      { owners, items },
      "Failed to prepare container on-chain batch transaction.",
    );

    onProgress?.(`Ký giao dịch mint ${chunkSize} thùng (${created + 1}-${created + chunkSize}/${boxQuantity})...`);
    const txHash = await signAndPublishUnsignedTx(String(unsigned.data));
    const mintedItems = Array.isArray(unsigned.items) ? unsigned.items : [];
    const traceSchemeRef = String(unsigned.traceSchemeRef || "").trim();
    const savedKeys: string[] = [];

    for (let i = 0; i < mintedItems.length; i += 1) {
      const minted = mintedItems[i] || {};
      const code = String(minted.assetName || items[i]?.assetName || "").trim();
      const inventoryKey = String(minted.inventoryKey || "").trim();
      if (!inventoryKey) continue;

      const dbRes = await deps.httpClient(`${deps.BACKEND_URL}/container`, {
        method: "POST",
        body: JSON.stringify({
          ...shared,
          code,
          status: "CREATE",
          traceSchemeRef,
          inventoryKey,
          txHash,
          batchId,
        }),
      });
      const row = dbRes.json as any;
      savedKeys.push(inventoryKey);
      if (!firstRow) {
        firstRow = row;
      }
    }

    created += chunkSize;
    onProgress?.(`Đã ghi ${created}/${boxQuantity} thùng. Đang chờ xác thực on-chain...`);
    try {
      await deps.httpClient(`${deps.BACKEND_URL}/record-operations/verify-pending`, { method: "POST" });
    } catch {}
    await waitForContainersVerified(deps.httpClient, deps.BACKEND_URL, savedKeys);

    await deps.httpClient(`${deps.BACKEND_URL}/container/batches/${encodeURIComponent(batchId)}`, {
      method: "PATCH",
      body: JSON.stringify({ completedBoxes: created }),
    });
  }

  await deps.httpClient(`${deps.BACKEND_URL}/container/batches/${encodeURIComponent(batchId)}`, {
    method: "PATCH",
    body: JSON.stringify({ completedBoxes: boxQuantity, status: "DONE" }),
  });

  onProgress?.(`Hoàn tất tạo ${boxQuantity} thùng hàng.`);
  return {
    data: {
      ...(firstRow || {}),
      id: deps.normalizeId(firstRow, batchId),
      batchId,
      batchCreated: boxQuantity,
    },
  };
}
