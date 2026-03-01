const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

export type ProfileByRole = {
  id: number;
  displayName: string;
  walletAddress: string;
};

export async function getProfilesByRole(
  token: string,
  role: string,
): Promise<ProfileByRole[]> {
  const res = await fetch(
    `${BACKEND_URL}/profile/profiles/by-role?role=${encodeURIComponent(role)}&token=${encodeURIComponent(token)}`,
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? 'Failed to load profiles');
  }
  return Array.isArray(data) ? data : [];
}
