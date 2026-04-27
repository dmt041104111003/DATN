"use client";

import * as React from "react";
import {
  Create,
  Datagrid,
  Edit,
  List,
  required,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
} from "react-admin";
import { useWatch } from "react-hook-form";
import { CREATE_PAGE_SX, EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import { getDistrictOptions, getProvinceOptions, getWardOptions, type Option } from "@/features/resources/shared/location";

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

function WarehouseAdministrativeAreaFields() {
  const provinceId = String(useWatch({ name: "warehouseProvinceId" }) ?? "");
  const districtId = String(useWatch({ name: "warehouseDistrictId" }) ?? "");
  const [provinces, setProvinces] = React.useState<Option[]>([]);
  const [districts, setDistricts] = React.useState<Option[]>([]);
  const [wards, setWards] = React.useState<Option[]>([]);
  React.useEffect(() => {
    let mounted = true;
    getProvinceOptions().then((rows) => mounted && setProvinces(rows)).catch(() => mounted && setProvinces([]));
    return () => { mounted = false; };
  }, []);
  React.useEffect(() => {
    let mounted = true;
    if (!provinceId) { setDistricts([]); setWards([]); return () => { mounted = false; }; }
    getDistrictOptions(provinceId).then((rows) => mounted && setDistricts(rows)).catch(() => mounted && setDistricts([]));
    return () => { mounted = false; };
  }, [provinceId]);
  React.useEffect(() => {
    let mounted = true;
    if (!districtId) { setWards([]); return () => { mounted = false; }; }
    getWardOptions(districtId).then((rows) => mounted && setWards(rows)).catch(() => mounted && setWards([]));
    return () => { mounted = false; };
  }, [districtId]);
  return (
    <>
      <SelectInput source="warehouseProvinceId" label="Tỉnh/Thành kho" choices={provinces} optionValue="id" optionText="name" fullWidth />
      <SelectInput source="warehouseDistrictId" label="Quận/Huyện kho" choices={districts} optionValue="id" optionText="name" fullWidth />
      <SelectInput source="warehouseWardId" label="Phường/Xã kho" choices={wards} optionValue="id" optionText="name" fullWidth />
    </>
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
        <WarehouseAdministrativeAreaFields />
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
      <SimpleForm
        sx={FORM_SX}
        defaultValues={(record: any) => {
          const parsed = parseLocation(record?.location);
          return {
            ...record,
            warehouseProvinceId: parsed.warehouseProvinceId,
            warehouseDistrictId: parsed.warehouseDistrictId,
            warehouseWardId: parsed.warehouseWardId,
          };
        }}
      >
        <TextInput source="name" label="Tên kho" validate={[required()]} fullWidth />
        <WarehouseAdministrativeAreaFields />
        <TextInput source="capacity" label="Sức chứa (kg)" type="number" validate={[required()]} fullWidth />
      </SimpleForm>
    </Edit>
  );
}

