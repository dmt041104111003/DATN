import { HttpClient, requestUnsignedContractTx } from "./requestUnsignedContractTx";

export async function saveContractUnsignedTx(
  httpClient: HttpClient,
  backendUrl: string,
  body: any,
  fallbackMessage: string,
) {
  return requestUnsignedContractTx(
    httpClient,
    `${backendUrl}/contract/save`,
    body,
    fallbackMessage,
  );
}
