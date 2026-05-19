"use client";

import { DeleteButton, SaveButton, Toolbar, useRecordContext } from "react-admin";
import { useFormContext } from "react-hook-form";

export function ContainerCreateToolbar({
  progress = "",
  submitting = false,
}: {
  progress?: string;
  submitting?: boolean;
}) {
  return (
    <Toolbar sx={{ flexWrap: "wrap", gap: 1 }}>
      {progress ? <span className="w-full text-sm text-slate-600">{progress}</span> : null}
      <SaveButton label={submitting ? "Đang xử lý..." : "Tạo thùng hàng"} disabled={submitting} />
    </Toolbar>
  );
}

export function ContainerEditToolbar() {
  const record = useRecordContext<any>();
  const storageLocked = Boolean(record?.storageLocked);
  const { setValue } = useFormContext();

  return (
    <Toolbar>
      <SaveButton label="Cập nhật" disabled={storageLocked} onClick={() => setValue("status", "UPDATE")} />
      <DeleteButton mutationMode="pessimistic" redirect="list" color="error" disabled={storageLocked} />
    </Toolbar>
  );
}

