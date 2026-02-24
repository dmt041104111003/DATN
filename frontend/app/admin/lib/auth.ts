import { cookies } from 'next/headers';

function base64UrlToUtf8(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function getJwtPayload(token: string): unknown {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = base64UrlToUtf8(parts[1]);
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}

export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  if (!token?.value) return false;
  const payload = getJwtPayload(token.value) as
    | { role?: unknown; profileId?: unknown }
    | null;
  if (!payload) return false;
  return typeof payload.role === 'string' && typeof payload.profileId === 'number';
}

