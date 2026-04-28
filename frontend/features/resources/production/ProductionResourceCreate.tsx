"use client";

import { Create, SimpleForm } from "react-admin";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { makeDailyCode } from "@/features/resources/shared/code";
import { CREATE_PAGE_SX, FORM_SX } from "@/features/resources/shared/styles";
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
        if (!location) throw new Error("Vị trí là bắt buộc.");
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
        sx={FORM_SX}
        defaultValues={{
          code: makeDailyCode("VU"),
          status: "CREATED",
          evidenceFiles: [],
        }}
        toolbar={<ProductionCreateToolbar />}
      >
        <ProductionFormSections />
      </SimpleForm>
    </Create>
  );
}

