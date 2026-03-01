import { cookies } from 'next/headers';
import { getJwtPayload } from './jwt';

export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  if (!token?.value) return false;
  const payload = getJwtPayload(token.value) as { role?: unknown; profileId?: unknown } | null;
  if (!payload) return false;
  return typeof payload.role === 'string' && typeof payload.profileId === 'number';
}
