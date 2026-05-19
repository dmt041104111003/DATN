"use client";

import { SelectInput, TextInput, required } from "react-admin";
import { MilGrid, MilSection } from "@/features/ui/military/MilSection";
import { useWarehouseStorageForm } from "@/hooks/useWarehouseStorageForm";

export function WarehouseStorageForm() {
  const { warehouseChoices, containerChoices, capacityValidator } = useWarehouseStorageForm();

  return (
    <MilSection index={1} title="Thông tin nhập kho">
      <MilGrid>
        <SelectInput source="warehouseId" label="Kho lưu trữ" choices={warehouseChoices} validate={[required()]} disabled fullWidth />
        <SelectInput source="containerInventoryKey" label="Thùng hàng" choices={containerChoices} validate={[required(), capacityValidator]} disabled fullWidth />
        <div className="md:col-span-2">
          <TextInput source="conditions" label="Điều kiện bảo quản" fullWidth />
        </div>
      </MilGrid>
    </MilSection>
  );
}
