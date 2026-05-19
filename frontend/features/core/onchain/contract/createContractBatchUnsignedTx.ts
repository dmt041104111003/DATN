import { HttpClient, requestUnsignedContractTx } from "./requestUnsignedContractTx";

export async function createContractBatchUnsignedTx(
  httpClient: HttpClient,
  backendUrl: string,
  body: {
    owners: string[];
    items: Array<{ assetName: string; metadata: Record<string, string> }>;
  },
  fallbackMessage: string,
) {
  return requestUnsignedContractTx(
    httpClient,
    `${backendUrl}/contract/create-batch`,
    body,
    fallbackMessage,
  );
}
