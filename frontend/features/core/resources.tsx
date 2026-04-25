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
    <Resource name="profile" list={ProfileResourceList} edit={ProfileResourceEdit} />
  </>
);
