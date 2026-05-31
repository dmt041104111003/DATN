"use client";

import { required, SelectInput, TextInput } from "react-admin";
import { MilGrid, MilSection } from "@/features/ui/military/MilSection";
import { WarehouseFormFields } from "@/features/resources/warehouses/WarehouseFormFields";
import { ROLE_CHOICES } from "./constants";

export function ProfileFormSections({
  disableRole = false,
  showWarehouseId = false,
}: {
  disableRole?: boolean;
  showWarehouseId?: boolean;
}) {
  return (
    <>
      <MilSection index={1} title="Thông tin tài khoản">
        <MilGrid>
          <TextInput source="walletAddress" label="Địa chỉ ví" disabled fullWidth />
          <TextInput source="displayName" label="Tên hiển thị" validate={[required()]} fullWidth />
          <TextInput source="phoneNumber" label="Số điện thoại" fullWidth />
          <SelectInput
            source="roleCode"
            label="Vai trò"
            choices={ROLE_CHOICES}
            validate={[required()]}
            disabled={disableRole}
            fullWidth
          />
        </MilGrid>
      </MilSection>
      <WarehouseFormFields startIndex={2} showWarehouseId={showWarehouseId} />
    </>
  );
}
