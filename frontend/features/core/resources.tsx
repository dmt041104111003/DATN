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

export function renderAdminResources(permissions?: string) {
  const role = String(permissions || "").toUpperCase();
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
      <Resource name="profile" list={ProfileResourceList} edit={ProfileResourceEdit} />
    </>
  );
}
