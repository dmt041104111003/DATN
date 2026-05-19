"use client";

import * as React from "react";
import { useDataProvider, useGetList } from "react-admin";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { parsePositiveNumber } from "@/features/resources/shared/numberHelpers";

const DEFAULT_WAREHOUSE_KEY = "qr-scan-default-warehouse-id";

function getStorageKey(row: any) {
  return cleanString(row?.containerInventoryKey || row?.productId);
}

function getContainerCapacity(row: any) {
  return parsePositiveNumber(row?.weightPerBoxKg || row?.actualCapacityKg || row?.capacityKg);
}

export function useQrScanPage() {
  const dataProvider = useDataProvider();
  const [statusText, setStatusText] = React.useState("");
  const [statusError, setStatusError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [warehouseId, setWarehouseId] = React.useState("");
  const lastInventoryKeyRef = React.useRef("");
  const scanGuardRef = React.useRef(false);
  const resetTimerRef = React.useRef<number | null>(null);

  const { data: warehouses = [] } = useGetList("warehouse", { pagination: { page: 1, perPage: 1000 }, sort: { field: "createdAt", order: "DESC" } });
  const { data: containers = [] } = useGetList("container", { pagination: { page: 1, perPage: 2000 }, sort: { field: "createdAt", order: "DESC" } });
  const { data: storageRows = [], refetch: refetchStorageRows } = useGetList("warehouse-storage", { pagination: { page: 1, perPage: 3000 }, sort: { field: "createdAt", order: "DESC" } });

  React.useEffect(() => {
    const fromStorage = cleanString(window.localStorage.getItem(DEFAULT_WAREHOUSE_KEY));
    if (fromStorage) setWarehouseId(fromStorage);
  }, []);
  React.useEffect(() => {
    if (warehouseId) window.localStorage.setItem(DEFAULT_WAREHOUSE_KEY, warehouseId);
  }, [warehouseId]);
  React.useEffect(() => () => {
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
  }, []);

  const warehouseChoices: Array<{ id: string; name: string }> = [];

  for (let i = 0; i < warehouses.length; i += 1) {
    const row = warehouses[i];
    const id = cleanString(row?.id);
    const text = `${cleanString(row?.name)} - ${cleanString(row?.location)}`;
    warehouseChoices.push({ id, name: text });
  }

  React.useEffect(() => {
    if (!warehouseId && warehouseChoices.length === 1) setWarehouseId(cleanString(warehouseChoices[0]?.id));
  }, [warehouseChoices, warehouseId]);

  const containerByInventoryKey = new Map();

  for (let i = 0; i < containers.length; i += 1) {
    const row = containers[i];
    const inventoryKey = cleanString(row?.inventoryKey);
    containerByInventoryKey.set(inventoryKey, row);
  }

  const insertFromQr = async (inventoryKeyRaw: string) => {
    const inventoryKey = cleanString(inventoryKeyRaw);
    if (!inventoryKey) return void setStatusError("QR không có mã thùng hàng.");
    if (!warehouseId) return void setStatusError("Chọn kho mặc định trước khi quét.");
    if (busy || scanGuardRef.current || lastInventoryKeyRef.current === inventoryKey) return;

    const selectedContainer = containerByInventoryKey.get(inventoryKey);
    if (!selectedContainer) return void setStatusError("Không tìm thấy thùng hàng từ QR.");

    let warehouse = null;

    for (let i = 0; i < warehouses.length; i += 1) {
      const row = warehouses[i];
      const rowId = cleanString(row?.id);
      if (rowId === warehouseId) {
        warehouse = row;
        break;
      }
    }

    if (!warehouse) return void setStatusError("Kho mặc định không hợp lệ.");

    const selectedContainerCapacity = getContainerCapacity(selectedContainer);
    const warehouseCapacity = parsePositiveNumber(warehouse?.capacity);

    let usedCapacity = 0;

    for (let i = 0; i < storageRows.length; i += 1) {
      const row = storageRows[i];
      const rowWarehouseId = cleanString(row?.warehouseId);
      if (rowWarehouseId !== warehouseId) continue;

      const key = getStorageKey(row);
      const container = containerByInventoryKey.get(key);
      const capacity = getContainerCapacity(container);
      usedCapacity += capacity;
    }

    if (warehouseCapacity > 0 && selectedContainerCapacity > 0 && usedCapacity + selectedContainerCapacity > warehouseCapacity) return void setStatusError("Kho đầy.");

    for (let i = 0; i < storageRows.length; i += 1) {
      const row = storageRows[i];
      const key = getStorageKey(row);
      if (key === inventoryKey) {
        setStatusError("Thùng hàng đã ở trong kho.");
        return;
      }
    }

    scanGuardRef.current = true;
    lastInventoryKeyRef.current = inventoryKey;
    setBusy(true);
    setStatusError("");
    setStatusText("");
    try {
      const data = { warehouseId, containerInventoryKey: inventoryKey, conditions: "" };
      await dataProvider.create("warehouse-storage", { data });
      setStatusText(`Đã nhập kho: ${inventoryKey}`);
      void refetchStorageRows();
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Nhập kho thất bại.");
    } finally {
      setBusy(false);
      if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(() => {
        setStatusText("");
        setStatusError("");
        lastInventoryKeyRef.current = "";
        scanGuardRef.current = false;
        resetTimerRef.current = null;
      }, 1200);
    }
  };

  const consumeFromQr = async (inventoryKeyRaw: string) => {
    const inventoryKey = cleanString(inventoryKeyRaw);
    if (!inventoryKey) return void setStatusError("QR không có mã thùng hàng.");
    if (!warehouseId) return void setStatusError("Chọn kho mặc định trước khi quét.");
    if (busy || scanGuardRef.current || lastInventoryKeyRef.current === inventoryKey) return;

    let targetRow: any = null;
    for (let i = 0; i < storageRows.length; i += 1) {
      const row = storageRows[i];
      const rowWarehouseId = cleanString(row?.warehouseId);
      if (rowWarehouseId !== warehouseId) continue;
      const key = getStorageKey(row);
      if (key === inventoryKey) {
        targetRow = row;
        break;
      }
    }
    if (!targetRow) return void setStatusError("Thùng hàng không nằm trong kho để tiêu thụ.");

    scanGuardRef.current = true;
    lastInventoryKeyRef.current = inventoryKey;
    setBusy(true);
    setStatusError("");
    setStatusText("");
    try {
      await dataProvider.delete("warehouse-storage", { id: cleanString(targetRow?.id), previousData: targetRow });
      setStatusText(`Đã tiêu thụ: ${inventoryKey}`);
      void refetchStorageRows();
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Tiêu thụ thất bại.");
    } finally {
      setBusy(false);
      if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = window.setTimeout(() => {
        setStatusText("");
        setStatusError("");
        lastInventoryKeyRef.current = "";
        scanGuardRef.current = false;
        resetTimerRef.current = null;
      }, 1200);
    }
  };

  return { busy, statusText, statusError, warehouseId, setWarehouseId, warehouseChoices, insertFromQr, consumeFromQr };
}
