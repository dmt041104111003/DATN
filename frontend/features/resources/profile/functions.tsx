"use client";

import {
  Create,
  Edit,
  List,
  SimpleForm,
  TextField,
  TextInput,
  Datagrid,
  SelectInput,
  SelectField,
  required,
} from "react-admin";
import { ROLE_CHOICES } from "./constants";

export function ProfileResourceCreate(props: any) {
  const { defaultValues, ...rest } = props || {};
  return (
    <Create {...rest}>
      <SimpleForm defaultValues={defaultValues}>
        <TextInput source="walletAddress" label="Địa chỉ ví" disabled fullWidth />
        <TextInput source="displayName" label="Tên hiển thị" validate={[required()]} fullWidth />
        <TextInput source="phoneNumber" label="Số điện thoại" fullWidth />
        <SelectInput source="roleCode" label="Vai trò" choices={ROLE_CHOICES} validate={[required()]} fullWidth />
      </SimpleForm>
    </Create>
  );
}

export function ProfileResourceList() {
  return (
    <List exporter={false}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="id" label="Mã hồ sơ" />
        <TextField source="displayName" label="Tên hiển thị" />
        <TextField source="phoneNumber" label="Số điện thoại" />
        <SelectField source="roleCode" label="Vai trò" choices={ROLE_CHOICES} />
      </Datagrid>
    </List>
  );
}

export function ProfileResourceEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="walletAddress" label="Địa chỉ ví" disabled fullWidth />
        <TextInput source="displayName" label="Tên hiển thị" validate={[required()]} fullWidth />
        <TextInput source="phoneNumber" label="Số điện thoại" fullWidth />
        <SelectInput source="roleCode" label="Vai trò" choices={ROLE_CHOICES} disabled fullWidth />
      </SimpleForm>
    </Edit>
  );
}
