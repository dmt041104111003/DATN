"use client";

import * as React from "react";
import { Loading, useGetList } from "react-admin";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { cleanString } from "@/features/core/metadata/share/cleanString";

/** Chuyển sang hồ sơ (kho nằm trong hồ sơ). */
export function WarehouseResourceList() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetList("profile", {
    pagination: { page: 1, perPage: 1 },
    sort: { field: "createdAt", order: "DESC" },
  });

  React.useEffect(() => {
    if (isLoading || !Array.isArray(data)) return;
    const id = cleanString(data[0]?.id);
    if (id) navigate(`/profile/${encodeURIComponent(id)}`, { replace: true });
  }, [data, isLoading, navigate]);

  if (isLoading) return <Loading />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography color="text.secondary">
        Chưa có kho gắn với tài khoản này. Đăng xuất và đăng ký lại nếu bạn chưa hoàn tất bước tạo kho.
      </Typography>
    </Box>
  );
}
