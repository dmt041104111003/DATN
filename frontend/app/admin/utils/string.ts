export function truncate(str: string, len = 12): string {
  if (!str || str.length <= len) return str;
  return str.slice(0, len) + '…';
}

export function shortenAddress(addr: string, head = 12, tail = 8): string {
  const s = addr.trim();
  if (s.length <= head + tail) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}
