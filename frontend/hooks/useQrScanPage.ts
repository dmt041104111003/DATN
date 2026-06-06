"use client";

import * as React from "react";
import { useDataProvider, useGetList } from "react-admin";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { parsePositiveNumber } from "@/features/resources/shared/numberHelpers";
import { useListVerificationPoll } from "@/features/resources/shared/useListVerificationPoll";

function getStorageKey(row: any) {
  return cleanString(row?.containerInventoryKey || row?.productId);
}

function getContainerCapacity(row: any) {
  return parsePositiveNumber(row?.weightPerBoxKg || row?.actualCapacityKg || row?.capacityKg);
}

function buildWarehouseChoices(warehouses: any[]) {
  const choices: Array<{ id: string; name: string }> = [];
  for (let i = 0; i < warehouses.length; i += 1) {
    const row = warehouses[i];
    const id = cleanString(row?.id);
    if (!id) continue;
    choices.push({
      id,
      name: `${cleanString(row?.name)} — ${cleanString(row?.location)}`.replace(/^ — | — $/g, "").trim() || id,
    });
  }
  return choices;
}

export function useQrScanPage() {
  const dataProvider = useDataProvider();
  const [statusText, setStatusText] = React.useState("");
  const [statusError, setStatusError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const lastInventoryKeyRef = React.useRef("");
  const scanGuardRef = React.useRef(false);
  const resetTimerRef = React.useRef<number | null>(null);

  const {
    data: warehouses = [],
    isLoading: warehousesLoading,
    isFetching: warehousesFetching,
  } = useGetList("warehouse", {
    pagination: { page: 1, perPage: 10 },
    sort: { field: "createdAt", order: "DESC" },
  });
  const { data: containers = [] } = useGetList("container", {
    pagination: { page: 1, perPage: 2000 },
    sort: { field: "createdAt", order: "DESC" },
  });
  const { data: storageRows = [], refetch: refetchStorageRows } = useGetList("warehouse-storage", {
    pagination: { page: 1, perPage: 3000 },
    sort: { field: "createdAt", order: "DESC" },
  });
  useListVerificationPoll("WAREHOUSE_STORAGE", storageRows, refetchStorageRows);

  const warehouseChoices = React.useMemo(() => buildWarehouseChoices(warehouses), [warehouses]);
  const activeWarehouse = warehouseChoices[0] ?? null;
  const warehouseId = activeWarehouse?.id ?? "";
  const warehouseReady = !warehousesLoading && !warehousesFetching && Boolean(warehouseId);

  React.useEffect(() => () => {
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
  }, []);

  const containerByInventoryKey = React.useMemo(() => {
    const map = new Map<string, any>();
    for (let i = 0; i < containers.length; i += 1) {
      const row = containers[i];
      const inventoryKey = cleanString(row?.inventoryKey);
      if (inventoryKey) map.set(inventoryKey, row);
    }
    return map;
  }, [containers]);

  const warehouseById = React.useMemo(() => {
    const map = new Map<string, any>();
    for (let i = 0; i < warehouses.length; i += 1) {
      const row = warehouses[i];
      const id = cleanString(row?.id);
      if (id) map.set(id, row);
    }
    return map;
  }, [warehouses]);

  const warehouseBusyMessage = () => {
    if (warehousesLoading || warehousesFetching) return "Đang tải thông tin kho...";
    if (!warehouseId) return "Chưa có kho gắn với tài khoản. Hoàn tất hồ sơ và khai báo kho trước khi quét.";
    return "";
  };

  const insertFromQr = async (inventoryKeyRaw: string) => {
    const inventoryKey = cleanString(inventoryKeyRaw);
    if (!inventoryKey) return void setStatusError("QR không có mã thùng hàng.");
    const busyMsg = warehouseBusyMessage();
    if (busyMsg) return void setStatusError(busyMsg);
    if (busy || scanGuardRef.current || lastInventoryKeyRef.current === inventoryKey) return;

    const selectedContainer = containerByInventoryKey.get(inventoryKey);
    if (!selectedContainer) return void setStatusError("Không tìm thấy thùng hàng từ QR.");

    const warehouse = warehouseById.get(warehouseId);
    if (!warehouse) return void setStatusError("Không tải được thông tin kho.");

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

    if (warehouseCapacity > 0 && selectedContainerCapacity > 0 && usedCapacity + selectedContainerCapacity > warehouseCapacity) {
      return void setStatusError("Kho đầy.");
    }

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

  const removeStorageFromQr = async (
    inventoryKeyRaw: string,
    labels: { notInWarehouse: string; success: string; fail: string },
  ) => {
    const inventoryKey = cleanString(inventoryKeyRaw);
    if (!inventoryKey) return void setStatusError("QR không có mã thùng hàng.");
    const busyMsg = warehouseBusyMessage();
    if (busyMsg) return void setStatusError(busyMsg);
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
    if (!targetRow) return void setStatusError(labels.notInWarehouse);

    scanGuardRef.current = true;
    lastInventoryKeyRef.current = inventoryKey;
    setBusy(true);
    setStatusError("");
    setStatusText("");
    try {
      await dataProvider.delete("warehouse-storage", { id: cleanString(targetRow?.id), previousData: targetRow });
      setStatusText(labels.success.replace("{key}", inventoryKey));
      void refetchStorageRows();
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : labels.fail);
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

  const exportFromQr = (inventoryKeyRaw: string) =>
    removeStorageFromQr(inventoryKeyRaw, {
      notInWarehouse: "Thùng hàng không nằm trong kho để xuất.",
      success: "Đã xuất kho: {key}",
      fail: "Xuất kho thất bại.",
    });

  const consumeFromQr = (inventoryKeyRaw: string) =>
    removeStorageFromQr(inventoryKeyRaw, {
      notInWarehouse: "Thùng hàng không nằm trong kho để tiêu thụ.",
      success: "Đã tiêu thụ: {key}",
      fail: "Tiêu thụ thất bại.",
    });

  return {
    busy,
    statusText,
    statusError,
    warehouseReady,
    warehouseLoading: warehousesLoading || warehousesFetching,
    activeWarehouse,
    insertFromQr,
    exportFromQr,
    consumeFromQr,
  };
}
