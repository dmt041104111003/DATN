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
import WarehouseIcon from "@mui/icons-material/Warehouse";
import StorageIcon from "@mui/icons-material/Storage";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

export function AdminMenu() {
  const { permissions } = usePermissions<string>();
  const role = String(permissions || "").toUpperCase();
  const isEnterprise = role === "ENTERPRISE";
  const items = [
    <MenuItemLink key="overview" to="/" primaryText="Tổng quan" leftIcon={<DashboardIcon />} />,
    ...(isEnterprise
      ? [
          <MenuItemLink
            key="production"
            to="/production"
            primaryText="Vụ mùa"
            leftIcon={<PrecisionManufacturingIcon />}
          />,
          <MenuItemLink
            key="container"
            to="/container"
            primaryText="Thùng hàng"
            leftIcon={<Inventory2Icon />}
          />,
        ]
      : []),
    <MenuItemLink
      key="warehouse"
      to="/warehouse"
      primaryText="Kho lưu trữ"
      leftIcon={<WarehouseIcon />}
    />,
    <MenuItemLink
      key="warehouse-storage"
      to="/warehouse-storage"
      primaryText="Lưu trữ kho"
      leftIcon={<StorageIcon />}
    />,
    <MenuItemLink
      key="qr-scan"
      to="/qr-scan"
      primaryText="Quét QR"
      leftIcon={<QrCodeScannerIcon />}
    />,
    <MenuItemLink key="profile" to="/profile" primaryText="Hồ sơ" leftIcon={<PersonIcon />} />,
  ];

  return (
    <Menu>{items}</Menu>
  );
}
