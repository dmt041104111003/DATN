import { HttpClient, requestUnsignedContractTx } from "./requestUnsignedContractTx";

export async function burnContractUnsignedTx(
  httpClient: HttpClient,
  backendUrl: string,
  body: any,
  fallbackMessage: string,
) {
  return requestUnsignedContractTx(
    httpClient,
    `${backendUrl}/contract/burn`,
    body,
    fallbackMessage,
  );
}
