"use client";

import { SelectInput } from "react-admin";
import { useAdministrativeArea } from "@/hooks/useAdministrativeArea";

export function WarehouseAdministrativeAreaFields() {
  const { choices } = useAdministrativeArea("warehouse");

  return (
    <>
      <SelectInput source="warehouseProvinceId" label="Tỉnh/Thành kho" choices={choices.provinces} optionValue="id" optionText="name" fullWidth />
      <SelectInput source="warehouseDistrictId" label="Quận/Huyện kho" choices={choices.districts} optionValue="id" optionText="name" fullWidth />
      <SelectInput source="warehouseWardId" label="Phường/Xã kho" choices={choices.wards} optionValue="id" optionText="name" fullWidth />
    </>
  );
}
