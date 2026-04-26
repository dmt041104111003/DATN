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

export function renderAdminResources(permissions?: string) {
  const role = String(permissions || "").toUpperCase();
  const hidePackages = role === "AGENT" || role === "TRANSIT";
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
      {!hidePackages ? (
        <Resource
          name="packages"
          list={PackagesResourceList}
          create={PackagesResourceCreate}
          edit={PackagesResourceEdit}
        />
      ) : null}
      <Resource name="profile" list={ProfileResourceList} edit={ProfileResourceEdit} />
    </>
  );
}
