"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
import { useFormContext, useWatch } from "react-hook-form";
import { CREATE_PAGE_SX, EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import {
  getDistrictOptions,
  getProvinceOptions,
  getWardOptions,
  type Option,
} from "@/features/resources/shared/location";

function makePartnerCode() {
  return `DVLK_${Date.now()}`;
}

function PartnerAreaInputs() {
  const { setValue } = useFormContext();
  const provinceId = String(useWatch({ name: "provinceId" }) ?? "");
  const districtId = String(useWatch({ name: "districtId" }) ?? "");
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [wards, setWards] = useState<Option[]>([]);
  const prevProvinceRef = React.useRef<string>("");
  const prevDistrictRef = React.useRef<string>("");

  useEffect(() => {
    getProvinceOptions().then(setProvinces).catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      setWards([]);
      return;
    }
    getDistrictOptions(provinceId).then(setDistricts).catch(() => setDistricts([]));
  }, [provinceId]);

  useEffect(() => {
    if (!districtId) {
      setWards([]);
      return;
    }
    getWardOptions(districtId).then(setWards).catch(() => setWards([]));
  }, [districtId]);

  useEffect(() => {
    if (!prevProvinceRef.current) {
      prevProvinceRef.current = provinceId;
      return;
    }
    if (prevProvinceRef.current !== provinceId) {
      setValue("districtId", "");
      setValue("wardId", "");
      setWards([]);
      prevProvinceRef.current = provinceId;
    }
  }, [provinceId, setValue]);

  useEffect(() => {
    if (!prevDistrictRef.current) {
      prevDistrictRef.current = districtId;
      return;
    }
    if (prevDistrictRef.current !== districtId) {
      setValue("wardId", "");
      prevDistrictRef.current = districtId;
    }
  }, [districtId, setValue]);

  return (
    <>
      <SelectInput source="provinceId" label="Tỉnh/Thành" choices={provinces} validate={[required()]} fullWidth />
      <SelectInput
        source="districtId"
        label="Quận/Huyện"
        choices={districts}
        validate={[required()]}
        disabled={!provinceId}
        fullWidth
      />
      <SelectInput
        source="wardId"
        label="Phường/Xã"
        choices={wards}
        validate={[required()]}
        disabled={!districtId}
        fullWidth
      />
    </>
  );
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
        <PartnerAreaInputs />
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
        <PartnerAreaInputs />
        <TextInput source="note" label="Ghi chú" multiline minRows={3} fullWidth />
      </SimpleForm>
    </Edit>
  );
}

