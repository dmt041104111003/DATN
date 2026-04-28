"use client";
import { booleanPointInPolygon, point } from "@turf/turf";
import gadmVnm3 from "@/gadm41_VNM_3.json";
import { cleanString } from "@/features/core/metadata/share/cleanString";

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
  const options: Option[] = [];
  if (!Array.isArray(rows)) return options;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    options.push({
      id: String(row.code),
      name: String(row.name),
    });
  }

  return options;
}

async function getCachedOptions(cache: Map<string, Option[]>, key: string, path: string, field: string) {
  if (!key) return [];

  const cached = cache.get(key);
  if (cached) return [...cached];

  const json = (await fetchJson(path)) as Record<string, AreaRow[] | undefined> | null;
  const mapped = mapRows(json?.[field]);
  cache.set(key, mapped);
  return mapped;
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
  return getCachedOptions(districtCache, key, `/p/${key}?depth=2`, "districts");
}

export async function getWardOptions(districtId: string): Promise<Option[]> {
  const key = String(districtId || "").trim();
  return getCachedOptions(wardCache, key, `/d/${key}?depth=2`, "wards");
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const gadmFeatures: any[] = Array.isArray((gadmVnm3 as any)?.features) ? (gadmVnm3 as any).features : [];

function normalizeText(v: unknown) {
  let text = String(v || "");
  text = text.normalize("NFD");
  text = text.replace(/[\u0300-\u036f]/g, "");
  text = text.replace(/đ/g, "d");
  text = text.replace(/Đ/g, "D");
  text = text.replace(/^(tinh|thanhpho|quan|huyen|thixa|thitran|phuong|xa)/i, "");
  text = text.replace(/\s+/g, "");
  text = text.toLowerCase();
  text = text.trim();
  return text;
}

function matchesName(optionName: string, candidate: string) {
  const a = normalizeText(optionName);
  const b = normalizeText(candidate);
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

function findMatchedOption(options: Option[], rawName: string) {
  for (let i = 0; i < options.length; i += 1) {
    const row = options[i];
    if (matchesName(row.name, rawName)) return row;
  }

  return null;
}

function resolveByPolygon(lat: number, lng: number) {
  const pt = point([lng, lat]);
  for (let i = 0; i < gadmFeatures.length; i += 1) {
    const feature = gadmFeatures[i];
    if (!feature?.geometry) continue;
    if (booleanPointInPolygon(pt as any, feature as any)) {
      const props = (feature.properties || {}) as Record<string, unknown>;
      return {
        provinceName: cleanString(props.NAME_1).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").trim(),
        districtName: cleanString(props.NAME_2).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").trim(),
        wardName: cleanString(props.NAME_3).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\s+/g, " ").trim(),
      };
    }
  }
  return null;
}

async function resolveAreaIdsFromGps(lat: number, lng: number): Promise<{
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
  let feature = null;
  if (Array.isArray(json?.features) && json.features.length > 0) {
    feature = json.features[0];
  }

  const props = feature && feature.properties ? feature.properties : {};
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
  const province = findMatchedOption(provinces, provinceNameRaw);

  if (!province) throw new Error("Không map được Tỉnh/Thành từ GPS.");
  const provinceId = String(province.id);

  const districts = await getDistrictOptions(provinceId);
  const district = findMatchedOption(districts, districtNameRaw);

  if (!district) throw new Error("Không map được Quận/Huyện từ GPS.");
  const districtId = String(district.id);

  const wards = await getWardOptions(districtId);
  const ward = findMatchedOption(wards, wardNameRaw);

  if (!ward) throw new Error("Không map được Phường/Xã từ GPS.");
  const wardId = String(ward.id);

  const locationLabel = `${cleanString(ward.name)}, ${cleanString(district.name)}, ${cleanString(province.name)}`;
  if (!locationLabel) throw new Error("Không dựng được địa điểm từ GPS.");

  return {
    provinceName: province.name,
    districtName: district.name,
    wardName: ward.name,
    provinceId,
    districtId,
    wardId,
    locationLabel,
  };
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
    ...area,
  };
}
