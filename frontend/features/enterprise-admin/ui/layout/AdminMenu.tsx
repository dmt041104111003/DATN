"use client";

import {
  Menu,
  MenuItemLink,
  usePermissions,
} from "react-admin";
import ViewListIcon from "@mui/icons-material/ViewList";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MapIcon from "@mui/icons-material/Map";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PersonIcon from "@mui/icons-material/Person";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export function AdminMenu() {
  const { permissions } = usePermissions<string>();
  const isEnterprise = permissions === "ENTERPRISE";
  const items = [
    <MenuItemLink key="overview" to="/" primaryText="Overview" leftIcon={<DashboardIcon />} />,
    <MenuItemLink
      key="warehouses"
      to="/warehouses"
      primaryText="Warehouses"
      leftIcon={<ViewListIcon />}
    />,
    ...(isEnterprise
      ? [
          <MenuItemLink
            key="products"
            to="/products"
            primaryText="Products"
            leftIcon={<Inventory2Icon />}
          />,
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
          <MenuItemLink key="areas" to="/areas" primaryText="Areas" leftIcon={<MapIcon />} />,
          <MenuItemLink key="plans" to="/plans" primaryText="Plans" leftIcon={<EventNoteIcon />} />,
        ]
      : []),
    <MenuItemLink key="profile" to="/profile" primaryText="Profile" leftIcon={<PersonIcon />} />,
  ];

  return (
    <Menu>{items}</Menu>
  );
}
