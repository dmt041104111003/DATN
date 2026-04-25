"use client";

export type Option = { id: string; name: string };
export type ProvinceApiRow = { code: number; name: string };
export type DistrictApiResponse = { districts?: ProvinceApiRow[] };
export type WardApiResponse = { wards?: ProvinceApiRow[] };

export const VIETNAM_PROVINCES_API = "https://provinces.open-api.vn/api";
export const provinceCache: Option[] = [];
export const districtCache = new Map<string, Option[]>();
export const wardCache = new Map<string, Option[]>();

export const UNIT_TYPE_CHOICES = [
  { id: "TRANSIT", name: "Trung chuyển" },
  { id: "AGENT", name: "Đại lý" },
];

export const phoneValidator = (value: unknown) => {
  const v = String(value ?? "").trim();
  if (!v) return undefined;
  return /^[0-9+\-\s()]{8,20}$/.test(v) ? undefined : "Số điện thoại không hợp lệ";
};

