export function ensureUnsignedTxResponse(unsigned: any, fallbackMessage: string) {
  if (!unsigned?.result || !unsigned?.data) {
    throw new Error(unsigned?.message || fallbackMessage);
  }
}
