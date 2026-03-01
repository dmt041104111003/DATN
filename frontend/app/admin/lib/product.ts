const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

export type BatchListItem = {
  id: number;
  code: string;
  name: string;
  image: string | null;
  createdAt: string;
  policyId: string | null;
};

export async function getBatchesList(token: string): Promise<BatchListItem[]> {
  const res = await fetch(
    `${BACKEND_URL}/product/batches?token=${encodeURIComponent(token)}`,
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Failed to load batches');
  }
  const items = data?.items ?? [];
  return Array.isArray(items)
    ? items.map((b: { id?: number; code?: string; name?: string; image?: string | null; createdAt?: string; policyId?: string | null }) => ({
        id: Number(b?.id ?? 0),
        code: String(b?.code ?? ''),
        name: String(b?.name ?? ''),
        image: b?.image ?? null,
        createdAt: b?.createdAt ? String(b.createdAt) : '',
        policyId: b?.policyId ?? null,
      }))
    : [];
}

export async function getNextHopIndex(
  assetName: string,
  address: string,
): Promise<{ hopIndex: number; recipientAddress: string | null }> {
  const res = await fetch(
    `${BACKEND_URL}/product/roadmap/next-hop?assetName=${encodeURIComponent(assetName.trim())}&address=${encodeURIComponent(address.trim())}`,
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Failed to get hop index');
  }
  return { hopIndex: data?.hopIndex ?? 0, recipientAddress: data?.recipientAddress ?? null };
}

export async function getBatchByAssetName(assetName: string): Promise<{
  policyId: string | null;
  assetName: string;
  nftUnit: string | null;
} | null> {
  const res = await fetch(
    `${BACKEND_URL}/product/batch/${encodeURIComponent(assetName.trim())}`,
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Failed to get batch');
  }
  if (data == null) return null;
  return {
    policyId: data.policyId ?? null,
    assetName: data.assetName ?? assetName,
    nftUnit: data.nftUnit ?? null,
  };
}
