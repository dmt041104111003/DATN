import { HttpClient, requestUnsignedContractTx } from "./requestUnsignedContractTx";

export async function createContractUnsignedTx(
  httpClient: HttpClient,
  backendUrl: string,
  body: any,
  fallbackMessage: string,
) {
  return requestUnsignedContractTx(
    httpClient,
    `${backendUrl}/contract/create`,
    body,
    fallbackMessage,
  );
}
