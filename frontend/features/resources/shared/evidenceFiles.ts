import { cleanString } from "@/features/core/metadata/share/cleanString";

export function ipfsToHttpUrl(uri: string): string {
  const raw = cleanString(uri);
  if (!raw) return "";
  if (raw.startsWith("ipfs://")) return `https://ipfs.io/ipfs/${raw.slice("ipfs://".length)}`;
  return raw;
}

function extractIpfsUri(item: unknown): string {
  if (typeof item === "string") return cleanString(item);
  if (item && typeof item === "object") {
    const row = item as Record<string, unknown>;
    return cleanString(row.src || row.url || row.ipfsUri);
  }
  return "";
}

export function normalizeEvidenceFilesForForm(input: unknown): Array<{ title: string; src: string }> {
  const uris = Array.from(
    new Set(
      (Array.isArray(input) ? input : [])
        .map(extractIpfsUri)
        .filter(Boolean),
    ),
  );
  return uris.map((uri, index) => ({
    title: `Ảnh ${index + 1}`,
    src: ipfsToHttpUrl(uri),
  }));
}
