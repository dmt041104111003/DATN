"use client";

import { Datagrid, EditButton, TextField } from "react-admin";
import { MilList } from "@/features/ui/military/MilList";

function warehouseStoragePath(record: { id?: string }) {
  const warehouseId = String(record?.id ?? "").trim();
  if (!warehouseId) return "/warehouse-storage";
  const filter = encodeURIComponent(JSON.stringify({ warehouseId }));
  return `/warehouse-storage?filter=${filter}`;
}

export function WarehouseResourceList() {
  return (
    <MilList exporter={false} actions={false}>
      <Datagrid
        rowClick={(_id, _resource, record) => warehouseStoragePath(record)}
        bulkActionButtons={false}
      >
        <TextField source="id" label="Mã kho" />
        <TextField source="name" label="Tên kho" />
        <TextField source="location" label="Vị trí kho" />
        <TextField source="capacity" label="Sức chứa" />
        <EditButton label="Sửa" />
      </Datagrid>
    </MilList>
  );
}
