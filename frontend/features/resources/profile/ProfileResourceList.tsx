"use client";

import { Datagrid, SelectField, TextField } from "react-admin";
import { MilList } from "@/features/ui/military/MilList";
import { ROLE_CHOICES } from "./constants";

export function ProfileResourceList() {
  return (
    <MilList exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="id" label="Mã hồ sơ" />
        <TextField source="displayName" label="Tên hiển thị" />
        <TextField source="phoneNumber" label="Số điện thoại" />
        <SelectField source="roleCode" label="Vai trò" choices={ROLE_CHOICES} />
      </Datagrid>
    </MilList>
  );
}

