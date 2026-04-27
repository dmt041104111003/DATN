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
} from "react-admin";
import { CREATE_PAGE_SX, EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import { AdministrativeAreaFields } from "@/features/resources/shared/areaFields";

function makePartnerCode() {
  return `DVLK_${Date.now()}`;
}

export function PartnerResourceList() {
  return (
    <List exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="code" label="Mã đơn vị liên kết" />
        <TextField source="displayName" label="Tên đơn vị" />
        <TextField source="walletAddress" label="Địa chỉ ví" />
      </Datagrid>
    </List>
  );
}

export function PartnerResourceCreate() {
  return (
    <Create
      sx={CREATE_PAGE_SX}
      transform={(data: any) => ({
        ...data,
        code: String(data?.code || "").trim() || makePartnerCode(),
      })}
    >
      <SimpleForm
        sx={FORM_SX}
        defaultValues={{
          code: makePartnerCode(),
        }}
      >
        <TextInput source="code" label="Mã đơn vị liên kết" disabled fullWidth />
        <TextInput source="displayName" label="Tên đơn vị" validate={[required()]} fullWidth />
        <TextInput source="walletAddress" label="Địa chỉ ví" validate={[required()]} disabled fullWidth />
        <AdministrativeAreaFields provinceSource="provinceId" districtSource="districtId" wardSource="wardId" />
        <TextInput source="note" label="Ghi chú" multiline minRows={3} fullWidth />
      </SimpleForm>
    </Create>
  );
}

export function PartnerResourceEdit() {
  return (
    <Edit sx={EDIT_PAGE_SX} mutationMode="pessimistic">
      <SimpleForm sx={FORM_SX}>
        <TextInput source="code" label="Mã đơn vị liên kết" disabled fullWidth />
        <TextInput source="displayName" label="Tên đơn vị" validate={[required()]} fullWidth />
        <TextInput source="walletAddress" label="Địa chỉ ví" validate={[required()]} disabled fullWidth />
        <AdministrativeAreaFields provinceSource="provinceId" districtSource="districtId" wardSource="wardId" />
        <TextInput source="note" label="Ghi chú" multiline minRows={3} fullWidth />
      </SimpleForm>
    </Edit>
  );
}

