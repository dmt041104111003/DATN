"use client";

import {
  BooleanField,
  Datagrid,
  DateField,
  SelectField,
  TextField,
} from "react-admin";
import { ListVerificationPoll } from "@/features/resources/shared/ListVerificationPoll";
import { MilList } from "@/features/ui/military/MilList";

export function ProductionResourceList() {
  return (
    <MilList exporter={false}>
      <ListVerificationPoll entityType="PRODUCTION" />
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="id" label="Mã vụ" />
        <TextField source="facilityId" label="Cơ sở" />
        <TextField source="cropType" label="Loại cây" />
        <SelectField
          source="status"
          label="Trạng thái"
          choices={[
            { id: "CREATED", name: "Đã tạo" },
            { id: "UPDATED", name: "Đã cập nhật" },
            { id: "CLOSED", name: "Đã đóng vụ" },
          ]}
        />
        <BooleanField source="verified" label="Đã xác thực" />
        <DateField source="verifiedAt" label="Thời gian xác thực" showTime />
        <DateField source="seedingDate" label="Ngày gieo" />
        <DateField source="harvestDate" label="Ngày thu hoạch" />
        <TextField source="actualYieldKg" label="Sản lượng thực tế (kg)" />
      </Datagrid>
    </MilList>
  );
}
