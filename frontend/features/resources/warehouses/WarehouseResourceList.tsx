"use client";

import { Datagrid, List, TextField } from "react-admin";

export function WarehouseResourceList() {
  return (
    <List exporter={false} actions={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="id" label="Mã kho" />
        <TextField source="name" label="Tên kho" />
        <TextField source="location" label="Vị trí kho" />
        <TextField source="capacity" label="Sức chứa" />
      </Datagrid>
    </List>
  );
}
