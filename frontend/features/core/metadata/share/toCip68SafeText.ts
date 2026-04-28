import { cleanString } from "@/features/core/metadata/share/cleanString";

export function toCip68SafeText(value: unknown) {
  const raw = cleanString(value);
  if (!raw) return "";
  if (/^[0-9a-f]+$/i.test(raw) && raw.length % 2 === 0) {
    const num = Number(raw);
    if (Number.isFinite(num)) {
      return `${raw}.0`;
    }
  }
  return raw;
}
