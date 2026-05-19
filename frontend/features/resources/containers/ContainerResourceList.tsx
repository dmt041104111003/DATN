"use client";

import MuiButton from "@mui/material/Button";
import { BooleanField, Datagrid, DateField, FunctionField, SelectField, TextField } from "react-admin";
import { MilList } from "@/features/ui/military/MilList";
import { downloadContainerQr } from "./downloadContainerQr";

export function ContainerResourceList() {
  return (
    <MilList exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="code" label="Mã thùng" />
        <TextField source="containerType" label="Loại thùng" />
        <FunctionField label="QR" render={(record: any) => <MuiButton size="small" onClick={(e) => { e.stopPropagation(); void downloadContainerQr(record); }}>Tải QR</MuiButton>} />
        <SelectField source="status" label="Trạng thái" choices={[{ id: "CREATE", name: "Đã tạo" }, { id: "UPDATE", name: "Đã cập nhật" }, { id: "CONSUMED", name: "Đã tiêu thụ" }]} />
        <BooleanField source="verified" label="Đã xác thực" />
        <DateField source="verifiedAt" label="Thời gian xác thực" showTime />
      </Datagrid>
    </MilList>
  );
}

