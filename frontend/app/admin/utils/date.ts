export function nowForDateTimeLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const minute = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function toDisplayDateTime(isoOrLocal: string): string {
  try {
    const d = new Date(isoOrLocal);
    if (Number.isNaN(d.getTime())) return isoOrLocal;
    const pad = (n: number) => String(n).padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hour = pad(d.getHours());
    const minute = pad(d.getMinutes());
    return `${day}/${month}/${year} ${hour}:${minute}`;
  } catch {
    return isoOrLocal;
  }
}

/** Parse DD/MM/YYYY HH:mm hoặc DD/MM/YYYY -> YYYY-MM-DDTHH:mm */
export function fromDisplayDateTime(display: string): string {
  const s = (display || '').trim();
  if (!s) return '';
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?:\s*(AM|PM))?)?$/i);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const year = parseInt(m[3], 10);
    const hour = m[4] != null ? parseInt(m[4], 10) : 0;
    const minute = m[5] != null ? parseInt(m[5], 10) : 0;
    let h = hour;
    const ampm = (m[6] || '').toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const pad = (n: number) => String(n).padStart(2, '0');
    const d2 = new Date(year, month, day, h, minute);
    if (!Number.isNaN(d2.getTime())) {
      return `${d2.getFullYear()}-${pad(d2.getMonth() + 1)}-${pad(d2.getDate())}T${pad(d2.getHours())}:${pad(d2.getMinutes())}`;
    }
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s)) return s;
  return '';
}

export function formatDate(s: string): string {
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    const pad = (n: number) => String(n).padStart(2, '0');
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hour = pad(d.getHours());
    const minute = pad(d.getMinutes());
    return `${day}/${month}/${year}, ${hour}:${minute}`;
  } catch {
    return s;
  }
}
