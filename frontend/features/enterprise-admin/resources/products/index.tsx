"use client";

import {
  ArrayInput,
  Create,
  Datagrid,
  Edit,
  FileField,
  FileInput,
  ImageField,
  List,
  NumberInput,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TextField,
  TextInput,
  useGetList,
} from "react-admin";

const required = (value: unknown) =>
  value === null || value === undefined || String(value).trim() === ""
    ? "Required"
    : undefined;

const requiredArray = (value: unknown) =>
  Array.isArray(value) && value.length > 0 ? undefined : "Required";

const positiveNumber = (value: unknown) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "Must be a positive number";
  return undefined;
};

const unitText = (value: unknown) => {
  const s = String(value ?? "").trim();
  if (!s) return "Required";
  if (/^[0-9]+(\.[0-9]+)?$/.test(s)) return "Must be text unit";
  return undefined;
};

export function ProductsResourceList() {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="inventoryKey" />
        <TextField source="lotReference" />
        <TextField source="name" />
        <TextField source="status" />
      </Datagrid>
    </List>
  );
}

export function ProductsResourceCreate() {
  const { data: plans = [] } = useGetList("plans");
  const { data: warehouses = [] } = useGetList("warehouses");

  return (
    <Create>
      <SimpleForm>
        <SelectInput
          source="planInventoryKey"
          label="Plan *"
          validate={[required]}
          choices={plans.map((p: any) => ({
            id: p.inventoryKey,
            name: p.inventoryKey,
          }))}
        />
        <SelectInput
          source="warehouseId"
          label="Inbound warehouse *"
          validate={[required]}
          choices={warehouses.map((w: any) => ({
            id: w.id,
            name: `${w.code} - ${w.name}`,
          }))}
        />
        <TextInput source="tradeTitle" label="Commercial title *" validate={[required]} />
        <TextInput source="lotStory" label="Lot story *" validate={[required]} multiline />
        <ArrayInput source="owners" label="Owners *" validate={[requiredArray]}>
          <SimpleFormIterator inline>
            <TextInput source="" label="Address" validate={[required]} />
          </SimpleFormIterator>
        </ArrayInput>
        <TextInput source="roadmap" label="Roadmap *" validate={[required]} multiline />
        <SelectInput
          source="containerType"
          label="Container type *"
          validate={[required]}
          choices={[
            { id: "Carton", name: "Carton" },
            { id: "Pallet box", name: "Pallet box" },
            { id: "Plastic container", name: "Plastic container" },
          ]}
        />
        <NumberInput
          source="maxWeightValue"
          label="Max weight value *"
          validate={[required, positiveNumber]}
        />
        <TextInput
          source="maxWeightUnit"
          label="Max weight unit *"
          validate={[required, unitText]}
        />
        <NumberInput
          source="maxVolumeValue"
          label="Max volume value *"
          validate={[required, positiveNumber]}
        />
        <TextInput
          source="maxVolumeUnit"
          label="Max volume unit *"
          validate={[required, unitText]}
        />
        <FileInput
          source="image"
          label="Image *"
          validate={[required]}
          accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
        >
          <FileField source="title" title="title" />
        </FileInput>
      </SimpleForm>
    </Create>
  );
}

export function ProductsResourceEdit() {
  const { data: plans = [] } = useGetList("plans");
  const { data: warehouses = [] } = useGetList("warehouses");

  return (
    <Edit>
      <SimpleForm>
        <TextInput source="inventoryKey" disabled />
        <SelectInput
          source="planInventoryKey"
          label="Plan *"
          validate={[required]}
          choices={plans.map((p: any) => ({
            id: p.inventoryKey,
            name: p.inventoryKey,
          }))}
        />
        <SelectInput
          source="warehouseId"
          label="Inbound warehouse *"
          validate={[required]}
          choices={warehouses.map((w: any) => ({
            id: w.id,
            name: `${w.code} - ${w.name}`,
          }))}
        />
        <TextInput source="tradeTitle" label="Commercial title *" validate={[required]} />
        <TextInput source="lotStory" label="Lot story *" validate={[required]} multiline />
        <ArrayInput source="owners" label="Owners *" validate={[requiredArray]}>
          <SimpleFormIterator inline>
            <TextInput source="" label="Address" validate={[required]} />
          </SimpleFormIterator>
        </ArrayInput>
        <TextInput source="roadmap" label="Roadmap *" validate={[required]} multiline />
        <SelectInput
          source="containerType"
          label="Container type *"
          validate={[required]}
          choices={[
            { id: "Carton", name: "Carton" },
            { id: "Pallet box", name: "Pallet box" },
            { id: "Plastic container", name: "Plastic container" },
          ]}
        />
        <NumberInput
          source="maxWeightValue"
          label="Max weight value *"
          validate={[required, positiveNumber]}
        />
        <TextInput
          source="maxWeightUnit"
          label="Max weight unit *"
          validate={[required, unitText]}
        />
        <NumberInput
          source="maxVolumeValue"
          label="Max volume value *"
          validate={[required, positiveNumber]}
        />
        <TextInput
          source="maxVolumeUnit"
          label="Max volume unit *"
          validate={[required, unitText]}
        />
        <ImageField source="imageUrl" title="imageIpfs" label="Current image" />
      </SimpleForm>
    </Edit>
  );
}
