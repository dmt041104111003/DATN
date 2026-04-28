"use client";

import { required, SelectInput, TextInput } from "react-admin";
import { ROLE_CHOICES } from "./constants";

export function ProfileFormFields({ disableRole = false }: { disableRole?: boolean }) {
  return (
    <>
      <TextInput source="walletAddress" label="Địa chỉ ví" disabled fullWidth />
      <TextInput source="displayName" label="Tên hiển thị" validate={[required()]} fullWidth />
      <TextInput source="phoneNumber" label="Số điện thoại" fullWidth />
      <SelectInput source="roleCode" label="Vai trò" choices={ROLE_CHOICES} validate={[required()]} disabled={disableRole} fullWidth />
    </>
  );
}
