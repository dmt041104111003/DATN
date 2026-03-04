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
  documentType: string | null;
  standardReference: string | null;
  scope: string | null;
  documentUrl: string | null;
};

export type CertificateDetail = Certificate;

export async function getCertificates(
  token: string,
  options?: { search?: string; page?: number; pageSize?: number; attachedToBatchId?: string },
): Promise<{ total: number; items: Certificate[] }> {
  const params = new URLSearchParams({ token });
  if (options?.search) params.set('search', options.search);
  if (options?.page) params.set('page', String(options.page));
  if (options?.pageSize) params.set('pageSize', String(options.pageSize));
  if (options?.attachedToBatchId) params.set('attachedToBatchId', options.attachedToBatchId);

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

export async function getCertificateIdsByBatch(
  token: string,
  batchId: string,
): Promise<number[]> {
  const res = await fetch(
    `${BACKEND_URL}/certificate/batch/${encodeURIComponent(batchId)}/ids?token=${encodeURIComponent(token)}`,
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? 'Failed to load certificate ids');
  }
  return Array.isArray(data?.certificateIds) ? data.certificateIds : [];
}

export async function setCertificatesForBatch(
  token: string,
  batchId: string,
  certificateIds: number[],
): Promise<void> {
  const res = await fetch(
    `${BACKEND_URL}/certificate/batch/${encodeURIComponent(batchId)}?token=${encodeURIComponent(token)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certificateIds }),
    },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? data?.error ?? 'Failed to set certificates for product');
  }
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
    imageUrl: string;
    number: string;
    authority: string;
    expiryDate?: string;
    documentType?: string;
    standardReference?: string;
    scope?: string;
    documentUrl?: string;
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

export async function updateCertificate(
  token: string,
  id: number,
  body: {
    title?: string;
    imageUrl?: string;
    number?: string;
    authority?: string;
    expiryDate?: string;
    documentType?: string;
    standardReference?: string;
    scope?: string;
    documentUrl?: string;
  },
): Promise<{ id: number; title: string; imageUrl: string | null }> {
  const res = await fetch(
    `${BACKEND_URL}/certificate/${id}?token=${encodeURIComponent(token)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? 'Failed to update certificate');
  }
  return data;
}

export async function deleteCertificate(
  token: string,
  id: number,
): Promise<void> {
  const res = await fetch(
    `${BACKEND_URL}/certificate/${id}?token=${encodeURIComponent(token)}`,
    { method: 'DELETE' },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message ?? data?.error ?? 'Failed to delete certificate');
  }
}
