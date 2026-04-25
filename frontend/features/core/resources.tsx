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
  UnitsResourceCreate,
  UnitsResourceEdit,
  UnitsResourceList,
} from "@/features/resources/units";

export function EnterpriseAdminResources() {
  return null;
}

export const enterpriseAdminResources = (
  <>
    <Resource
      name="units"
      list={UnitsResourceList}
      create={UnitsResourceCreate}
      edit={UnitsResourceEdit}
    />
    <Resource
      name="production"
      list={ProductionResourceList}
      create={ProductionResourceCreate}
      edit={ProductionResourceEdit}
    />
    <Resource name="profile" list={ProfileResourceList} edit={ProfileResourceEdit} />
  </>
);
