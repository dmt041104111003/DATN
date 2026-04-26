"use client";

import {
  Menu,
  MenuItemLink,
  usePermissions,
} from "react-admin";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

export function AdminMenu() {
  const { permissions } = usePermissions<string>();
  const role = String(permissions || "").toUpperCase();
  const isAdminRole = role === "ENTERPRISE";
  const items = [
    <MenuItemLink key="overview" to="/" primaryText="Tổng quan" leftIcon={<DashboardIcon />} />,
    ...(isAdminRole
      ? [
          <MenuItemLink
            key="production"
            to="/production"
            primaryText="Vụ mùa"
            leftIcon={<PrecisionManufacturingIcon />}
          />,
        ]
      : []),
    <MenuItemLink key="profile" to="/profile" primaryText="Hồ sơ" leftIcon={<PersonIcon />} />,
  ];

  return (
    <Menu>{items}</Menu>
  );
}
