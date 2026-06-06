import { cleanString } from "@/features/core/metadata/share/cleanString";

function ipfsCid(uri: string): string {
  const raw = cleanString(uri);
  if (!raw) return "";
  if (raw.startsWith("ipfs://")) return raw.slice("ipfs://".length).split("/")[0] || "";
  const gatewayMatch = raw.match(/\/ipfs\/([^/?#]+)/i);
  if (gatewayMatch) return gatewayMatch[1] || "";
  if (raw.startsWith("https://") || raw.startsWith("http://")) return "";
  return raw;
}

export function canonicalIpfsUri(uri: string): string {
  const raw = cleanString(uri);
  if (!raw) return "";
  if (raw.startsWith("ipfs://")) return raw;
  const cid = ipfsCid(raw);
  if (cid) return `ipfs://${cid}`;
  return raw;
}

export function ipfsGatewayUrls(uri: string): string[] {
  const raw = canonicalIpfsUri(uri);
  if (!raw) return [];
  if (raw.startsWith("http://") || raw.startsWith("https://")) return [raw];
  const cid = ipfsCid(raw);
  if (!cid) return [];
  return [
    `https://ipfs.io/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`,
    `https://w3s.link/ipfs/${cid}`,
  ];
}

export function ipfsToHttpUrl(uri: string): string {
  return ipfsGatewayUrls(uri)[0] || "";
}

function extractIpfsUri(item: unknown): string {
  if (typeof item === "string") return canonicalIpfsUri(item);
  if (item && typeof item === "object") {
    const row = item as Record<string, unknown>;
    return canonicalIpfsUri(cleanString(row.ipfsUri || row.uri || row.src || row.url));
  }
  return "";
}

export function normalizeIpfsUriList(input: unknown): string[] {
  return Array.from(
    new Set(
      (Array.isArray(input) ? input : [])
        .map(extractIpfsUri)
        .filter(Boolean),
    ),
  );
}

export function normalizeEvidenceFilesForForm(
  input: unknown,
): Array<{ title: string; uri: string; src: string }> {
  const uris = normalizeIpfsUriList(input);
  return uris.map((uri, index) => ({
    title: `Ảnh ${index + 1}`,
    uri,
    src: ipfsToHttpUrl(uri),
  }));
}
