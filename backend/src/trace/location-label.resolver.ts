const API = 'https://provinces.open-api.vn/api';
const cache = new Map<string, string>();

function cleanString(v: unknown): string {
  return String(v ?? '').trim();
}

function isAdminLocationCodes(text: string): boolean {
  return /^\d+\s*,\s*\d+\s*,\s*\d+$/.test(text);
}

async function fetchJson(path: string): Promise<Record<string, unknown> | null> {
  const key = `json:${path}`;
  const cached = cache.get(key);
  if (cached) {
    try {
      return JSON.parse(cached) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  try {
    const res = await fetch(`${API}${path}`);
    if (!res.ok) return null;
    const json = (await res.json()) as Record<string, unknown>;
    cache.set(key, JSON.stringify(json));
    return json;
  } catch {
    return null;
  }
}

async function fetchAreaName(path: string, fallback: string): Promise<string> {
  const json = await fetchJson(path);
  const name = cleanString(json?.name);
  return name || fallback;
}

export async function resolveLocationLabelText(raw: unknown): Promise<string> {
  const text = cleanString(raw);
  if (!text) return '';
  const cacheKey = `label:${text}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!isAdminLocationCodes(text)) {
    cache.set(cacheKey, text);
    return text;
  }

  const [provinceId, districtId, wardId] = text.split(',').map((x) => cleanString(x));
  const [provinceName, districtName, wardName] = await Promise.all([
    fetchAreaName(`/p/${provinceId}`, provinceId),
    fetchAreaName(`/d/${districtId}`, districtId),
    fetchAreaName(`/w/${wardId}`, wardId),
  ]);
  const resolved = [wardName, districtName, provinceName].filter(Boolean).join(', ');
  cache.set(cacheKey, resolved || text);
  return resolved || text;
}

export function roleLabelVi(roleRaw: unknown): string {
  const role = cleanString(roleRaw).toUpperCase();
  if (role === 'ENTERPRISE') return 'Doanh nghiệp sản xuất';
  if (role === 'TRANSIT') return 'Kho trung chuyển';
  if (role === 'AGENT') return 'Đại lý phân phối';
  return role || 'Chưa rõ';
}

export function storageOpLabelVi(opRaw: unknown): string {
  const op = cleanString(opRaw).toUpperCase();
  if (op === 'IN') return 'Nhập kho';
  if (op === 'OUT') return 'Xuất kho';
  if (op === 'CONSUMED') return 'Tiêu thụ';
  if (op === 'UPDATE') return 'Cập nhật kho';
  return op || 'Cập nhật';
}

export function displayLocationText(raw: unknown, resolved: unknown): string {
  const text = cleanString(resolved || raw);
  if (!text) return 'Chưa khai báo';
  if (isAdminLocationCodes(text)) return 'Chưa khai báo';
  return text;
}
