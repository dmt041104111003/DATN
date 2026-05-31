"use client";

import * as React from "react";
import { Box, Typography } from "@mui/material";
import {
  BooleanField,
  DateField,
  Datagrid,
  Empty,
  Loading,
  TextField,
  useGetList,
  useGetOne,
} from "react-admin";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { MilList } from "@/features/ui/military/MilList";
import {
  resolveWarehouseIdFromSearch,
  warehouseStorageListPath,
} from "./warehouseStorageListUrl";

function useListWarehouseId() {
  const [searchParams] = useSearchParams();
  return resolveWarehouseIdFromSearch(searchParams.toString());
}

function StorageListHeaderInner({ warehouseId }: { warehouseId: string }) {
  const { data: warehouse } = useGetOne("warehouse", { id: warehouseId });
  const name = cleanString(warehouse?.name) || warehouseId;

  return (
    <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Kho lưu trữ: {name}
      </Typography>
    </Box>
  );
}

function StorageDatagrid() {
  const warehouseId = useListWarehouseId();

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const warehouseId = resolveWarehouseIdFromSearch(searchParams.toString());
  const { data, isLoading } = useGetList("warehouse", {
    pagination: { page: 1, perPage: 1 },
    sort: { field: "createdAt", order: "DESC" },
  });

  React.useEffect(() => {
    if (warehouseId || isLoading || !Array.isArray(data)) return;
    const id = cleanString(data[0]?.id);
    if (id) navigate(warehouseStorageListPath(id), { replace: true });
  }, [warehouseId, data, isLoading, navigate]);

  if (!warehouseId && isLoading) return <Loading />;

  if (!warehouseId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Chưa có kho gắn với tài khoản này. Đăng xuất và đăng ký lại nếu bạn chưa hoàn tất bước tạo kho.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <StorageListHeaderInner warehouseId={warehouseId} />
      <MilList
        exporter={false}
        actions={false}
        filter={{ warehouseId }}
        empty={<Empty />}
      >
        <StorageDatagrid />
      </MilList>
    </>
  );
}
