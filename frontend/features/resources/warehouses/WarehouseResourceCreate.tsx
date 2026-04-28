"use client";

import { Create, required, SimpleForm, TextInput } from "react-admin";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { CREATE_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
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
      <SimpleForm sx={FORM_SX}>
        <TextInput source="name" label="Tên kho" validate={[required()]} fullWidth />
        <WarehouseAdministrativeAreaFields />
        <TextInput source="capacity" label="Sức chứa (kg)" type="number" validate={[required()]} fullWidth />
      </SimpleForm>
    </Create>
  );
}
