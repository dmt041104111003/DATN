"use client";

import {
  Menu,
  MenuItemLink,
  usePermissions,
} from "react-admin";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export function AdminMenu() {
  const { permissions } = usePermissions<string>();
  const isEnterprise = permissions === "ENTERPRISE";
  const items = [
    <MenuItemLink key="overview" to="/" primaryText="Overview" leftIcon={<DashboardIcon />} />,
    ...(isEnterprise
      ? [
          <MenuItemLink
            key="production"
            to="/production"
            primaryText="Quản lý vụ mùa"
            leftIcon={<PrecisionManufacturingIcon />}
          />,
          <MenuItemLink
            key="units"
            to="/units"
            primaryText="Quản lý đơn vị"
            leftIcon={<LocalShippingIcon />}
          />,
        ]
      : []),
    <MenuItemLink key="profile" to="/profile" primaryText="Profile" leftIcon={<PersonIcon />} />,
  ];

  return (
    <Menu>{items}</Menu>
  );
}
