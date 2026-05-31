"use client";

import { Edit, SaveButton, SimpleForm, Toolbar } from "react-admin";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { buildWarehouseLocation } from "@/features/resources/warehouses/warehouseLocation";
import { EDIT_PAGE_SX, MIL_FORM_SX } from "@/features/resources/shared/styles";
import { ProfileLocationHydrate } from "./ProfileLocationHydrate";

export function ProfileResourceEdit() {
  return (
    <Edit
      title="Hồ sơ"
      sx={EDIT_PAGE_SX}
      actions={false}
      mutationMode="pessimistic"
      transform={async (data: any) => {
        const name = cleanString(data?.name);
        const capacity = cleanString(data?.capacity);
        if (!name) throw new Error("Tên kho là bắt buộc.");
        if (!capacity) throw new Error("Sức chứa kho là bắt buộc.");
        return {
          displayName: cleanString(data?.displayName),
          phoneNumber: cleanString(data?.phoneNumber) || undefined,
          warehouse: {
            name,
            capacity,
            location: await buildWarehouseLocation(data),
          },
        };
      }}
    >
      <SimpleForm
        sx={MIL_FORM_SX}
        toolbar={
          <Toolbar>
            <SaveButton />
          </Toolbar>
        }
      >
        <ProfileLocationHydrate />
      </SimpleForm>
    </Edit>
  );
}
