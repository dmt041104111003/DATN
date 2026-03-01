const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

export type WarehouseItem = {
  batchId: string;
  batchName: string;
  image: string | null;
  quantity: number;
  mintedAt: string;
  policyId?: string | null;
  status?: string;
};

function mapItem(i: Record<string, unknown>): WarehouseItem {
  return {
    batchId: String(i?.batchId ?? ''),
    batchName: String(i?.batchName ?? ''),
    image: i?.image != null ? String(i.image) : null,
    quantity: Number(i?.quantity) ?? 1,
    mintedAt: String(i?.mintedAt ?? ''),
    policyId: i?.policyId != null ? String(i.policyId) : null,
    status: i?.status != null ? String(i.status) : 'IN_WAREHOUSE',
  };
}

export async function getWarehouseItems(token: string): Promise<WarehouseItem[]> {
  const res = await fetch(
    `${BACKEND_URL}/warehouse?token=${encodeURIComponent(token)}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.message ?? data?.error ?? 'Failed to load your warehouse.',
    );
  }
  const raw = Array.isArray(data?.items) ? data.items : [];
  return raw.map((i: Record<string, unknown>) => mapItem(i));
}

export async function getLockRecipientByRoadmap(
  token: string,
  batchId: string,
): Promise<{ recipientAddress: string | null }> {
  const res = await fetch(
    `${BACKEND_URL}/warehouse/recipient-by-roadmap?batchId=${encodeURIComponent(batchId.trim())}&token=${encodeURIComponent(token)}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? 'Failed to get recipient.');
  }
  return {
    recipientAddress: data?.recipientAddress != null ? String(data.recipientAddress) : null,
  };
}

export async function requestBurnNft(
  token: string,
  params: {
    changeAddress: string;
    assetName: string;
    walletUtxos: unknown[];
    policyId?: string | null;
  },
): Promise<{ unsignedTx: string }> {
  const res = await fetch(
    `${BACKEND_URL}/product/burn?token=${encodeURIComponent(token)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        changeAddress: params.changeAddress,
        assetName: params.assetName,
        walletUtxos: params.walletUtxos,
        ...(params.policyId ? { policyId: params.policyId } : {}),
      }),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.message ?? data?.error ?? 'Failed to create burn transaction.',
    );
  }
  if (!data?.unsignedTx) {
    throw new Error('Backend did not return unsignedTx.');
  }
  return { unsignedTx: data.unsignedTx };
}

export async function confirmBurnNft(
  token: string,
  params: { txHash: string; assetName: string; profileId: number },
): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/product/burn/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      txHash: params.txHash,
      assetName: params.assetName,
      profileId: params.profileId,
    }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(
      data?.message ?? data?.error ?? 'Burn confirm failed.',
    );
  }
}
