"use client";

import {
  DeleteButton,
  Edit,
  SaveButton,
  SimpleForm,
  Toolbar,
} from "react-admin";
import { EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import { WarehouseStorageForm } from "./WarehouseStorageForm";

export function WarehouseStorageResourceEdit() {
  return (
    <Edit mutationMode="pessimistic" sx={EDIT_PAGE_SX}>
      <SimpleForm
        sx={FORM_SX}
        toolbar={
          <Toolbar>
            <SaveButton />
            <DeleteButton
              label="Xuất kho"
              mutationMode="pessimistic"
              redirect="list"
              color="error"
            />
          </Toolbar>
        }
      >
        <WarehouseStorageForm />
      </SimpleForm>
    </Edit>
  );
}

