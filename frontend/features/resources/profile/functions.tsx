"use client";

import { useEffect, useState } from "react";
import {
  Create,
  Edit,
  List,
  SaveButton,
  SimpleForm,
  TextField,
  TextInput,
  Datagrid,
  SelectInput,
  FunctionField,
  Toolbar,
  required,
} from "react-admin";
import { Typography } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import { ROLE_CHOICES, roleLabel } from "./constants";
import * as React from "react";
import {
  getDistrictOptions,
  getProvinceOptions,
  getWardOptions,
  type Option,
} from "@/features/resources/shared/location";

function ProfileAreaInputs() {
  const { setValue } = useFormContext();
  const provinceId = useWatch({ name: "provinceId" }) as string | undefined;
  const districtId = useWatch({ name: "districtId" }) as string | undefined;
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
  }, [provinceId, setValue]);

  useEffect(() => {
    if (!districtId) {
      setWards([]);
      return;
    }
    getWardOptions(districtId).then(setWards).catch(() => setWards([]));
  }, [districtId, setValue]);

  useEffect(() => {
    if (!prevProvinceRef.current) {
      prevProvinceRef.current = String(provinceId || "");
      return;
    }
    if (prevProvinceRef.current !== String(provinceId || "")) {
      setValue("districtId", "");
      setValue("wardId", "");
      setWards([]);
      prevProvinceRef.current = String(provinceId || "");
    }
  }, [provinceId, setValue]);

  useEffect(() => {
    if (!prevDistrictRef.current) {
      prevDistrictRef.current = String(districtId || "");
      return;
    }
    if (prevDistrictRef.current !== String(districtId || "")) {
      setValue("wardId", "");
      prevDistrictRef.current = String(districtId || "");
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

type ProfileFormSectionsProps = {
  allowRoleEdit: boolean;
};

export function ProfileFormSections({ allowRoleEdit }: ProfileFormSectionsProps) {
  return (
    <>
      <div className="py-1">
        <Typography fontWeight={700}>[1] Thông tin tài khoản</Typography>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput source="walletAddress" label="Địa chỉ ví" disabled fullWidth />
          <TextInput source="displayName" label="Tên hiển thị" validate={[required()]} fullWidth />
          <TextInput source="phoneNumber" label="Số điện thoại" fullWidth />
          <ProfileAreaInputs />
        </div>
      </div>

      <div className="py-1">
        <Typography fontWeight={700}>[2] Vai trò</Typography>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectInput
            source="roleCode"
            label="Vai trò"
            choices={ROLE_CHOICES}
            validate={[required()]}
            disabled={!allowRoleEdit}
            fullWidth
          />
        </div>
      </div>
    </>
  );
}

function ProfileCreateToolbar() {
  return (
    <Toolbar>
      <SaveButton label="Xác nhận" />
    </Toolbar>
  );
}

export function ProfileResourceCreate(props: any) {
  const { defaultValues, ...rest } = props || {};
  return (
    <Create
      {...rest}
      sx={{
        "& .RaCreate-main": { maxWidth: "none" },
        "& .RaCreate-card": {
          maxWidth: "none",
          width: "100%",
          boxShadow: "none",
          border: "none",
          background: "transparent",
        },
      }}
    >
      <SimpleForm
        toolbar={<ProfileCreateToolbar />}
        defaultValues={defaultValues}
        sx={{
          maxWidth: "none",
          width: "100%",
          "& .RaSimpleForm-form": { maxWidth: "none", width: "100%" },
          "& .RaInput-root": { mt: 0, mb: 0, width: "100%" },
          "& .MuiFormControl-root": { width: "100%" },
        }}
      >
        <ProfileFormSections allowRoleEdit />
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
        <FunctionField label="Vai trò" render={(record: any) => roleLabel(record?.roleCode)} />
      </Datagrid>
    </List>
  );
}

export function ProfileResourceEdit() {
  return (
    <Edit
      sx={{
        "& .RaEdit-main": { maxWidth: "none" },
        "& .RaEdit-card": { maxWidth: "none", width: "100%" },
      }}
    >
      <SimpleForm
        sx={{
          maxWidth: "none",
          width: "100%",
          "& .RaSimpleForm-form": { maxWidth: "none", width: "100%" },
          "& .RaInput-root": { mt: 0, mb: 0, width: "100%" },
          "& .MuiFormControl-root": { width: "100%" },
        }}
      >
        <ProfileFormSections allowRoleEdit={false} />
      </SimpleForm>
    </Edit>
  );
}
