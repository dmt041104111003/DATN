/** Doanh nghiệp, Trung chuyển: nhập kho / xuất kho (bàn giao hàng). */
export const QR_SCAN_LOGISTICS_CHOICES = [
  { id: "WAREHOUSE_IN", name: "Nhập kho" },
  { id: "WAREHOUSE_OUT", name: "Xuất kho" },
] as const;

/** Đại lý: nhập kho bán lẻ / tiêu thụ cuối chuỗi. */
export const QR_SCAN_AGENT_CHOICES = [
  { id: "WAREHOUSE_IN", name: "Nhập kho" },
  { id: "CONSUME", name: "Tiêu thụ" },
] as const;

export type QrScanTypeId =
  | (typeof QR_SCAN_LOGISTICS_CHOICES)[number]["id"]
  | (typeof QR_SCAN_AGENT_CHOICES)[number]["id"];

export function getQrScanChoicesForRole(roleRaw: string) {
  const role = String(roleRaw || "").trim().toUpperCase();
  if (role === "AGENT") return [...QR_SCAN_AGENT_CHOICES];
  return [...QR_SCAN_LOGISTICS_CHOICES];
}

export function isQrScanTypeAllowed(roleRaw: string, scanType: string) {
  return getQrScanChoicesForRole(roleRaw).some((c) => c.id === scanType);
}
