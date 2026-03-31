export function shortUnit(
  unit: string | null | undefined,
  opts?: { head?: number; tail?: number; min?: number },
): string {
  const t = String(unit ?? "").trim();
  if (!t) return "—";
  const head = Math.max(1, Math.floor(opts?.head ?? 18));
  const tail = Math.max(1, Math.floor(opts?.tail ?? 6));
  const min = Math.max(0, Math.floor(opts?.min ?? head + tail + 3));
  if (t.length <= min) return t;
  return `${t.slice(0, head)}…${t.slice(-tail)}`;
}

