import { cleanString } from "@/features/core/metadata/share/cleanString";

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
