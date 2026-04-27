"use client";
import { booleanPointInPolygon, point } from "@turf/turf";
import gadmVnm3 from "@/gadm41_VNM_3.json";

export type Option = { id: string; name: string };
type AreaRow = { code: number; name: string };

const VIETNAM_PROVINCES_API = "https://provinces.open-api.vn/api";
const provinceCache: Option[] = [];
const districtCache = new Map<string, Option[]>();
const wardCache = new Map<string, Option[]>();
const provinceNameCache = new Map<string, string>();
const districtNameCache = new Map<string, string>();
const wardNameCache = new Map<string, string>();
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
  for (const item of mapped) provinceNameCache.set(item.id, item.name);
  return mapped;
}

export async function getDistrictOptions(provinceId: string): Promise<Option[]> {
  const key = String(provinceId || "").trim();
  if (!key) return [];
  if (districtCache.has(key)) return [...(districtCache.get(key) || [])];
  const json = (await fetchJson(`/p/${key}?depth=2`)) as { districts?: AreaRow[] } | null;
  const mapped = mapRows(json?.districts);
  districtCache.set(key, mapped);
  for (const item of mapped) districtNameCache.set(item.id, item.name);
  return mapped;
}

export async function getWardOptions(districtId: string): Promise<Option[]> {
  const key = String(districtId || "").trim();
  if (!key) return [];
  if (wardCache.has(key)) return [...(wardCache.get(key) || [])];
  const json = (await fetchJson(`/d/${key}?depth=2`)) as { wards?: AreaRow[] } | null;
  const mapped = mapRows(json?.wards);
  wardCache.set(key, mapped);
  for (const item of mapped) wardNameCache.set(item.id, item.name);
  return mapped;
}

export async function getProvinceNameById(provinceId: string): Promise<string> {
  const key = String(provinceId || "").trim();
  if (!key) return "";
  if (provinceNameCache.has(key)) return provinceNameCache.get(key) || "";
  const json = (await fetchJson(`/p/${key}`)) as AreaRow | null;
  const name = String(json?.name || "").trim();
  if (name) provinceNameCache.set(key, name);
  return name;
}

export async function getDistrictNameById(districtId: string): Promise<string> {
  const key = String(districtId || "").trim();
  if (!key) return "";
  if (districtNameCache.has(key)) return districtNameCache.get(key) || "";
  const json = (await fetchJson(`/d/${key}`)) as AreaRow | null;
  const name = String(json?.name || "").trim();
  if (name) districtNameCache.set(key, name);
  return name;
}

export async function getWardNameById(wardId: string): Promise<string> {
  const key = String(wardId || "").trim();
  if (!key) return "";
  if (wardNameCache.has(key)) return wardNameCache.get(key) || "";
  const json = (await fetchJson(`/w/${key}`)) as AreaRow | null;
  const name = String(json?.name || "").trim();
  if (name) wardNameCache.set(key, name);
  return name;
}

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const gadmFeatures: any[] = Array.isArray((gadmVnm3 as any)?.features) ? (gadmVnm3 as any).features : [];

function normalizeText(v: unknown) {
  return String(v || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/^(tinh|thanhpho|quan|huyen|thixa|thitran|phuong|xa)/i, "")
    .replace(/\s+/g, "")
    .toLowerCase()
    .trim();
}

