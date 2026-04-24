"use client";

import {
  Create,
  Datagrid,
  Edit,
  FileField,
  FileInput,
  ImageField,
  List,
  NumberInput,
  SimpleForm,
  TextField,
  TextInput,
  useGetList,
} from "react-admin";

const required = (value: unknown) =>
  value === null || value === undefined || String(value).trim() === ""
    ? "Required"
    : undefined;

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

export function AreasResourceList() {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="inventoryKey" />
        <TextField source="name" />
        <TextField source="location" />
        <TextField source="areaSize" />
        <TextField source="soilType" />
      </Datagrid>
    </List>
  );
}

export function AreasResourceCreate() {
  const { data: profiles = [] } = useGetList("profile");
  const profile = (profiles as any[])[0] ?? {};
  const owner = String(profile.walletAddress || "").trim();
  const location = String(profile.location || "").trim();

  return (
    <Create
      transform={(data: any) => ({
        ...data,
        areaSize: `${String(data.areaSizeValue ?? "").trim()} ${String(data.areaSizeUnit ?? "").trim()}`.trim(),
      })}
    >
      <SimpleForm
        defaultValues={{
          ownersText: owner,
          location,
          nftImage: null,
        }}
      >
        <TextInput source="ownersText" label="Owners *" disabled validate={[required]} />
        <TextInput source="name" label="Name *" validate={[required]} />
        <TextInput source="location" label="Location *" disabled validate={[required]} />
        <NumberInput source="areaSizeValue" label="Area size value *" validate={[required, positiveNumber]} />
        <TextInput source="areaSizeUnit" label="Area size unit *" validate={[required, unitText]} />
        <TextInput source="soilType" label="Soil type *" validate={[required]} />
        <FileInput
          source="nftImage"
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

export function AreasResourceEdit() {
  const { data: profiles = [] } = useGetList("profile");
  const profile = (profiles as any[])[0] ?? {};
  const owner = String(profile.walletAddress || "").trim();

  return (
    <Edit
      transform={(data: any) => ({
          ...data,
          areaSize: `${String(data.areaSizeValue ?? "").trim()} ${String(data.areaSizeUnit ?? "").trim()}`.trim(),
        })}
    >
      <SimpleForm
        defaultValues={{
          ownersText: owner,
        }}
      >
        <TextInput source="ownersText" label="Owners *" disabled validate={[required]} />
        <TextInput source="inventoryKey" disabled />
        <TextInput source="name" label="Name *" validate={[required]} />
        <TextInput source="location" label="Location *" disabled validate={[required]} />
        <TextInput source="areaSize" label="Area size *" validate={[required]} />
        <TextInput source="soilType" label="Soil type *" validate={[required]} />
        <ImageField source="nftImageUrl" title="nftImageIpfs" label="Current image" />
        <FileInput
          source="nftImage"
          label="Image"
          accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
        >
          <FileField source="title" title="title" />
        </FileInput>
      </SimpleForm>
    </Edit>
  );
}
