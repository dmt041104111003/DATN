"use client";

import { Resource } from "react-admin";
import {
  ProductionResourceCreate,
  ProductionResourceEdit,
  ProductionResourceList,
} from "@/features/resources/production";
import {
  ProfileResourceEdit,
  ProfileResourceList,
} from "@/features/resources/profile";
import {
  PackagesResourceCreate,
  PackagesResourceEdit,
  PackagesResourceList,
} from "@/features/resources/packages";
import {
  ShipmentsResourceCreate,
  ShipmentsResourceEdit,
  ShipmentsResourceList,
} from "@/features/resources/shipments";
import { ShipmentScanResourceList } from "@/features/resources/shipment-scan";

export function renderAdminResources(permissions?: string) {
  const role = String(permissions || "").toUpperCase();
  const hidePackageAndShipment = role === "AGENT" || role === "TRANSIT";
  const isEnterprise = role === "ENTERPRISE";

  return (
    <>
      {isEnterprise ? (
        <Resource
          name="production"
          list={ProductionResourceList}
          create={ProductionResourceCreate}
          edit={ProductionResourceEdit}
        />
      ) : null}
      {!hidePackageAndShipment ? (
        <Resource
          name="packages"
          list={PackagesResourceList}
          create={PackagesResourceCreate}
          edit={PackagesResourceEdit}
        />
      ) : null}
      {!hidePackageAndShipment ? (
        <Resource
          name="shipments"
          list={ShipmentsResourceList}
          create={ShipmentsResourceCreate}
          edit={ShipmentsResourceEdit}
        />
      ) : null}
      <Resource name="shipment-scan" list={ShipmentScanResourceList} />
      <Resource name="profile" list={ProfileResourceList} edit={ProfileResourceEdit} />
    </>
  );
}
