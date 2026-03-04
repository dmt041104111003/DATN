export function truncate(str: string | null | undefined, len = 20): string {
  if (str == null || str === '') return '—';
  const t = String(str).trim();
  return t.length > len ? t.slice(0, len) + '…' : t;
}

export function shortenAddress(addr: string, head = 12, tail = 8): string {
  const s = addr.trim();
  if (s.length <= head + tail) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}
