"use client";

import { Edit, SimpleForm } from "react-admin";
import { cleanString } from "@/features/core/metadata/share/cleanString";
import { EDIT_PAGE_SX, MIL_FORM_SX } from "@/features/resources/shared/styles";
import { ProductionEditToolbar } from "./ProductionEditToolbar";
import { normalizeEvidenceFilesForForm } from "@/features/resources/shared/evidenceFiles";
import { useEntityVerificationPoll } from "@/features/resources/shared/useEntityVerificationPoll";
import { ProductionFormSections } from "./ProductionFormSections";

function ProductionVerificationPoll() {
  useEntityVerificationPoll("PRODUCTION");
  return null;
}

export function ProductionResourceEdit() {
  return (
    <Edit
      mutationMode="pessimistic"
      sx={EDIT_PAGE_SX}
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
          productionProvinceId: undefined,
          productionDistrictId: undefined,
          productionWardId: undefined,
        };
      }}
    >
      <SimpleForm
        sx={MIL_FORM_SX}
        defaultValues={(record: any) => {
          const parts = cleanString(record?.location).split(",").map((x) => cleanString(x));
          return {
            ...record,
            evidenceFiles: normalizeEvidenceFilesForForm(record?.evidenceFiles ?? record?.images),
            productionProvinceId: parts[0] || "",
            productionDistrictId: parts[1] || "",
            productionWardId: parts[2] || "",
          };
        }}
        toolbar={<ProductionEditToolbar />}
      >
        <ProductionVerificationPoll />
        <ProductionFormSections />
      </SimpleForm>
    </Edit>
  );
}

