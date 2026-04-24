"use client";

import {
  Create,
  DateInput,
  Datagrid,
  Edit,
  FileField,
  FileInput,
  ImageField,
  List,
  NumberInput,
  SelectInput,
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

export function PlansResourceList() {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="inventoryKey" />
        <TextField source="growingAreaInventoryKey" />
        <TextField source="cropType" />
        <TextField source="stage" />
      </Datagrid>
    </List>
  );
}

export function PlansResourceCreate() {
  const { data: areas = [] } = useGetList("areas");

  return (
    <Create>
      <SimpleForm
        defaultValues={{
          seedInvoiceFile: null,
          seedCertificateFile: null,
        }}
      >
        <SelectInput
          source="growingAreaInventoryKey"
          label="Growing area *"
          validate={[required]}
          choices={areas.map((a: any) => ({
            id: a.inventoryKey,
            name: a.inventoryKey,
          }))}
        />
        <TextInput source="cropType" label="Crop type *" validate={[required]} />
        <TextInput source="nurseryBatch" label="Nursery batch *" validate={[required]} />
        <TextInput source="plantingBatch" label="Planting batch *" validate={[required]} />
        <TextInput source="nurseryArea" label="Nursery area *" validate={[required]} />
        <TextInput source="plantingArea" label="Planting area *" validate={[required]} />

        <NumberInput source="seedQuantityValue" label="Input quantity value *" validate={[required, positiveNumber]} />
        <TextInput source="seedQuantityUnit" label="Input quantity unit *" validate={[required, unitText]} />
        <NumberInput source="plantQuantityValue" label="Plant quantity value *" validate={[required, positiveNumber]} />
        <TextInput source="plantQuantityUnit" label="Plant quantity unit *" validate={[required, unitText]} />

        <DateInput source="plannedSeedingDate" label="Planned seeding date *" validate={[required]} />
        <DateInput source="plannedPlantingDate" label="Planned planting date *" validate={[required]} />

        <FileInput
          source="seedInvoiceFile"
          label="Invoice *"
          validate={[required]}
          accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
        >
          <FileField source="title" title="title" />
        </FileInput>
        <FileInput
          source="seedCertificateFile"
          label="Certificate *"
          validate={[required]}
          accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
        >
          <FileField source="title" title="title" />
        </FileInput>
      </SimpleForm>
    </Create>
  );
}

export function PlansResourceEdit() {
  const { data: areas = [] } = useGetList("areas");

  return (
    <Edit>
      <SimpleForm
        defaultValues={{
          harvestImageFile: null,
          packagingImageFile: null,
        }}
      >
        <TextInput source="inventoryKey" disabled />
        <SelectInput
          source="growingAreaInventoryKey"
          label="Growing area *"
          validate={[required]}
          choices={areas.map((a: any) => ({
            id: a.inventoryKey,
            name: a.inventoryKey,
          }))}
        />
        <TextInput source="cropType" label="Crop type *" validate={[required]} />
        <TextInput source="nurseryBatch" label="Nursery batch *" validate={[required]} />
        <TextInput source="plantingBatch" label="Planting batch *" validate={[required]} />
        <TextInput source="nurseryArea" label="Nursery area *" validate={[required]} />
        <TextInput source="plantingArea" label="Planting area *" validate={[required]} />
        <NumberInput source="seedQuantityValue" label="Input quantity value *" validate={[required, positiveNumber]} />
        <TextInput source="seedQuantityUnit" label="Input quantity unit *" validate={[required, unitText]} />
        <NumberInput source="plantQuantityValue" label="Plant quantity value *" validate={[required, positiveNumber]} />
        <TextInput source="plantQuantityUnit" label="Plant quantity unit *" validate={[required, unitText]} />
        <DateInput source="plannedSeedingDate" label="Planned seeding date *" validate={[required]} />
        <DateInput source="plannedPlantingDate" label="Planned planting date *" validate={[required]} />

        <DateInput source="plannedHarvestDate" label="Planned harvest date *" />
        <NumberInput source="expectedHarvestYieldValue" label="Expected harvest yield value *" validate={[positiveNumber]} />
        <TextInput source="expectedHarvestYieldUnit" label="Expected harvest yield unit *" validate={[unitText]} />
        <DateInput source="plannedProcessingDate" label="Planned processing date *" />
        <NumberInput source="expectedProcessingYieldValue" label="Expected processing yield value *" validate={[positiveNumber]} />
        <TextInput source="expectedProcessingYieldUnit" label="Expected processing yield unit *" validate={[unitText]} />
        <ImageField source="harvestImageUrl" title="harvestImageIpfs" label="Current harvest image" />
        <FileInput
          source="harvestImageFile"
          label="Harvest image *"
          accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
        >
          <FileField source="title" title="title" />
        </FileInput>

        <DateInput source="plannedPackagingDate" label="Planned packaging date *" />
        <NumberInput source="expectedPackagingQuantityValue" label="Expected packaging quantity value *" validate={[positiveNumber]} />
        <TextInput source="expectedPackagingQuantityUnit" label="Expected packaging quantity unit *" validate={[unitText]} />
        <DateInput source="expiryDate" label="Expiry date *" />
        <NumberInput source="packagingSpecValue" label="Packaging spec value *" validate={[positiveNumber]} />
        <TextInput source="packagingSpecUnit" label="Packaging spec unit *" validate={[unitText]} />
        <ImageField source="packagingImageUrl" title="packagingImageIpfs" label="Current packaging image" />
        <FileInput
          source="packagingImageFile"
          label="Packaging image *"
          accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
        >
          <FileField source="title" title="title" />
        </FileInput>
      </SimpleForm>
    </Edit>
  );
}
