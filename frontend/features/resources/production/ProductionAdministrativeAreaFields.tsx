"use client";

import { SelectInput } from "react-admin";
import { useAdministrativeArea } from "@/hooks/useAdministrativeArea";

export function ProductionAdministrativeAreaFields({ disabled }: { disabled: boolean }) {
  const { choices, provinceId, districtId } = useAdministrativeArea("production");
  return (
    <>
      <SelectInput source="productionProvinceId" label="Tỉnh/Thành" choices={choices.provinces} optionValue="id" optionText="name" disabled={disabled} fullWidth />
      <SelectInput source="productionDistrictId" label="Quận/Huyện" choices={choices.districts} optionValue="id" optionText="name" disabled={disabled || !provinceId} fullWidth />
      <SelectInput source="productionWardId" label="Xã/Phường" choices={choices.wards} optionValue="id" optionText="name" disabled={disabled || !districtId} fullWidth />
    </>
  );
}

