"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button, TopToolbar, useRecordContext } from "react-admin";
import { useNavigate } from "react-router-dom";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { warehouseStorageListPath } from "@/features/resources/warehouse-storages/warehouseStorageListUrl";

export function WarehouseEditToolbar() {
  const record = useRecordContext();
  const navigate = useNavigate();
  const warehouseId = cleanString(record?.id);

  return (
    <TopToolbar>
      {warehouseId ? (
        <Button
          label="Quay lại"
          onClick={() => navigate(warehouseStorageListPath(warehouseId))}
          startIcon={<ArrowBackIcon />}
        />
      ) : null}
    </TopToolbar>
  );
}
