"use client";

export const positiveNumber = (value: unknown) => {
  if (value === null || value === undefined || String(value).trim() === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Phải lớn hơn 0";
  return undefined;
};

export function parsePositiveNumber(value: unknown) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
