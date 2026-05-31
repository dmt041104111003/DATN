import { cleanString } from "@/features/core/metadata/share/cleanString";

export function resolveWarehouseIdFromSearch(search: string): string | undefined {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const fromParam = cleanString(params.get("warehouseId"));
  if (fromParam) return fromParam;

  const filterRaw = params.get("filter");
  if (!filterRaw) return undefined;
  try {
    const parsed = JSON.parse(decodeURIComponent(filterRaw)) as { warehouseId?: unknown };
    return cleanString(parsed?.warehouseId);
  } catch {
    return undefined;
  }
}

export function warehouseStorageListPath(warehouseId?: string): string {
  const id = cleanString(warehouseId);
  if (!id) return "/warehouse-storage";
  return `/warehouse-storage?warehouseId=${encodeURIComponent(id)}`;
}
