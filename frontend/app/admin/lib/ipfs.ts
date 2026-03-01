const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';
const GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? 'https://ipfs.io/';

export async function uploadFileToIpfs(
  token: string,
  file: File,
): Promise<{ ipfsHash: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(
    `${BACKEND_URL}/ipfs/upload?token=${encodeURIComponent(token)}`,
    {
      method: 'POST',
      body: form,
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? 'Failed to upload to IPFS');
  }
  return { ipfsHash: data.ipfsHash ?? '' };
}

export function getIpfsGatewayUrl(hash: string): string {
  const clean = (hash || '').trim().replace(/^ipfs:\/\//, '');
  if (!clean) return '';
  const base = GATEWAY.replace(/\/$/, '');
  return `${base}ipfs/${clean}`;
}
