"use client";

import { SelectInput, TextInput, required } from "react-admin";
import { useWarehouseStorageForm } from "@/hooks/useWarehouseStorageForm";

export function WarehouseStorageForm() {
  const { warehouseChoices, containerChoices, capacityValidator } = useWarehouseStorageForm();

  return (
    <>
      <SelectInput source="warehouseId" label="Kho lưu trữ" choices={warehouseChoices} validate={[required()]} disabled fullWidth />
      <SelectInput source="containerInventoryKey" label="Thùng hàng" choices={containerChoices} validate={[required(), capacityValidator]} disabled fullWidth />
      <TextInput source="conditions" label="Điều kiện bảo quản" fullWidth />
    </>
  );
}
