"use client";

import {
  Create,
  Datagrid,
  DateField,
  Edit,
  List,
  SelectInput,
  required,
  SimpleForm,
  TextField,
  TextInput,
  useGetList,
  useRecordContext,
} from "react-admin";
import { useWatch } from "react-hook-form";
import { CREATE_PAGE_SX, EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function parsePositiveNumber(value: unknown) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function WarehouseStorageForm() {
  const record = useRecordContext<any>();
  const currentStorageId = cleanString(record?.id);
  const warehouseId = cleanString(useWatch({ name: "warehouseId" }));
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
  const warehouseById = new Map(
    (warehouses || []).map((row: any) => [cleanString(row?.id), row]),
  );
  const containerByInventoryKey = new Map(
    (containers || []).map((row: any) => [cleanString(row?.inventoryKey), row]),
  );
  const warehouseChoices = (warehouses || []).map((row: any) => ({
    id: String(row?.id || ""),
    name: `${String(row?.name || "")} - ${String(row?.location || "")}`,
  }));
  const containerChoices = (containers || []).map((row: any) => ({
    id: String(row?.inventoryKey || ""),
    name: `${String(row?.code || "")} - ${String(row?.inventoryKey || "").slice(0, 16)}...`,
  }));
  const capacityValidator = (containerInventoryKeyRaw: unknown) => {
    const selectedWarehouseId = warehouseId;
    const selectedContainerKey = cleanString(containerInventoryKeyRaw);
    if (!selectedWarehouseId || !selectedContainerKey) return undefined;
    const warehouse = warehouseById.get(selectedWarehouseId);
    const selectedContainer = containerByInventoryKey.get(selectedContainerKey);
    const warehouseCapacity = parsePositiveNumber(warehouse?.capacity);
    const selectedContainerCapacity = parsePositiveNumber(selectedContainer?.actualCapacityKg || selectedContainer?.capacityKg);
    const usedCapacity = (storageRows || [])
      .filter((row: any) => cleanString(row?.warehouseId) === selectedWarehouseId)
      .filter((row: any) => cleanString(row?.id) !== currentStorageId)
      .reduce((sum: number, row: any) => {
        const key = cleanString(row?.containerInventoryKey || row?.productId);
        const c = containerByInventoryKey.get(key);
        return sum + parsePositiveNumber(c?.actualCapacityKg || c?.capacityKg);
      }, 0);
    if (!warehouseCapacity || !selectedContainerCapacity) return undefined;
    if (usedCapacity + selectedContainerCapacity > warehouseCapacity) {
      return `Vượt sức chứa kho. Còn lại: ${Math.max(warehouseCapacity - usedCapacity, 0)} kg.`;
    }
    return undefined;
  };

  return (
    <>
      <SelectInput source="warehouseId" label="Kho lưu trữ" choices={warehouseChoices} validate={[required()]} fullWidth />
      <SelectInput
        source="containerInventoryKey"
        label="Thùng hàng"
        choices={containerChoices}
        validate={[required(), capacityValidator]}
        fullWidth
      />
      <TextInput source="conditions" label="Điều kiện bảo quản" fullWidth />
    </>
  );
}

export function WarehouseStorageResourceList() {
  return (
    <List exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="id" label="Mã lưu trữ" />
        <TextField source="warehouseName" label="Kho" />
        <TextField source="containerCode" label="Thùng hàng" />
        <DateField source="createdAt" label="Nhập kho" showTime />
        <DateField source="updatedAt" label="Cập nhật" showTime />
        <TextField source="conditions" label="Điều kiện" />
      </Datagrid>
    </List>
  );
}

export function WarehouseStorageResourceCreate() {
  return (
    <Create sx={CREATE_PAGE_SX}>
      <SimpleForm sx={FORM_SX}>
        <WarehouseStorageForm />
      </SimpleForm>
    </Create>
  );
}

export function WarehouseStorageResourceEdit() {
  return (
    <Edit mutationMode="pessimistic" sx={EDIT_PAGE_SX}>
      <SimpleForm sx={FORM_SX}>
        <WarehouseStorageForm />
      </SimpleForm>
    </Edit>
  );
}

