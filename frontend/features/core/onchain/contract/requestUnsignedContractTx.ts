import { ensureUnsignedTxResponse } from "../tx/ensureUnsignedTxResponse";

export type HttpClient = (url: string, options?: any) => Promise<{ json: any }>;

export async function requestUnsignedContractTx(
  httpClient: HttpClient,
  url: string,
  body: any,
  fallbackMessage: string,
) {
  const res = await httpClient(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const unsigned = res.json as any;
  ensureUnsignedTxResponse(unsigned, fallbackMessage);
  return unsigned;
}
