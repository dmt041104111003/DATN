"use client";

import * as React from "react";
import { SelectInput, required } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import {
  getDistrictOptions,
  getProvinceOptions,
  getWardOptions,
  type Option,
} from "@/features/resources/shared/location";

type AreaFieldsProps = {
  provinceSource: string;
  districtSource: string;
  wardSource: string;
  provinceLabel?: string;
  districtLabel?: string;
  wardLabel?: string;
  disabled?: boolean;
  requiredAll?: boolean;
  disableDistrictUntilProvince?: boolean;
  disableWardUntilDistrict?: boolean;
};

export function AdministrativeAreaFields({
  provinceSource,
  districtSource,
  wardSource,
  provinceLabel = "Tỉnh/Thành",
  districtLabel = "Quận/Huyện",
  wardLabel = "Phường/Xã",
  disabled = false,
  requiredAll = true,
  disableDistrictUntilProvince = true,
  disableWardUntilDistrict = true,
}: AreaFieldsProps) {
  const { setValue } = useFormContext();
  const provinceId = String(useWatch({ name: provinceSource }) ?? "");
  const districtId = String(useWatch({ name: districtSource }) ?? "");
  const [provinces, setProvinces] = React.useState<Option[]>([]);
  const [districts, setDistricts] = React.useState<Option[]>([]);
  const [wards, setWards] = React.useState<Option[]>([]);
  const prevProvinceRef = React.useRef<string>("");
  const prevDistrictRef = React.useRef<string>("");
  const validators = requiredAll ? [required()] : undefined;

  React.useEffect(() => {
    let mounted = true;
    getProvinceOptions()
      .then((rows) => {
        if (mounted) setProvinces(rows);
      })
      .catch(() => {
        if (mounted) setProvinces([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    if (!provinceId) {
      setDistricts([]);
      setWards([]);
      return () => {
        mounted = false;
      };
    }
    getDistrictOptions(provinceId)
      .then((rows) => {
        if (mounted) setDistricts(rows);
      })
      .catch(() => {
        if (mounted) setDistricts([]);
      });
    return () => {
      mounted = false;
    };
  }, [provinceId]);

  React.useEffect(() => {
    let mounted = true;
    if (!districtId) {
      setWards([]);
      return () => {
        mounted = false;
      };
    }
    getWardOptions(districtId)
      .then((rows) => {
        if (mounted) setWards(rows);
      })
      .catch(() => {
        if (mounted) setWards([]);
      });
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
      setValue(districtSource, "");
      setValue(wardSource, "");
      prevProvinceRef.current = provinceId;
    }
  }, [districtSource, provinceId, setValue, wardSource]);

  React.useEffect(() => {
    if (!prevDistrictRef.current) {
      prevDistrictRef.current = districtId;
      return;
    }
    if (prevDistrictRef.current !== districtId) {
      setValue(wardSource, "");
      prevDistrictRef.current = districtId;
    }
  }, [districtId, setValue, wardSource]);

  return (
    <>
      <SelectInput
        source={provinceSource}
        label={provinceLabel}
        choices={provinces}
        optionValue="id"
        optionText="name"
        validate={validators}
        disabled={disabled}
        fullWidth
      />
      <SelectInput
        source={districtSource}
        label={districtLabel}
        choices={districts}
        optionValue="id"
        optionText="name"
        validate={validators}
        disabled={disabled || (disableDistrictUntilProvince && !provinceId)}
        fullWidth
      />
      <SelectInput
        source={wardSource}
        label={wardLabel}
        choices={wards}
        optionValue="id"
        optionText="name"
        validate={validators}
        disabled={disabled || (disableWardUntilDistrict && !districtId)}
        fullWidth
      />
    </>
  );
}
