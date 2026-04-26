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
  ShipmentsResourceEdit,
  ShipmentsResourceList,
} from "@/features/resources/shipments";

export function AdminResources() {
  return null;
}

export const adminResources = (
  <>
    <Resource
      name="production"
      list={ProductionResourceList}
      create={ProductionResourceCreate}
      edit={ProductionResourceEdit}
    />
    <Resource
      name="packages"
      list={PackagesResourceList}
      create={PackagesResourceCreate}
      edit={PackagesResourceEdit}
    />
    <Resource
      name="shipments"
      list={ShipmentsResourceList}
      edit={ShipmentsResourceEdit}
    />
    <Resource name="profile" list={ProfileResourceList} edit={ProfileResourceEdit} />
  </>
);
