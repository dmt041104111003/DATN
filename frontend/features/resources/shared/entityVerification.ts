export type EntityVerifyType = "PRODUCTION" | "CONTAINER" | "WAREHOUSE_STORAGE";

export function entityKeyFieldFor(type: EntityVerifyType): "inventoryKey" | "id" {
  return type === "WAREHOUSE_STORAGE" ? "id" : "inventoryKey";
}
