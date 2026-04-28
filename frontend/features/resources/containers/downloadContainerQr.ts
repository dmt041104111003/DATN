"use client";

import QRCode from "qrcode";

export async function downloadContainerQr(record: any) {
  const qrText = String(record?.inventoryKey || record?.id || record?.code || "").trim();
  if (!qrText) return;

  const link = document.createElement("a");
  link.href = await QRCode.toDataURL(qrText, { margin: 1, width: 280 });
  link.download = `${String(record?.code || record?.id || "container").replace(/[^\w\-]+/g, "_")}_qr.png`;
  link.click();
  link.remove();
}

