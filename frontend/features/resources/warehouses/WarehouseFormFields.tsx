"use client";

import { required, TextInput } from "react-admin";
import { MilGrid, MilSection } from "@/features/ui/military/MilSection";
import { WarehouseAdministrativeAreaFields } from "./WarehouseAdministrativeAreaFields";

export function WarehouseFormFields({
  startIndex = 1,
  showWarehouseId = false,
}: {
  startIndex?: number;
  showWarehouseId?: boolean;
}) {
  return (
    <>
      <MilSection index={startIndex} title="Thông tin kho">
        <MilGrid>
          {showWarehouseId ? (
            <TextInput source="warehouseId" label="Mã kho" disabled fullWidth />
          ) : null}
          <TextInput source="name" label="Tên kho" validate={[required()]} fullWidth />
          <TextInput source="capacity" label="Sức chứa (kg)" type="number" validate={[required()]} fullWidth />
        </MilGrid>
      </MilSection>
      <MilSection index={startIndex + 1} title="Vị trí kho">
        <MilGrid>
          <WarehouseAdministrativeAreaFields />
        </MilGrid>
      </MilSection>
    </>
  );
}
