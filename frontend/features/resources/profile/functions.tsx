"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
import { useFormContext, useWatch } from "react-hook-form";
import {
  getDistrictOptions,
  getProvinceOptions,
  getWardOptions,
  type Option,
} from "@/features/resources/shared/location";
import { ROLE_CHOICES } from "./constants";

function ProfileAreaInputs() {
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

export function ProfileResourceCreate(props: any) {
  const { defaultValues, ...rest } = props || {};
  return (
    <Create {...rest}>
      <SimpleForm defaultValues={defaultValues}>
        <TextInput source="walletAddress" label="Địa chỉ ví" disabled fullWidth />
        <TextInput source="displayName" label="Tên hiển thị" validate={[required()]} fullWidth />
        <TextInput source="phoneNumber" label="Số điện thoại" fullWidth />
        <ProfileAreaInputs />
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
        <TextField source="provinceId" label="Tỉnh/Thành" />
        <TextField source="districtId" label="Quận/Huyện" />
        <TextField source="wardId" label="Phường/Xã" />
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
        <ProfileAreaInputs />
        <SelectInput source="roleCode" label="Vai trò" choices={ROLE_CHOICES} disabled fullWidth />
      </SimpleForm>
    </Edit>
  );
}
