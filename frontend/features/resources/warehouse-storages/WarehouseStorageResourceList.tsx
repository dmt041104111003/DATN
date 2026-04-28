"use client";

import { BooleanField, DateField, Datagrid, List, TextField } from "react-admin";

export function WarehouseStorageResourceList() {
  return (
    <List exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="id" label="Mã lưu trữ" />
        <TextField source="warehouseName" label="Kho" />
        <TextField source="containerCode" label="Thùng hàng" />
        <BooleanField source="verified" label="Đã xác thực" />
        <DateField source="verifiedAt" label="Thời gian xác thực" showTime />
        <TextField source="conditions" label="Điều kiện" />
      </Datagrid>
    </List>
  );
}

