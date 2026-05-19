"use client";

import {
  DeleteButton,
  Edit,
  type Identifier,
  type RaRecord,
  SaveButton,
  SimpleForm,
  Toolbar,
  usePermissions,
} from "react-admin";
import { EDIT_PAGE_SX, MIL_FORM_SX } from "@/features/resources/shared/styles";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { WarehouseStorageForm } from "./WarehouseStorageForm";

function storageListRedirect(_resource?: string, _id?: Identifier, data?: Partial<RaRecord>) {
  const warehouseId = cleanString(data?.warehouseId);
  if (!warehouseId) return "list";
  return `/warehouse-storage?filter=${encodeURIComponent(JSON.stringify({ warehouseId }))}`;
}

export function WarehouseStorageResourceEdit() {
  const { permissions } = usePermissions();
  const isAgent = String(permissions || "").toUpperCase() === "AGENT";

  return (
    <Edit mutationMode="pessimistic" sx={EDIT_PAGE_SX} redirect={storageListRedirect}>
      <SimpleForm
        sx={MIL_FORM_SX}
        toolbar={
          <Toolbar>
            <SaveButton />
            {!isAgent ? (
              <DeleteButton
                label="Xuất kho"
                mutationMode="pessimistic"
                redirect={storageListRedirect}
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

