"use client";

import * as React from "react";
import {
  Create,
  Datagrid,
  Edit,
  List,
  required,
  SimpleForm,
  TextField,
  TextInput,
  useRecordContext,
} from "react-admin";
import { useFormContext } from "react-hook-form";
import { CREATE_PAGE_SX, EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import { AdministrativeAreaFields } from "@/features/resources/shared/areaFields";

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function parseLocation(value: unknown) {
  const parts = cleanString(value)
    .split(",")
    .map((x) => cleanString(x));
  return {
    warehouseProvinceId: parts[0] || "",
    warehouseDistrictId: parts[1] || "",
    warehouseWardId: parts[2] || "",
  };
}

function buildLocation(formData: any) {
  const province = cleanString(formData?.warehouseProvinceId);
  const district = cleanString(formData?.warehouseDistrictId);
  const ward = cleanString(formData?.warehouseWardId);
  return [province, district, ward].filter(Boolean).join(", ");
}

function WarehouseLocationFields() {
  const record = useRecordContext<any>();
  const { setValue } = useFormContext();
  const initedRef = React.useRef(false);

  React.useEffect(() => {
    if (initedRef.current) return;
    const parsed = parseLocation(record?.location);
    setValue("warehouseProvinceId", parsed.warehouseProvinceId, { shouldDirty: false, shouldValidate: false });
    setValue("warehouseDistrictId", parsed.warehouseDistrictId, { shouldDirty: false, shouldValidate: false });
    setValue("warehouseWardId", parsed.warehouseWardId, { shouldDirty: false, shouldValidate: false });
    initedRef.current = true;
  }, [record, setValue]);

  return (
    <AdministrativeAreaFields
      provinceSource="warehouseProvinceId"
      districtSource="warehouseDistrictId"
      wardSource="warehouseWardId"
      provinceLabel="Tỉnh/Thành kho"
      districtLabel="Quận/Huyện kho"
      wardLabel="Phường/Xã kho"
      requiredAll={false}
    />
  );
}

export function WarehouseResourceList() {
  return (
    <List exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="id" label="Mã kho" />
        <TextField source="name" label="Tên kho" />
        <TextField source="location" label="Vị trí kho" />
        <TextField source="capacity" label="Sức chứa" />
      </Datagrid>
    </List>
  );
}

export function WarehouseResourceCreate() {
  return (
    <Create
      sx={CREATE_PAGE_SX}
      transform={(data: any) => {
        const location = buildLocation(data);
        if (!location) throw new Error("Vị trí kho là bắt buộc.");
        return {
          ...data,
          location,
          warehouseProvinceId: undefined,
          warehouseDistrictId: undefined,
          warehouseWardId: undefined,
        };
      }}
    >
      <SimpleForm sx={FORM_SX}>
        <TextInput source="name" label="Tên kho" validate={[required()]} fullWidth />
        <WarehouseLocationFields />
        <TextInput source="capacity" label="Sức chứa (kg)" type="number" validate={[required()]} fullWidth />
      </SimpleForm>
    </Create>
  );
}

export function WarehouseResourceEdit() {
  return (
    <Edit
      mutationMode="pessimistic"
      sx={EDIT_PAGE_SX}
      transform={(data: any) => {
        const location = buildLocation(data);
        if (!location) throw new Error("Vị trí kho là bắt buộc.");
        return {
          ...data,
          location,
          warehouseProvinceId: undefined,
          warehouseDistrictId: undefined,
          warehouseWardId: undefined,
        };
      }}
    >
      <SimpleForm sx={FORM_SX}>
        <TextInput source="name" label="Tên kho" validate={[required()]} fullWidth />
        <WarehouseLocationFields />
        <TextInput source="capacity" label="Sức chứa (kg)" type="number" validate={[required()]} fullWidth />
      </SimpleForm>
    </Edit>
  );
}

