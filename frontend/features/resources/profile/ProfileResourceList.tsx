"use client";

import { Datagrid, List, SelectField, TextField } from "react-admin";
import { ROLE_CHOICES } from "./constants";

export function ProfileResourceList() {
  return (
    <List exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="id" label="Mã hồ sơ" />
        <TextField source="displayName" label="Tên hiển thị" />
        <TextField source="phoneNumber" label="Số điện thoại" />
        <SelectField source="roleCode" label="Vai trò" choices={ROLE_CHOICES} />
      </Datagrid>
    </List>
  );
}

