const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

export async function uploadImage(
  token: string,
  body: { imageDataUrl: string; folder?: string },
): Promise<{ url: string }> {
  const res = await fetch(
    `${BACKEND_URL}/upload/image?token=${encodeURIComponent(token)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? 'Failed to upload image');
  }
  return { url: data?.url ?? '' };
}
