"use client";

import { Create, SimpleForm } from "react-admin";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { makeDailyCode } from "@/features/resources/shared/code";
import { CREATE_PAGE_SX, MIL_FORM_SX } from "@/features/resources/shared/styles";
import { ProductionCreateToolbar } from "./ProductionCreateToolbar";
import { ProductionFormSections } from "./ProductionFormSections";

export function ProductionResourceCreate() {
  return (
    <Create
      transform={(data: any) => {
        const location = [
          cleanString(data?.productionProvinceId),
          cleanString(data?.productionDistrictId),
          cleanString(data?.productionWardId),
        ].filter(Boolean).join(", ");
        if (!location || location.split(",").filter(Boolean).length < 3) {
          throw new Error("Thiếu địa chỉ từ hồ sơ. Cập nhật vị trí kho trong hồ sơ trước.");
        }
        if (!cleanString(data?.facilityId)) throw new Error("Thiếu tên cơ sở sản xuất từ hồ sơ.");
        return {
          ...data,
          location,
          code: cleanString(data?.code) || makeDailyCode("VU"),
          status: "CREATED",
          harvestDate: null,
          productionProvinceId: undefined,
          productionDistrictId: undefined,
          productionWardId: undefined,
        };
      }}
      sx={CREATE_PAGE_SX}
    >
      <SimpleForm
        sx={MIL_FORM_SX}
        defaultValues={{
          code: makeDailyCode("VU"),
          status: "CREATED",
          newEvidenceFiles: [],
        }}
        toolbar={<ProductionCreateToolbar />}
      >
        <ProductionFormSections />
      </SimpleForm>
    </Create>
  );
}

