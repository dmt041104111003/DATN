"use client";

import {
  Edit,
  List,
  SimpleForm,
  TextField,
  TextInput,
  Datagrid,
} from "react-admin";

const required = (value: unknown) =>
  value === null || value === undefined || String(value).trim() === ""
    ? "Required"
    : undefined;

export function ProfileResourceList() {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="displayName" />
        <TextField source="location" />
        <TextField source="roleCode" />
      </Datagrid>
    </List>
  );
}

export function ProfileResourceEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="displayName" validate={[required]} />
        <TextInput source="location" validate={[required]} />
      </SimpleForm>
    </Edit>
  );
}
