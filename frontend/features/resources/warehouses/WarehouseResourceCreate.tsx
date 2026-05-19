"use client";

import { Create, required, SimpleForm, TextInput } from "react-admin";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { MilGrid, MilSection } from "@/features/ui/military/MilSection";
import { CREATE_PAGE_SX, MIL_FORM_SX } from "@/features/resources/shared/styles";
import { WarehouseAdministrativeAreaFields } from "./WarehouseAdministrativeAreaFields";

export function WarehouseResourceCreate() {
  return (
    <Create
      sx={CREATE_PAGE_SX}
      transform={(data: any) => {
        const location = [
          cleanString(data?.warehouseProvinceId),
          cleanString(data?.warehouseDistrictId),
          cleanString(data?.warehouseWardId),
        ].filter(Boolean).join(", ");
        if (!location) throw new Error("Vị trí kho là bắt buộc.");
        return {
          ...data,
          location,
          warehouseProvinceId: undefined,
          warehouseDistrictId: undefined,
          warehouseWardId: undefined,
        };
      }}
    >
      <SimpleForm sx={MIL_FORM_SX}>
        <MilSection index={1} title="Thông tin kho">
          <MilGrid>
            <TextInput source="name" label="Tên kho" validate={[required()]} fullWidth />
            <TextInput source="capacity" label="Sức chứa (kg)" type="number" validate={[required()]} fullWidth />
          </MilGrid>
        </MilSection>
        <MilSection index={2} title="Vị trí kho">
          <MilGrid>
            <WarehouseAdministrativeAreaFields />
          </MilGrid>
        </MilSection>
      </SimpleForm>
    </Create>
  );
}
