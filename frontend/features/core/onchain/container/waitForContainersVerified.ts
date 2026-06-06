import { waitForEntityVerified } from "@/features/core/onchain/waitForEntityVerified";

export async function waitForContainersVerified(
  httpClient: (url: string, options?: any) => Promise<{ json: any }>,
  backendUrl: string,
  inventoryKeys: string[],
  txHashes?: string[],
) {
  return waitForEntityVerified(httpClient, backendUrl, {
    entityType: "CONTAINER",
    entityKeys: inventoryKeys,
    txHashes,
  });
}
