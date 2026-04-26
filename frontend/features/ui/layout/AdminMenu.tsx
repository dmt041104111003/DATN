"use client";

import {
  Menu,
  MenuItemLink,
  usePermissions,
} from "react-admin";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export function AdminMenu() {
  const { permissions } = usePermissions<string>();
  const isAdminRole = permissions === "ENTERPRISE";
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
    <MenuItemLink
      key="packages"
      to="/packages"
      primaryText="Gói hàng"
      leftIcon={<Inventory2Icon />}
    />,
    <MenuItemLink
      key="shipments"
      to="/shipments"
      primaryText="Lô hàng"
      leftIcon={<LocalShippingIcon />}
    />,
    <MenuItemLink key="profile" to="/profile" primaryText="Hồ sơ" leftIcon={<PersonIcon />} />,
  ];

  return (
    <Menu>{items}</Menu>
  );
}
