"use client";

import * as React from "react";
import { useWatch } from "react-hook-form";
import { getDistrictOptions, getProvinceOptions, getWardOptions, type Option } from "@/features/resources/shared/location";

export function useAdministrativeArea(prefixOrProvinceName: string, districtName = "") {
  let provinceName = prefixOrProvinceName;

  if (!districtName) {
    provinceName = `${prefixOrProvinceName}ProvinceId`;
    districtName = `${prefixOrProvinceName}DistrictId`;
  }

  const provinceId = String(useWatch({ name: provinceName }) ?? "");
  const districtId = String(useWatch({ name: districtName }) ?? "");
  const [provinces, setProvinces] = React.useState<Option[]>([]);
  const [districts, setDistricts] = React.useState<Option[]>([]);
  const [wards, setWards] = React.useState<Option[]>([]);

  React.useEffect(() => {
    getProvinceOptions()
      .then((rows) => {
        setProvinces(rows);
      })
      .catch(() => undefined);
  }, []);

  React.useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      setWards([]);
      return;
    }
    getDistrictOptions(provinceId)
      .then((rows) => {
        setDistricts(rows);
      })
      .catch(() => undefined);
  }, [provinceId]);

  React.useEffect(() => {
    if (!districtId) {
      setWards([]);
      return;
    }
    getWardOptions(districtId)
      .then((rows) => {
        setWards(rows);
      })
      .catch(() => undefined);
  }, [districtId]);

  const choices = { provinces, districts, wards };

  return { choices, provinceId, districtId };
}
