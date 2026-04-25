"use client";

import { Resource } from "react-admin";
import {
  ProductsResourceCreate,
  ProductsResourceEdit,
  ProductsResourceList,
} from "@/features/enterprise-admin/resources/products";
import {
  ProductionResourceCreate,
  ProductionResourceEdit,
  ProductionResourceList,
} from "@/features/enterprise-admin/resources/production";
import {
  AreasResourceCreate,
  AreasResourceEdit,
  AreasResourceList,
} from "@/features/enterprise-admin/resources/areas";
import {
  PlansResourceCreate,
  PlansResourceEdit,
  PlansResourceList,
} from "@/features/enterprise-admin/resources/plans";
import {
  ProfileResourceEdit,
  ProfileResourceList,
} from "@/features/enterprise-admin/resources/profile";
import {
  WarehouseCreate,
  WarehouseEdit,
  WarehouseList,
} from "@/features/enterprise-admin/resources/warehouses";
import {
  UnitsResourceCreate,
  UnitsResourceEdit,
  UnitsResourceList,
} from "@/features/enterprise-admin/resources/units";

export function EnterpriseAdminResources() {
  return null;
}

export const enterpriseAdminResources = (
  <>
    <Resource
      name="warehouses"
      list={WarehouseList}
      create={WarehouseCreate}
      edit={WarehouseEdit}
    />
    <Resource
      name="units"
      list={UnitsResourceList}
      create={UnitsResourceCreate}
      edit={UnitsResourceEdit}
    />
    <Resource
      name="products"
      list={ProductsResourceList}
      create={ProductsResourceCreate}
      edit={ProductsResourceEdit}
    />
    <Resource
      name="production"
      list={ProductionResourceList}
      create={ProductionResourceCreate}
      edit={ProductionResourceEdit}
    />
    <Resource
      name="areas"
      list={AreasResourceList}
      create={AreasResourceCreate}
      edit={AreasResourceEdit}
    />
    <Resource
      name="plans"
      list={PlansResourceList}
      create={PlansResourceCreate}
      edit={PlansResourceEdit}
    />
    <Resource name="profile" list={ProfileResourceList} edit={ProfileResourceEdit} />
  </>
);
