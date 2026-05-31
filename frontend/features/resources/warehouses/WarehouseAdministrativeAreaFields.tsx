"use client";

import { required, SelectInput } from "react-admin";
import { useAdministrativeArea } from "@/hooks/useAdministrativeArea";

export function WarehouseAdministrativeAreaFields() {
  const { choices, provinceId, districtId } = useAdministrativeArea("warehouse");

  return (
    <>
      <SelectInput
        source="warehouseProvinceId"
        label="Tỉnh/Thành kho"
        choices={choices.provinces}
        optionValue="id"
        optionText="name"
        validate={[required()]}
        fullWidth
      />
      <SelectInput
        source="warehouseDistrictId"
        label="Quận/Huyện kho"
        choices={choices.districts}
        optionValue="id"
        optionText="name"
        validate={[required()]}
        disabled={!provinceId}
        fullWidth
      />
      <SelectInput
        source="warehouseWardId"
        label="Phường/Xã kho"
        choices={choices.wards}
        optionValue="id"
        optionText="name"
        validate={[required()]}
        disabled={!districtId}
        fullWidth
      />
    </>
  );
}
