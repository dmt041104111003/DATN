"use client";

import { useGetList, useRecordContext } from "react-admin";
import { useWatch } from "react-hook-form";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { parsePositiveNumber } from "@/features/resources/shared/numberHelpers";

export function useWarehouseStorageForm() {
  const record = useRecordContext<any>();
  const watchedWarehouseId = useWatch({ name: "warehouseId" });
  const currentStorageId = record ? cleanString(record.id) : "";
  const warehouseId = cleanString(watchedWarehouseId);

  const { data: warehouses = [] } = useGetList("warehouse", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "createdAt", order: "DESC" },
  });
  const { data: containers = [] } = useGetList("container", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "createdAt", order: "DESC" },
  });
  const { data: storageRows = [] } = useGetList("warehouse-storage", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "createdAt", order: "DESC" },
  });

  const warehouseChoices: Array<{ id: string; name: string }> = [];
  const containerChoices: Array<{ id: string; name: string }> = [];

  for (let i = 0; i < warehouses.length; i += 1) {
    const row = warehouses[i];
    const id = cleanString(row?.id);
    const name = String(row?.name || "");
    const location = String(row?.location || "");
    warehouseChoices.push({ id, name: `${name} - ${location}` });
  }

  for (let i = 0; i < containers.length; i += 1) {
    const row = containers[i];
    const inventoryKey = cleanString(row?.inventoryKey);
    const code = String(row?.code || "");
    containerChoices.push({
      id: inventoryKey,
      name: `${code} - ${inventoryKey.slice(0, 16)}...`,
    });
  }

  const capacityValidator = (containerInventoryKeyRaw: unknown) => {
    const selectedContainerKey = cleanString(containerInventoryKeyRaw);
    if (!warehouseId || !selectedContainerKey) return undefined;

    let warehouse = null;

    for (let i = 0; i < warehouses.length; i += 1) {
      const row = warehouses[i];
      const id = cleanString(row?.id);
      if (id === warehouseId) {
        warehouse = row;
        break;
      }
    }

    let selectedContainer = null;

    for (let i = 0; i < containers.length; i += 1) {
      const row = containers[i];
      const inventoryKey = cleanString(row?.inventoryKey);
      if (inventoryKey === selectedContainerKey) {
        selectedContainer = row;
        break;
      }
    }

    const warehouseCapacity = parsePositiveNumber(warehouse?.capacity);
    const selectedContainerCapacity = parsePositiveNumber(
      selectedContainer?.weightPerBoxKg || selectedContainer?.actualCapacityKg || selectedContainer?.capacityKg,
    );

    let usedCapacity = 0;

    for (let i = 0; i < storageRows.length; i += 1) {
      const row = storageRows[i];
      const rowWarehouseId = cleanString(row?.warehouseId);
      const rowId = cleanString(row?.id);
      if (rowWarehouseId !== warehouseId) continue;
      if (rowId === currentStorageId) continue;

      const key = cleanString(row?.containerInventoryKey || row?.productId);
      let container = null;

      for (let j = 0; j < containers.length; j += 1) {
        const containerRow = containers[j];
        const inventoryKey = cleanString(containerRow?.inventoryKey);
        if (inventoryKey === key) {
          container = containerRow;
          break;
        }
      }

      const capacity = parsePositiveNumber(
        container?.weightPerBoxKg || container?.actualCapacityKg || container?.capacityKg,
      );
      usedCapacity += capacity;
    }

    if (!warehouseCapacity || !selectedContainerCapacity) return undefined;

    if (usedCapacity + selectedContainerCapacity <= warehouseCapacity) {
      return undefined;
    }

    const remainingCapacity = Math.max(warehouseCapacity - usedCapacity, 0);
    return `Vượt sức chứa kho. Còn lại: ${remainingCapacity} kg.`;
  };

  return { warehouseChoices, containerChoices, capacityValidator };
}

