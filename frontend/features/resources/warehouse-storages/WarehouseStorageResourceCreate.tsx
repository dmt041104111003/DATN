"use client";

import { Create, SimpleForm } from "react-admin";
import { CREATE_PAGE_SX, MIL_FORM_SX } from "@/features/resources/shared/styles";
import { WarehouseStorageForm } from "./WarehouseStorageForm";

export function WarehouseStorageResourceCreate() {
  return (
    <Create sx={CREATE_PAGE_SX}>
      <SimpleForm sx={MIL_FORM_SX}>
        <WarehouseStorageForm />
      </SimpleForm>
    </Create>
  );
}

