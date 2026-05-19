"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Typography } from "@mui/material";
import {
  BooleanField,
  Button,
  DateField,
  Datagrid,
  TextField,
  TopToolbar,
  useGetOne,
  useListContext,
} from "react-admin";
import { useNavigate } from "react-router-dom";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { MilList } from "@/features/ui/military/MilList";

function StorageListToolbar() {
  const { filterValues } = useListContext();
  const navigate = useNavigate();
  const warehouseId = cleanString(filterValues?.warehouseId);
  if (!warehouseId) return null;

  return (
    <TopToolbar>
      <Button
        label="Danh sách kho"
        onClick={() => navigate("/warehouse")}
        startIcon={<ArrowBackIcon />}
      />
    </TopToolbar>
  );
}

function StorageListHeaderInner({ warehouseId }: { warehouseId: string }) {
  const { data: warehouse } = useGetOne("warehouse", { id: warehouseId });
  const name = cleanString(warehouse?.name) || warehouseId;
  return (
    <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Lưu trữ: {name}
      </Typography>
    </Box>
  );
}

function StorageListHeader() {
  const { filterValues } = useListContext();
  const warehouseId = cleanString(filterValues?.warehouseId);
  if (!warehouseId) return null;
  return <StorageListHeaderInner warehouseId={warehouseId} />;
}

function StorageDatagrid() {
  const { filterValues } = useListContext();
  const warehouseId = cleanString(filterValues?.warehouseId);

  return (
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="id" label="Mã lưu trữ" />
      {!warehouseId ? <TextField source="warehouseName" label="Kho" /> : null}
      <TextField source="containerCode" label="Thùng hàng" />
      <BooleanField source="verified" label="Đã xác thực" />
      <DateField source="verifiedAt" label="Thời gian xác thực" showTime />
      <TextField source="conditions" label="Điều kiện" />
    </Datagrid>
  );
}

export function WarehouseStorageResourceList() {
  return (
    <MilList exporter={false} actions={<StorageListToolbar />}>
      <StorageListHeader />
      <StorageDatagrid />
    </MilList>
  );
}
