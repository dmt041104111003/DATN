"use client";

export function makeDailyCode(prefix: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `${String(prefix || "").trim().toUpperCase()}_${y}${m}${d}_${seq}`;
}

export function makeContainerCode(seq: number) {
  return `${makeDailyCode("THUNG")}_${String(seq).padStart(3, "0")}`;
}
