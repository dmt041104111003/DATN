"use client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export async function fetchCapacitySummary(
  productionInventoryKey: string,
  excludeContainerInventoryKey?: string,
): Promise<{
  totalCapacityKg: number;
  usedCapacityKg: number;
  remainingCapacityKg: number;
}> {
  if (!productionInventoryKey.trim()) {
    return { totalCapacityKg: 0, usedCapacityKg: 0, remainingCapacityKg: 0 };
  }

  const query = new URLSearchParams({
    productionInventoryKey: productionInventoryKey.trim(),
  });
  if (excludeContainerInventoryKey?.trim()) {
    query.set("excludeContainerInventoryKey", excludeContainerInventoryKey.trim());
  }

  const res = await fetch(`${BACKEND_URL}/container/capacity/summary?${query}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

