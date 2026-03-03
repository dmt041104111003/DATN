const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

export type Certificate = {
  id: number;
  title: string;
  imageUrl: string | null;
  issuedAt: string;
  number: string | null;
  authority: string | null;
  expiryDate: string | null;
  batchId: string;
  batchName: string;
  productBatchCode: string;
  productBatchName?: string | null;
};

export type CertificateDetail = Certificate & {
  metadata: unknown;
};

export async function getCertificates(
  token: string,
  options?: { batchId?: string; search?: string; page?: number; pageSize?: number },
): Promise<{ total: number; items: Certificate[] }> {
  const params = new URLSearchParams({ token });
  if (options?.batchId) params.set('batchId', options.batchId);
  if (options?.search) params.set('search', options.search);
  if (options?.page) params.set('page', String(options.page));
  if (options?.pageSize) params.set('pageSize', String(options.pageSize));

  const res = await fetch(`${BACKEND_URL}/certificate?${params}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? 'Failed to load certificates');
  }
  return {
    total: data?.total ?? 0,
    items: Array.isArray(data?.items) ? data.items : [],
  };
}

export async function getCertificateById(
  token: string,
  id: number,
): Promise<CertificateDetail> {
  const res = await fetch(
    `${BACKEND_URL}/certificate/${id}?token=${encodeURIComponent(token)}`,
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? 'Certificate not found');
  }
  return data;
}

export async function createCertificate(
  token: string,
  body: {
    title: string;
    batchId: string;
    imageUrl: string;
    number: string;
    authority: string;
    expiryDate?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<{ id: number; title: string; imageUrl: string | null }> {
  const res = await fetch(`${BACKEND_URL}/certificate?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? 'Failed to create certificate');
  }
  return data;
}
