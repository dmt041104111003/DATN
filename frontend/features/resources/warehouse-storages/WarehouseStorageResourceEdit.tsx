"use client";

import {
  DeleteButton,
  Edit,
  SaveButton,
  SimpleForm,
  Toolbar,
  usePermissions,
} from "react-admin";
import { EDIT_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
import { WarehouseStorageForm } from "./WarehouseStorageForm";

export function WarehouseStorageResourceEdit() {
  const { permissions } = usePermissions();
  const isAgent = String(permissions || "").toUpperCase() === "AGENT";

  return (
    <Edit mutationMode="pessimistic" sx={EDIT_PAGE_SX}>
      <SimpleForm
        sx={FORM_SX}
        toolbar={
          <Toolbar>
            <SaveButton />
            {!isAgent ? (
              <DeleteButton
                label="Xuất kho"
                mutationMode="pessimistic"
                redirect="list"
                color="error"
              />
            ) : null}
          </Toolbar>
        }
      >
        <WarehouseStorageForm />
      </SimpleForm>
    </Edit>
  );
}

