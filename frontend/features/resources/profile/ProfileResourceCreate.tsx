"use client";

import { Create, SimpleForm } from "react-admin";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { buildWarehouseLocation } from "@/features/resources/warehouses/warehouseLocation";
import { CREATE_PAGE_SX, MIL_FORM_SX } from "@/features/resources/shared/styles";

const AUTH_EMBEDDED_SX = {
  ...CREATE_PAGE_SX,
  margin: 0,
  "& .RaCreate-card": { background: "transparent", boxShadow: "none", border: "none" },
  "& .RaCreate-main": { padding: 0 },
  "& .MuiCardContent-root": { padding: "0 !important" },
};
import { ProfileCreateToolbar } from "./ProfileCreateToolbar";
import { ProfileFormSections } from "./ProfileFormSections";

export function ProfileResourceCreate(props: any) {
  const { defaultValues, mutationOptions, redirect, embedded, ...rest } = props || {};

  return (
    <Create
      {...rest}
      title={embedded ? false : undefined}
      actions={embedded ? false : undefined}
      sx={embedded ? AUTH_EMBEDDED_SX : CREATE_PAGE_SX}
      redirect={redirect}
      mutationOptions={mutationOptions}
      transform={async (data: any) => {
        const name = cleanString(data?.name);
        const capacity = cleanString(data?.capacity);
        if (!name) throw new Error("Tên kho là bắt buộc.");
        if (!capacity) throw new Error("Sức chứa kho là bắt buộc.");
        return {
          roleCode: cleanString(data?.roleCode).toUpperCase(),
          displayName: cleanString(data?.displayName),
          phoneNumber: cleanString(data?.phoneNumber) || undefined,
          warehouse: { name, capacity, location: await buildWarehouseLocation(data) },
        };
      }}
    >
      <SimpleForm sx={MIL_FORM_SX} defaultValues={defaultValues} toolbar={<ProfileCreateToolbar />}>
        <ProfileFormSections />
      </SimpleForm>
    </Create>
  );
}
