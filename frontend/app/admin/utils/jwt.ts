export function base64UrlToUtf8(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function getJwtPayload(token: string): unknown {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = base64UrlToUtf8(parts[1]);
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}

