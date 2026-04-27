"use client";

import { Resource } from "react-admin";
import {
  ProductionResourceCreate,
  ProductionResourceEdit,
  ProductionResourceList,
} from "@/features/resources/production";
import {
  ContainerResourceCreate,
  ContainerResourceEdit,
  ContainerResourceList,
} from "@/features/resources/containers/index";
import {
  WarehouseResourceCreate,
  WarehouseResourceEdit,
  WarehouseResourceList,
} from "@/features/resources/warehouses";
import {
  WarehouseStorageResourceEdit,
  WarehouseStorageResourceList,
} from "@/features/resources/warehouse-storages";
import {
  ProfileResourceEdit,
  ProfileResourceList,
} from "@/features/resources/profile";
import { QrScanResourcePage } from "@/features/resources/qr-scan";

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
