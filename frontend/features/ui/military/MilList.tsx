"use client";

import { List, type ListProps } from "react-admin";
import { MIL_LIST_SX } from "@/features/resources/shared/styles";

export function MilList({ perPage = 10, sx, ...props }: ListProps) {
  return (
    <List
      {...props}
      perPage={perPage}
      sx={{ ...MIL_LIST_SX, ...sx }}
    />
  );
}
