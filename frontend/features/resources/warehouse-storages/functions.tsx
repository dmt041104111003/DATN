"use client";

import {
  Create,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  List,
  SelectInput,
  required,
  SimpleForm,
  TextField,
  TextInput,
  useGetList,
} from "react-admin";
import { CREATE_PAGE_SX, EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";

function WarehouseStorageForm() {
  const { data: warehouses = [] } = useGetList("warehouse", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "createdAt", order: "DESC" },
  });
  const { data: containers = [] } = useGetList("container", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "createdAt", order: "DESC" },
  });
  const warehouseChoices = (warehouses || []).map((row: any) => ({
    id: String(row?.id || ""),
    name: `${String(row?.name || "")} - ${String(row?.location || "")}`,
  }));
  const containerChoices = (containers || []).map((row: any) => ({
    id: String(row?.inventoryKey || ""),
    name: `${String(row?.code || "")} - ${String(row?.inventoryKey || "").slice(0, 16)}...`,
  }));

  return (
    <>
      <SelectInput source="warehouseId" label="Kho lưu trữ" choices={warehouseChoices} validate={[required()]} fullWidth />
      <SelectInput
        source="containerInventoryKey"
        label="Thùng hàng"
        choices={containerChoices}
        validate={[required()]}
        fullWidth
      />
      <DateInput source="entryTime" label="Thời điểm nhập kho" validate={[required()]} fullWidth />
      <DateInput source="exitTime" label="Thời điểm xuất kho" fullWidth />
      <TextInput source="conditions" label="Điều kiện bảo quản" fullWidth />
    </>
  );
}

export function WarehouseStorageResourceList() {
  return (
    <List exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="warehouseName" label="Kho" />
        <TextField source="containerCode" label="Thùng hàng" />
        <DateField source="entryTime" label="Nhập kho" showTime />
        <DateField source="exitTime" label="Xuất kho" showTime />
        <TextField source="conditions" label="Điều kiện" />
      </Datagrid>
    </List>
  );
}

export function WarehouseStorageResourceCreate() {
  return (
    <Create sx={CREATE_PAGE_SX}>
      <SimpleForm sx={FORM_SX}>
        <WarehouseStorageForm />
      </SimpleForm>
    </Create>
  );
}

export function WarehouseStorageResourceEdit() {
  return (
    <Edit mutationMode="pessimistic" sx={EDIT_PAGE_SX}>
      <SimpleForm sx={FORM_SX}>
        <WarehouseStorageForm />
      </SimpleForm>
    </Edit>
  );
}

