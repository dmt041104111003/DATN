"use client";

import { Resource } from "react-admin";
import { ProductionResourceCreate } from "@/features/resources/production/ProductionResourceCreate";
import { ProductionResourceEdit } from "@/features/resources/production/ProductionResourceEdit";
import { ProductionResourceList } from "@/features/resources/production/ProductionResourceList";
import { ContainerResourceCreate } from "@/features/resources/containers/ContainerResourceCreate";
import { ContainerResourceEdit } from "@/features/resources/containers/ContainerResourceEdit";
import { ContainerResourceList } from "@/features/resources/containers/ContainerResourceList";
import { WarehouseResourceCreate } from "@/features/resources/warehouses/WarehouseResourceCreate";
import { WarehouseResourceEdit } from "@/features/resources/warehouses/WarehouseResourceEdit";
import { WarehouseResourceList } from "@/features/resources/warehouses/WarehouseResourceList";
import { WarehouseStorageResourceEdit } from "@/features/resources/warehouse-storages/WarehouseStorageResourceEdit";
import { WarehouseStorageResourceList } from "@/features/resources/warehouse-storages/WarehouseStorageResourceList";
import { ProfileResourceEdit } from "@/features/resources/profile/ProfileResourceEdit";
import { ProfileResourceList } from "@/features/resources/profile/ProfileResourceList";
import { QrScanResourcePage } from "@/features/resources/qr-scan/QrScanResourcePage";

export function renderAdminResources(permissions?: string) {
  const role = String(permissions || "").toUpperCase();
  const isEnterprise = role === "ENTERPRISE";

  return (
    <>
      {isEnterprise ? (
        <>
          <Resource
            name="production"
            list={ProductionResourceList}
            create={ProductionResourceCreate}
            edit={ProductionResourceEdit}
          />
          <Resource
            name="container"
            list={ContainerResourceList}
            create={ContainerResourceCreate}
            edit={ContainerResourceEdit}
          />
        </>
      ) : null}
      <Resource
        name="warehouse"
        list={WarehouseResourceList}
        create={WarehouseResourceCreate}
        edit={WarehouseResourceEdit}
      />
      <Resource
        name="warehouse-storage"
        list={WarehouseStorageResourceList}
        edit={WarehouseStorageResourceEdit}
      />
      <Resource name="qr-scan" list={QrScanResourcePage} />
      <Resource
        name="profile"
        list={ProfileResourceList}
        edit={ProfileResourceEdit}
      />
    </>
  );
}