function matchesName(optionName: string, candidate: string) {
  const a = normalizeText(optionName);
  const b = normalizeText(candidate);
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

function humanName(raw: unknown) {
  const text = cleanString(raw);
  if (!text) return "";
  return text.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").trim();
}

function resolveByPolygon(lat: number, lng: number) {
  const pt = point([lng, lat]);
  for (const feature of gadmFeatures) {
    if (!feature?.geometry) continue;
    if (booleanPointInPolygon(pt as any, feature as any)) {
      const props = (feature.properties || {}) as Record<string, unknown>;
      return {
        provinceName: humanName(props.NAME_1),
        districtName: humanName(props.NAME_2),
        wardName: humanName(props.NAME_3),
      };
    }
  }
  return null;
}

export async function resolveAreaIdsFromGps(lat: number, lng: number): Promise<{
  provinceName: string;
  districtName: string;
  wardName: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  locationLabel: string;
}> {
  const url = `${BACKEND_URL}/location/reverse-geocode?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error("Không truy vấn được Geoapify reverse geocoding.");
  const json = (await res.json()) as any;
  console.log("Geoapify reverse raw:", json);
  const feature = Array.isArray(json?.features) && json.features.length ? json.features[0] : null;
  const props = feature?.properties || {};
  const geoapifyProvince = cleanString(props?.state || props?.state_district);
  const geoapifyDistrict = cleanString(props?.city_district || props?.district || props?.county || props?.city || props?.town);
  const geoapifyWard = cleanString(props?.suburb || props?.quarter || props?.city_block || props?.hamlet || props?.village);
  const polygon = resolveByPolygon(lat, lng);
  const provinceNameRaw = cleanString(polygon?.provinceName || geoapifyProvince);
  const districtNameRaw = cleanString(polygon?.districtName || geoapifyDistrict);
  const wardNameRaw = cleanString(polygon?.wardName || geoapifyWard);
  if (!provinceNameRaw || !districtNameRaw || !wardNameRaw) {
    throw new Error("Không resolve được địa giới từ GPS (Geoapify + polygon).");
  }

  const provinces = await getProvinceOptions();
  const province = provinces.find((x) => matchesName(x.name, provinceNameRaw));
  if (!province) throw new Error("Không map được Tỉnh/Thành từ GPS.");
  const provinceId = String(province.id);

  const districts = await getDistrictOptions(provinceId);
  const district = districts.find((x) => matchesName(x.name, districtNameRaw));
  if (!district) throw new Error("Không map được Quận/Huyện từ GPS.");
  const districtId = String(district.id);

  const wards = await getWardOptions(districtId);
  const ward = wards.find((x) => matchesName(x.name, wardNameRaw));
  if (!ward) throw new Error("Không map được Phường/Xã từ GPS.");
  const wardId = String(ward.id);

  const locationLabel = [ward.name, district.name, province.name].map((x) => cleanString(x)).filter(Boolean).join(", ");
  if (!locationLabel) throw new Error("Không dựng được địa điểm từ GPS.");
  const mapped = {
    provinceName: province.name,
    districtName: district.name,
    wardName: ward.name,
    provinceId,
    districtId,
    wardId,
    locationLabel,
  };
  console.log("GPS mapped area:", {
    input: { lat, lng },
    mapped,
  });
  return mapped;
}

export async function captureCurrentGpsLocation(): Promise<{
  lat: number;
  lng: number;
  accuracyM: number | null;
  timestampIso: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  locationLabel: string;
}> {
  const pos = await new Promise<{ latitude: number; longitude: number; accuracy: number | null }>((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.src = "/gps-capture.html";
    iframe.style.cssText = "position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;";
    document.body.appendChild(iframe);

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      try {
        iframe.remove();
      } catch {}
    };
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Lấy GPS bị timeout."));
    }, 45000);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = (event.data || {}) as any;
      if (data?.type !== "GPS_CAPTURE_RESULT") return;
      window.clearTimeout(timer);
      cleanup();
      const payload = data?.payload || {};
      if (!payload?.ok) {
        reject(new Error(cleanString(payload?.error) || "Không thể lấy vị trí GPS."));
        return;
      }
      resolve({
        latitude: Number(payload.latitude),
        longitude: Number(payload.longitude),
        accuracy: Number.isFinite(Number(payload.accuracy)) ? Number(payload.accuracy) : null,
      });
    };
    window.addEventListener("message", onMessage);
  });
  const lat = Number(pos.latitude);
  const lng = Number(pos.longitude);
  const accuracyM = Number.isFinite(Number(pos.accuracy)) ? Number(pos.accuracy) : null;
  const timestampIso = new Date().toISOString();
  const area = await resolveAreaIdsFromGps(lat, lng);
  return {
    lat,
    lng,
    accuracyM,
    timestampIso,
    provinceName: area.provinceName,
    districtName: area.districtName,
    wardName: area.wardName,
    provinceId: area.provinceId,
    districtId: area.districtId,
    wardId: area.wardId,
    locationLabel: area.locationLabel,
  };
}
