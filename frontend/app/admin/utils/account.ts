import type { Account } from '../types';

const AUTH_COOKIE = 'auth_token';

export function readAccountFromToken(): Account | null {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AUTH_COOKIE}=`));

  const token = cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  const payloadPart = parts[1];
  const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  );

  try {
    const json = atob(padded);
    const payload = JSON.parse(json) as {
      profileId?: unknown;
      stakeAddress?: unknown;
      role?: unknown;
      displayName?: unknown;
      glnCodeRoot?: unknown;
      avatarUrl?: unknown;
    };

    if (
      typeof payload.profileId !== 'number' ||
      typeof payload.stakeAddress !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      return null;
    }

    return {
      id: payload.profileId,
      stakeAddress: payload.stakeAddress,
      roleCode: payload.role,
      displayName:
        typeof payload.displayName === 'string' ? payload.displayName : '',
      glnCodeRoot:
        typeof payload.glnCodeRoot === 'string' ? payload.glnCodeRoot : null,
      avatarUrl:
        typeof payload.avatarUrl === 'string' ? payload.avatarUrl : null,
    };
  } catch {
    return null;
  }
}

