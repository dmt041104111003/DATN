import { toCip68SafeText } from "@/features/core/metadata/share/toCip68SafeText";

const DEFAULT_NFT_LOGO_CID = "bafkreiet2c7tmtcph6qvyoitypfphb7s7t3pnjdiq5bnhsfwby37o5cvaa";

export function buildMappedMetadata(fields: Record<string, unknown>) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields || {})) {
    out[String(key)] = toCip68SafeText(value);
  }
  if (!String(out.image || "").trim()) {
    out.image = `ipfs://${DEFAULT_NFT_LOGO_CID}`;
  }
  return out;
}
