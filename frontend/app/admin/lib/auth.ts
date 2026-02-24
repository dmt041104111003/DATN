import { cookies } from 'next/headers';

export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return Boolean(token?.value);
}

