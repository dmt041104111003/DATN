"use client";

import { Edit, SaveButton, SimpleForm, TextInput, Toolbar } from "react-admin";
import { EDIT_PAGE_SX, MIL_FORM_SX } from "@/features/resources/shared/styles";
import { useEntityVerificationPoll } from "@/features/resources/shared/useEntityVerificationPoll";
import { MilSection } from "@/features/ui/military/MilSection";

function WarehouseStorageVerificationPoll() {
  useEntityVerificationPoll("WAREHOUSE_STORAGE");
  return null;
}

export function WarehouseStorageResourceEdit() {
  return (
    <Edit
      title="Cập nhật điều kiện bảo quản"
      sx={EDIT_PAGE_SX}
      mutationMode="pessimistic"
      transform={(data: any) => ({
        conditions: String(data?.conditions ?? "").trim(),
      })}
    >
      <SimpleForm
        sx={MIL_FORM_SX}
        toolbar={
          <Toolbar>
            <SaveButton label="Lưu điều kiện" />
          </Toolbar>
        }
      >
        <WarehouseStorageVerificationPoll />
        <MilSection index={1} title="Thùng trong kho">
          <TextInput source="containerCode" label="Mã thùng" disabled fullWidth />
          <TextInput
            source="conditions"
            label="Điều kiện bảo quản"
            multiline
            minRows={3}
            fullWidth
            helperText="Ví dụ: 2–8°C, độ ẩm 85–90%, tránh ánh nắng trực tiếp."
          />
        </MilSection>
      </SimpleForm>
    </Edit>
  );
}
