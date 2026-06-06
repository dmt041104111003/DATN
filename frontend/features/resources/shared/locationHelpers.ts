import { cleanString } from "@/features/core/metadata/share/cleanString";
import { getDistrictOptions, getProvinceOptions, getWardOptions } from "@/features/resources/shared/location";

export const EMPTY_PARTICIPANT_ROW = {
  walletAddress: "",
  provinceId: "",
  districtId: "",
  wardId: "",
};

export function splitLocationLabel(value: unknown) {
  const parts = cleanString(value).split(",").map((x) => cleanString(x));
  return { provinceId: parts[0] || "", districtId: parts[1] || "", wardId: parts[2] || "" };
}

export function normalizeParticipantRow(row: any) {
  return {
    walletAddress: cleanString(row?.walletAddress),
    provinceId: cleanString(row?.provinceId),
    districtId: cleanString(row?.districtId),
    wardId: cleanString(row?.wardId),
  };
}

export function toLocationLabel(row: any) {
  return [cleanString(row?.provinceId), cleanString(row?.districtId), cleanString(row?.wardId)].filter(Boolean).join(", ");
}

export function isAdminLocationCodes(value: unknown) {
  return /^\d+\s*,\s*\d+\s*,\s*\d+$/.test(cleanString(value));
}

export async function codesToLocationText(raw: unknown): Promise<string> {
  const text = cleanString(raw);
  if (!text) return "";
  if (!isAdminLocationCodes(text)) return text;
  const [provinceId, districtId, wardId] = text.split(",").map((x) => cleanString(x));
  try {
    const provinces = await getProvinceOptions();
    const provinceName = provinces.find((v) => cleanString(v.id) === provinceId)?.name || "";
    const districts = await getDistrictOptions(provinceId);
    const districtName = districts.find((v) => cleanString(v.id) === districtId)?.name || "";
    const wards = await getWardOptions(districtId);
    const wardName = wards.find((v) => cleanString(v.id) === wardId)?.name || "";
    const resolved = [wardName, districtName, provinceName].filter(Boolean).join(", ");
    return resolved || text;
  } catch {
    return text;
  }
}

export async function resolveParticipantLocationTexts(labels: unknown): Promise<string[]> {
  const rows = Array.isArray(labels) ? labels : [];
  return Promise.all(rows.map((label) => codesToLocationText(label)));
}
