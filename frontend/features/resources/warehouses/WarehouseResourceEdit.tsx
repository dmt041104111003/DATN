"use client";

import { Edit, SimpleForm } from "react-admin";
import { WarehouseEditFormToolbar } from "./WarehouseEditFormToolbar";
import { WarehouseEditToolbar } from "./WarehouseEditToolbar";
import {
  buildWarehouseLocation,
  stripWarehouseAreaFields,
} from "@/features/resources/warehouses/warehouseLocation";
import { EDIT_PAGE_SX, MIL_FORM_SX } from "@/features/resources/shared/styles";
import { WarehouseLocationHydrate } from "./WarehouseLocationHydrate";

export function WarehouseResourceEdit() {
  return (
    <Edit
      title="Sửa kho"
      actions={<WarehouseEditToolbar />}
      mutationMode="pessimistic"
      sx={EDIT_PAGE_SX}
      transform={async (data: any) => {
        const { id: _id, ...rest } = data || {};
        return {
          ...stripWarehouseAreaFields(rest),
          location: await buildWarehouseLocation(data),
        };
      }}
    >
      <SimpleForm sx={MIL_FORM_SX} toolbar={<WarehouseEditFormToolbar />}>
        <WarehouseLocationHydrate />
      </SimpleForm>
    </Edit>
  );
}
