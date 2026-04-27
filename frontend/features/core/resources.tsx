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
  ProfileResourceCreate,
  ProfileResourceEdit,
  ProfileResourceList,
} from "@/features/resources/profile";
import {
  PartnerResourceCreate,
  PartnerResourceEdit,
  PartnerResourceList,
} from "@/features/resources/partners";
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
          <Resource
            name="partner"
            list={PartnerResourceList}
            create={PartnerResourceCreate}
            edit={PartnerResourceEdit}
          />
          <Resource name="qr-scan" list={QrScanResourcePage} />
        </>
      ) : null}
      <Resource
        name="profile"
        list={ProfileResourceList}
        create={ProfileResourceCreate}
        edit={ProfileResourceEdit}
      />
    </>
  );
}
