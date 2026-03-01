function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return typeof Buffer !== 'undefined' ? Buffer.from(padded, 'base64').toString('utf8') : atob(padded);
}

export function getJwtPayload(token: string): unknown {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    return JSON.parse(base64UrlDecode(parts[1])) as unknown;
  } catch {
    return null;
  }
}
