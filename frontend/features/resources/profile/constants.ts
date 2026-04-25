"use client";

export const ROLE_CHOICES = [
  { id: "ENTERPRISE", name: "Doanh nghiệp" },
  { id: "TRANSIT", name: "Trung chuyển" },
  { id: "AGENT", name: "Đại lý" },
];

export function roleLabel(code: unknown) {
  const value = String(code || "").toUpperCase();
  const hit = ROLE_CHOICES.find((r) => r.id === value);
  return hit?.name || value || "-";
}
