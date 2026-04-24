"use client";

import {
  Create,
  Datagrid,
  Edit,
  List,
  NumberField,
  NumberInput,
  SimpleForm,
  TextField,
  TextInput,
} from "react-admin";

const required = (value: unknown) =>
  value === null || value === undefined || String(value).trim() === ""
    ? "Required"
    : undefined;

const positiveNumber = (value: unknown) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return "Must be a positive number";
  }
  return undefined;
};

export function WarehouseList() {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="code" />
        <TextField source="name" />
        <NumberField source="maxProducts" />
        <NumberField source="productCount" />
      </Datagrid>
    </List>
  );
}

export function WarehouseCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="code" validate={[required]} />
        <TextInput source="name" validate={[required]} />
        <NumberInput
          source="maxProducts"
          validate={[required, positiveNumber]}
          min={1}
        />
      </SimpleForm>
    </Create>
  );
}

export function WarehouseEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput source="id" disabled />
        <TextInput source="code" disabled />
        <TextInput source="name" validate={[required]} />
        <NumberInput
          source="maxProducts"
          validate={[required, positiveNumber]}
          min={1}
        />
      </SimpleForm>
    </Edit>
  );
}
