import { cleanString } from "@/features/core/metadata/share/cleanString";

export function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((x) => cleanString(x)).filter(Boolean);
  const raw = cleanString(value);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((x) => cleanString(x)).filter(Boolean);
  } catch {}
  return raw
    .split(";")
    .map((x) => cleanString(x))
    .filter(Boolean);
}
