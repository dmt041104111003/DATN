import { toCip68SafeText } from "@/features/core/metadata/share/toCip68SafeText";

export function buildMappedMetadata(fields: Record<string, unknown>) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields || {})) {
    out[String(key)] = toCip68SafeText(value);
  }
  return out;
}
