"use client";

export type Option = { id: string; name: string };
type AreaRow = { code: number; name: string };

const VIETNAM_PROVINCES_API = "https://provinces.open-api.vn/api";
const provinceCache: Option[] = [];
const districtCache = new Map<string, Option[]>();
const wardCache = new Map<string, Option[]>();

async function fetchJson(path: string): Promise<any> {
  const res = await fetch(`${VIETNAM_PROVINCES_API}${path}`);
  if (!res.ok) return null;
  return res.json();
}

function mapRows(rows?: AreaRow[]): Option[] {
  return Array.isArray(rows)
    ? rows.map((row) => ({ id: String(row.code), name: String(row.name) }))
    : [];
}

export async function getProvinceOptions(): Promise<Option[]> {
  if (provinceCache.length > 0) return [...provinceCache];
  const rows = (await fetchJson("/p/")) as AreaRow[] | null;
  const mapped = mapRows(rows ?? undefined);
  provinceCache.splice(0, provinceCache.length, ...mapped);
  return mapped;
}

export async function getDistrictOptions(provinceId: string): Promise<Option[]> {
  const key = String(provinceId || "").trim();
  if (!key) return [];
  if (districtCache.has(key)) return [...(districtCache.get(key) || [])];
  const json = (await fetchJson(`/p/${key}?depth=2`)) as { districts?: AreaRow[] } | null;
  const mapped = mapRows(json?.districts);
  districtCache.set(key, mapped);
  return mapped;
}

export async function getWardOptions(districtId: string): Promise<Option[]> {
  const key = String(districtId || "").trim();
  if (!key) return [];
  if (wardCache.has(key)) return [...(wardCache.get(key) || [])];
  const json = (await fetchJson(`/d/${key}?depth=2`)) as { wards?: AreaRow[] } | null;
  const mapped = mapRows(json?.wards);
  wardCache.set(key, mapped);
  return mapped;
}
