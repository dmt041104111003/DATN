import type { Account } from '../types';
import { getJwtPayload } from './jwt';

const AUTH_COOKIE = 'auth_token';

export function readAccountFromToken(): Account | null {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AUTH_COOKIE}=`));
  const token = cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : '';
  if (!token) return null;

  const payload = getJwtPayload(token) as {
    profileId?: unknown;
    stakeAddress?: unknown;
    role?: unknown;
    displayName?: unknown;
    avatarUrl?: unknown;
    location?: unknown;
    coordinates?: unknown;
  } | null;

  if (
    !payload ||
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
    displayName: typeof payload.displayName === 'string' ? payload.displayName : '',
    avatarUrl: typeof payload.avatarUrl === 'string' ? payload.avatarUrl : null,
    location: typeof payload.location === 'string' ? payload.location : null,
    coordinates: typeof payload.coordinates === 'string' ? payload.coordinates : null,
  };
}

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AUTH_COOKIE}=`));
  return cookie ? decodeURIComponent(cookie.split('=')[1] ?? '') : null;
}
