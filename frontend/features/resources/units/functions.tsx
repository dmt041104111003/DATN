"use client";

import * as React from "react";
import {
  Create,
  Datagrid,
  Edit,
  List,
  SelectField,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  required,
  useRecordContext,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import {
  type DistrictApiResponse,
  type Option,
  type ProvinceApiRow,
  type WardApiResponse,
  districtCache,
  phoneValidator,
  provinceCache,
  UNIT_TYPE_CHOICES,
  VIETNAM_PROVINCES_API,
  wardCache,
} from "./constants";

async function fetchVietnamOptions(path: string): Promise<any> {
  const res = await fetch(`${VIETNAM_PROVINCES_API}${path}`);
  if (!res.ok) return null;
  return res.json();
}

function mapRowsToOptions(rows: ProvinceApiRow[] | undefined): Option[] {
  return Array.isArray(rows)
    ? rows.map((row) => ({ id: String(row.code), name: String(row.name) }))
    : [];
}

function makeUnitCode() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `DV_${y}${m}${d}_${seq}`;
}

function UnitLocationInputs({ disabledAll = false }: { disabledAll?: boolean }) {
  const { setValue } = useFormContext();
  const provinceId = String(useWatch({ name: "provinceId" }) ?? "");
  const districtId = String(useWatch({ name: "districtId" }) ?? "");
  const [provinceOptions, setProvinceOptions] = React.useState<Option[]>(provinceCache);
  const [districtOptions, setDistrictOptions] = React.useState<Option[]>([]);
  const [wardOptions, setWardOptions] = React.useState<Option[]>([]);
  const prevProvinceRef = React.useRef<string>("");
  const prevDistrictRef = React.useRef<string>("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (provinceCache.length > 0) {
        setProvinceOptions([...provinceCache]);
        return;
      }
      const json = (await fetchVietnamOptions("/p/")) as ProvinceApiRow[] | null;
      const rows = mapRowsToOptions(json ?? undefined);
      provinceCache.splice(0, provinceCache.length, ...rows);
      if (mounted) setProvinceOptions(rows);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!provinceId) {
        setDistrictOptions([]);
        return;
      }
      if (districtCache.has(provinceId)) {
        setDistrictOptions([...(districtCache.get(provinceId) || [])]);
        return;
      }
      const json = (await fetchVietnamOptions(`/p/${provinceId}?depth=2`)) as
        | DistrictApiResponse
        | null;
      const rows = mapRowsToOptions(json?.districts);
      districtCache.set(provinceId, rows);
      if (mounted) setDistrictOptions(rows);
    })();
    return () => {
      mounted = false;
    };
  }, [provinceId]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!districtId) {
        setWardOptions([]);
        return;
      }
      if (wardCache.has(districtId)) {
        setWardOptions([...(wardCache.get(districtId) || [])]);
        return;
      }
      const json = (await fetchVietnamOptions(`/d/${districtId}?depth=2`)) as WardApiResponse | null;
      const rows = mapRowsToOptions(json?.wards);
      wardCache.set(districtId, rows);
      if (mounted) setWardOptions(rows);
    })();
    return () => {
      mounted = false;
    };
  }, [districtId]);

  React.useEffect(() => {
    if (!prevProvinceRef.current) {
      prevProvinceRef.current = provinceId;
      return;
    }
    if (prevProvinceRef.current !== provinceId) {
      setValue("districtId", "");
      setValue("wardId", "");
      prevProvinceRef.current = provinceId;
    }
  }, [provinceId, setValue]);

  React.useEffect(() => {
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
      <SelectInput
        source="provinceId"
        label="Tỉnh/Thành"
        choices={provinceOptions}
        optionValue="id"
        optionText="name"
        validate={[required()]}
        disabled={disabledAll}
        fullWidth
      />
      <SelectInput
        source="districtId"
        label="Quận/Huyện"
        choices={districtOptions}
        optionValue="id"
        optionText="name"
        validate={[required()]}
        disabled={disabledAll || !provinceId}
        fullWidth
      />
      <SelectInput
        source="wardId"
        label="Phường/Xã"
        choices={wardOptions}
        optionValue="id"
        optionText="name"
        validate={[required()]}
        disabled={disabledAll || !districtId}
        fullWidth
      />
    </>
  );
}

function WalletEditInput() {
  const record = useRecordContext<any>();
  return (
    <TextInput
      source="walletAddress"
      label="Địa chỉ ví"
      disabled
      helperText={record?.walletAddress ? "Địa chỉ ví bị khóa sau khi tạo" : false}
      fullWidth
    />
  );
}

function UnitFormSections({ isEdit = false }: { isEdit?: boolean }) {
  return (
    <>
      <div className="py-1">
        <h3 className="mb-4 font-semibold">[1] Thông tin đơn vị</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput source="code" label="Mã đơn vị *" disabled fullWidth />
          <TextInput source="name" label="Tên đơn vị" validate={[required()]} fullWidth />
          <SelectInput
            source="unitType"
            label="Loại đơn vị"
            choices={UNIT_TYPE_CHOICES}
            validate={[required()]}
            fullWidth
          />
          {isEdit ? (
            <WalletEditInput />
          ) : (
            <TextInput
              source="walletAddress"
              label="Địa chỉ ví"
              validate={[required()]}
              fullWidth
            />
          )}
        </div>
      </div>

      <div className="py-1">
        <h3 className="mb-4 font-semibold">[2] Khu vực địa lý</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UnitLocationInputs disabledAll={isEdit} />
        </div>
      </div>

      <div className="py-1">
        <h3 className="mb-4 font-semibold">[3] Thông tin liên hệ</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextInput
            source="phoneNumber"
            label="Số điện thoại"
            validate={[phoneValidator]}
            fullWidth
          />
        </div>
      </div>
    </>
  );
}

export function UnitsResourceList() {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="code" label="Mã đơn vị" />
        <TextField source="name" label="Tên đơn vị" />
        <SelectField source="unitType" label="Loại đơn vị" choices={UNIT_TYPE_CHOICES} />
        <TextField source="provinceId" label="Tỉnh/Thành" />
        <TextField source="districtId" label="Quận/Huyện" />
        <TextField source="wardId" label="Phường/Xã" />
      </Datagrid>
    </List>
  );
}

export function UnitsResourceCreate() {
  return (
    <Create>
      <SimpleForm
        defaultValues={{
          code: makeUnitCode(),
        }}
      >
        <UnitFormSections />
      </SimpleForm>
    </Create>
  );
}

export function UnitsResourceEdit() {
  return (
    <Edit>
      <SimpleForm>
        <UnitFormSections isEdit />
      </SimpleForm>
    </Edit>
  );
}
