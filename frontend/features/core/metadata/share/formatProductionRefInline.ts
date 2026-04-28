import { cleanString } from "@/features/core/metadata/share/cleanString";

export function formatProductionRefInline(inventoryKeyRaw: unknown) {
  const key = cleanString(inventoryKeyRaw).replace(/^0x/, "");
  if (!key) return "";
  if (!/^[0-9a-f]+$/i.test(key) || key.length <= 56) return key;
  const policyId = key.slice(0, 56);
  const rest = key.slice(56);
  const cip68RefPrefix = "000643b0";
  const assetHex = rest.startsWith(cip68RefPrefix) ? rest.slice(cip68RefPrefix.length) : rest;
  if (!assetHex || assetHex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(assetHex)) return key;
  try {
    const assetName = Buffer.from(assetHex, "hex").toString("utf-8");
    return `${policyId}.${assetName}`;
  } catch {
    return key;
  }
}
