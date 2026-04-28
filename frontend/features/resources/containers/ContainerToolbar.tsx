"use client";

import { DeleteButton, SaveButton, Toolbar, useRecordContext } from "react-admin";
import { useFormContext } from "react-hook-form";

export function ContainerCreateToolbar() {
  return <Toolbar><SaveButton label="Tạo thùng hàng" /></Toolbar>;
}

export function ContainerEditToolbar() {
  const record = useRecordContext<any>();
  const storageLocked = Boolean(record?.storageLocked);
  const { setValue } = useFormContext();

  return (
    <Toolbar>
      <SaveButton label="Cập nhật" disabled={storageLocked} onClick={() => setValue("status", "UPDATE")} />
      <DeleteButton label="DELETE" mutationMode="pessimistic" redirect="list" color="error" disabled={storageLocked} />
    </Toolbar>
  );
}

